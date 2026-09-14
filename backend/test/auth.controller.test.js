const test = require('node:test');
const assert = require('node:assert/strict');

const {
    criarAuthController
} = require('../src/controllers/auth.controller');

function criarResposta() {
    return {
        statusCode: null,
        body: null,
        contentType: null,

        status(codigo) {
            this.statusCode = codigo;

            return this;
        },

        json(conteudo) {
            this.body = conteudo;

            return this;
        },

        type(tipoConteudo) {
            this.contentType = tipoConteudo;

            return this;
        },

        send(conteudo) {
            this.body = conteudo;

            return this;
        }
    };
}

function criarController({
    validacao,
    resultadoLogin,
    erroLogin
}) {
    const chamadas = {
        validarLogin: [],
        realizarLogin: []
    };

    const authValidator = {
        validarLogin(body) {
            chamadas.validarLogin.push(body);

            return validacao;
        }
    };

    const authService = {
        async realizarLogin(dados, dispositivo) {
            chamadas.realizarLogin.push({
                dados,
                dispositivo
            });

            if (erroLogin) {
                throw erroLogin;
            }

            return resultadoLogin;
        }
    };

    const controller = criarAuthController({
        authService,
        authValidator,
        parentalConsentService: {},
        parentalConsentValidator: {}
    });

    return {
        controller,
        chamadas
    };
}

function criarControllerConsentimento({
    validacao,
    resultado,
    operacao = 'solicitar'
}) {
    const chamadas = [];
    const parentalConsentService = {
        async [operacao](...argumentos) {
            chamadas.push(argumentos);

            return resultado;
        }
    };
    const parentalConsentValidator = {
        validarSolicitacao() {
            return validacao;
        },
        validarReenvio() {
            return validacao;
        },
        validarToken() {
            return validacao;
        }
    };
    const controller = criarAuthController({
        authService: {},
        authValidator: {},
        parentalConsentService,
        parentalConsentValidator
    });

    return {
        controller,
        chamadas
    };
}

test(
    'retorna 422 quando os dados do login são inválidos',
    async () => {
        const validacao = {
            valido: false,

            erros: [
                {
                    campo: 'email',
                    mensagem: 'Informe seu e-mail.'
                }
            ],

            dados: {
                email: '',
                senha: 'senha-segura'
            }
        };

        const {
            controller,
            chamadas
        } = criarController({
            validacao
        });

        const req = {
            body: {
                email: '',
                senha: 'senha-segura'
            },

            headers: {}
        };

        const res = criarResposta();

        let erroRecebido = null;

        await controller.realizarLogin(
            req,
            res,
            function next(erro) {
                erroRecebido = erro;
            }
        );

        assert.equal(erroRecebido, null);
        assert.equal(res.statusCode, 422);

        assert.deepEqual(res.body, {
            erro: {
                codigo: 'ERRO_VALIDACAO',
                mensagem:
                    'Existem campos inválidos no login.',
                detalhes: validacao.erros
            }
        });

        assert.equal(
            chamadas.realizarLogin.length,
            0
        );
    }
);

test(
    'retorna 200 após login bem-sucedido',
    async () => {
        const dadosNormalizados = {
            email: 'carla@email.com',
            senha: 'senha-segura'
        };

        const resultadoLogin = {
            usuario: {
                id: 1,
                nome: 'Carla Cristina',
                email: 'carla@email.com',
                papel: 'principal'
            },

            autenticacao: {
                token: 'token-de-sessao',
                tipo: 'Bearer'
            }
        };

        const {
            controller,
            chamadas
        } = criarController({
            validacao: {
                valido: true,
                erros: [],
                dados: dadosNormalizados
            },

            resultadoLogin
        });

        const req = {
            body: {
                email: '  CARLA@EMAIL.COM  ',
                senha: 'senha-segura'
            },

            headers: {
                'x-device-name': 'Celular de teste'
            }
        };

        const res = criarResposta();

        let erroRecebido = null;

        await controller.realizarLogin(
            req,
            res,
            function next(erro) {
                erroRecebido = erro;
            }
        );

        assert.equal(erroRecebido, null);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.body, resultadoLogin);

        assert.deepEqual(chamadas.realizarLogin, [
            {
                dados: dadosNormalizados,
                dispositivo: 'Celular de teste'
            }
        ]);
    }
);

test(
    'limita o nome do dispositivo a 120 caracteres',
    async () => {
        const {
            controller,
            chamadas
        } = criarController({
            validacao: {
                valido: true,
                erros: [],

                dados: {
                    email: 'carla@email.com',
                    senha: 'senha-segura'
                }
            },

            resultadoLogin: {
                usuario: {},
                autenticacao: {}
            }
        });

        const req = {
            body: {
                email: 'carla@email.com',
                senha: 'senha-segura'
            },

            headers: {
                'x-device-name': 'a'.repeat(150)
            }
        };

        const res = criarResposta();

        await controller.realizarLogin(
            req,
            res,
            function next() {}
        );

        assert.equal(
            chamadas.realizarLogin[0].dispositivo.length,
            120
        );
    }
);

test(
    'encaminha erro de credenciais ao middleware global',
    async () => {
        const erroLogin =
            new Error('E-mail ou senha incorretos.');

        erroLogin.status = 401;
        erroLogin.codigo = 'CREDENCIAIS_INVALIDAS';

        const {
            controller
        } = criarController({
            validacao: {
                valido: true,
                erros: [],

                dados: {
                    email: 'carla@email.com',
                    senha: 'senha-incorreta'
                }
            },

            erroLogin
        });

        const req = {
            body: {
                email: 'carla@email.com',
                senha: 'senha-incorreta'
            },

            headers: {}
        };

        const res = criarResposta();

        let erroRecebido = null;

        await controller.realizarLogin(
            req,
            res,
            function next(erro) {
                erroRecebido = erro;
            }
        );

        assert.equal(erroRecebido, erroLogin);
        assert.equal(
            erroRecebido.mensagemUsuario,
            undefined
        );

        assert.equal(res.statusCode, null);
        assert.equal(res.body, null);
    }
);

test(
    'define mensagem pública para erro interno inesperado',
    async () => {
        const erroLogin =
            new Error('Falha interna do banco.');

        const {
            controller
        } = criarController({
            validacao: {
                valido: true,
                erros: [],

                dados: {
                    email: 'carla@email.com',
                    senha: 'senha-segura'
                }
            },

            erroLogin
        });

        const req = {
            body: {
                email: 'carla@email.com',
                senha: 'senha-segura'
            },

            headers: {}
        };

        const res = criarResposta();

        let erroRecebido = null;

        await controller.realizarLogin(
            req,
            res,
            function next(erro) {
                erroRecebido = erro;
            }
        );

        assert.equal(erroRecebido, erroLogin);

        assert.equal(
            erroRecebido.mensagemUsuario,
            'Ocorreu um erro ao realizar login. Tente novamente.'
        );

        assert.equal(res.statusCode, null);
        assert.equal(res.body, null);
    }
);