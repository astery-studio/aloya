const test = require('node:test');
const assert = require('node:assert/strict');

const {
    criarAuthService
} = require('../src/services/auth.service');

function criarDadosValidos(alteracoes = {}) {
    return {
        nome: 'Carla Cristina',

        dataNascimento:
            new Date('2000-05-13T00:00:00.000Z'),

        email: 'carla@email.com',
        senha: 'senha-segura',

        dataInicioUltimaMenstruacao:
            new Date('2026-01-10T00:00:00.000Z'),

        dataFimUltimaMenstruacao:
            new Date('2026-01-14T00:00:00.000Z'),

        duracaoCicloInformada: 28,
        duracaoMenstruacaoInformada: 5,
        duracaoLuteaInformada: 14,
        menorDe16: false,
        emailResponsavelLegal: null,
        ...alteracoes
    };
}

function criarDependencias({
    usuarioExistente = null,
    falharEnvioEmail = false
} = {}) {
    const chamadas = {
        buscarUsuario: [],
        gerarHash: [],
        criarUsuario: [],
        gerarTokenSessao: [],
        criarSessao: [],
        criarConsentimentoPendente: [],
        enviarEmailConsentimento: [],
        logs: []
    };

    const usuarioCriado = {
        id: 1,
        nome: 'Carla Cristina',
        email: 'carla@email.com',
        papel: 'principal',
        statusConta: 'ativa'
    };

    const tx = {
        usuario: {
            async create(argumentos) {
                chamadas.criarUsuario.push(
                    argumentos
                );

                return usuarioCriado;
            }
        },

        sessao: {
            async create(argumentos) {
                chamadas.criarSessao.push(
                    argumentos
                );

                return {
                    id: 10,
                    ...argumentos.data
                };
            }
        }
    };

    const prisma = {
        usuario: {
            async findUnique(argumentos) {
                chamadas.buscarUsuario.push(
                    argumentos
                );

                return usuarioExistente;
            }
        },

        async $transaction(operacao) {
            return operacao(tx);
        }
    };

    const passwordService = {
        async gerarHash(senha) {
            chamadas.gerarHash.push(senha);

            return {
                senhaHash: 'hash-da-senha'
            };
        }
    };

    const tokenService = {
        gerarTokenSessao(usuario) {
            chamadas.gerarTokenSessao.push(
                usuario
            );

            return {
                token: 'token-de-sessao',
                tokenHash: 'hash-do-token',

                validadeSessao:
                    new Date(
                        '2026-12-31T23:59:59.000Z'
                    )
            };
        }
    };

    const parentalConsentService = {
        async criarPendente(
            transacao,
            dados
        ) {
            chamadas.criarConsentimentoPendente
                .push({
                    transacao,
                    dados
                });

            return {
                nomeTitular: dados.nomeTitular,

                emailResponsavelLegal:
                    dados.emailResponsavelLegal,

                linkConfirmacao:
                    'https://aloya.test/consentimento'
            };
        },

        async enviarEmail(dados) {
            chamadas.enviarEmailConsentimento
                .push(dados);

            if (falharEnvioEmail) {
                throw new Error(
                    'Falha simulada no envio.'
                );
            }
        }
    };

    const logger = {
        error(conteudo) {
            chamadas.logs.push(conteudo);
        }
    };

    const authService = criarAuthService({
        prisma,
        passwordService,
        tokenService,
        parentalConsentService,
        logger
    });

    return {
        authService,
        chamadas,
        tx
    };
}

test(
    'cria conta ativa e sessão persistida',
    async () => {
        const {
            authService,
            chamadas
        } = criarDependencias();

        const resultado =
            await authService.cadastrar(
                criarDadosValidos(),
                'Celular de teste'
            );

        assert.deepEqual(chamadas.gerarHash, [
            'senha-segura'
        ]);

        assert.equal(
            chamadas.criarUsuario.length,
            1
        );

        assert.deepEqual(
            chamadas.criarUsuario[0].data,
            {
                nome: 'Carla Cristina',

                dataNascimento:
                    new Date(
                        '2000-05-13T00:00:00.000Z'
                    ),

                email: 'carla@email.com',
                senhaHash: 'hash-da-senha',
                papel: 'principal',
                statusConta: 'ativa',
                duracaoCicloInformada: 28,
                duracaoMenstruacaoInformada: 5,
                duracaoLuteaInformada: 14,
                temaVisual: 'automatico'
            }
        );

        assert.deepEqual(chamadas.criarSessao, [
            {
                data: {
                    usuarioId: 1,

                    tokenSessaoHash:
                        'hash-do-token',

                    validadeSessao:
                        new Date(
                            '2026-12-31T23:59:59.000Z'
                        ),

                    dispositivo:
                        'Celular de teste'
                }
            }
        ]);

        assert.deepEqual(
            resultado.autenticacao,
            {
                token: 'token-de-sessao',
                tipo: 'Bearer'
            }
        );

        assert.equal(
            resultado
                .consentimentoParental
                .exigidoParaRedeApoio,
            false
        );

        assert.equal(
            chamadas
                .criarConsentimentoPendente
                .length,
            0
        );
    }
);

test(
    'aplica 14 dias como duração lútea padrão',
    async () => {
        const {
            authService,
            chamadas
        } = criarDependencias();

        await authService.cadastrar(
            criarDadosValidos({
                duracaoLuteaInformada: null
            })
        );

        assert.equal(
            chamadas
                .criarUsuario[0]
                .data
                .duracaoLuteaInformada,
            14
        );
    }
);

test(
    'rejeita cadastro quando o e-mail já está em uso',
    async () => {
        const {
            authService,
            chamadas
        } = criarDependencias({
            usuarioExistente: {
                id: 99
            }
        });

        await assert.rejects(
            authService.cadastrar(
                criarDadosValidos()
            ),
            {
                message:
                    'Este e-mail já está em uso. Tente fazer login.',

                status: 409,
                codigo:
                    'EMAIL_JA_CADASTRADO'
            }
        );

        assert.equal(
            chamadas.gerarHash.length,
            0
        );

        assert.equal(
            chamadas.criarUsuario.length,
            0
        );

        assert.equal(
            chamadas.criarSessao.length,
            0
        );
    }
);

test(
    'cria consentimento pendente quando menor informa responsável',
    async () => {
        const {
            authService,
            chamadas,
            tx
        } = criarDependencias();

        const resultado =
            await authService.cadastrar(
                criarDadosValidos({
                    dataNascimento:
                        new Date(
                            '2015-05-13T00:00:00.000Z'
                        ),

                    menorDe16: true,

                    emailResponsavelLegal:
                        'responsavel@email.com'
                })
            );

        assert.equal(
            chamadas
                .criarConsentimentoPendente
                .length,
            1
        );

        assert.deepEqual(
            chamadas
                .criarConsentimentoPendente[0],
            {
                transacao: tx,

                dados: {
                    titularMenorId: 1,
                    nomeTitular:
                        'Carla Cristina',

                    emailTitular:
                        'carla@email.com',

                    emailResponsavelLegal:
                        'responsavel@email.com'
                }
            }
        );

        assert.equal(
            chamadas
                .enviarEmailConsentimento
                .length,
            1
        );

        assert.deepEqual(
            resultado.consentimentoParental,
            {
                exigidoParaRedeApoio: true,
                solicitado: true,
                redeApoioBloqueada: true,
                emailEnviado: true,
                mensagemEnvio: null
            }
        );
    }
);

test(
    'permite cadastro do menor sem e-mail do responsável',
    async () => {
        const {
            authService,
            chamadas
        } = criarDependencias();

        const resultado =
            await authService.cadastrar(
                criarDadosValidos({
                    dataNascimento:
                        new Date(
                            '2015-05-13T00:00:00.000Z'
                        ),

                    menorDe16: true,
                    emailResponsavelLegal: null
                })
            );

        assert.equal(
            chamadas
                .criarConsentimentoPendente
                .length,
            0
        );

        assert.equal(
            chamadas
                .enviarEmailConsentimento
                .length,
            0
        );

        assert.deepEqual(
            resultado.consentimentoParental,
            {
                exigidoParaRedeApoio: true,
                solicitado: false,
                redeApoioBloqueada: true,
                emailEnviado: false,
                mensagemEnvio: null
            }
        );
    }
);

test(
    'mantém a conta criada quando o envio do consentimento falha',
    async () => {
        const {
            authService,
            chamadas
        } = criarDependencias({
            falharEnvioEmail: true
        });

        const resultado =
            await authService.cadastrar(
                criarDadosValidos({
                    dataNascimento:
                        new Date(
                            '2015-05-13T00:00:00.000Z'
                        ),

                    menorDe16: true,

                    emailResponsavelLegal:
                        'responsavel@email.com'
                })
            );

        assert.equal(resultado.usuario.id, 1);

        assert.equal(
            resultado
                .consentimentoParental
                .emailEnviado,
            false
        );

        assert.equal(
            resultado
                .consentimentoParental
                .mensagemEnvio,
            'Não foi possível enviar o pedido de autorização no momento. Tente novamente.'
        );

        assert.deepEqual(chamadas.logs, [
            {
                evento:
                    'falha_envio_consentimento_parental',

                tipoErro: 'Error'
            }
        ]);
    }
);

test(
    'não retorna senha nem hash na resposta do cadastro',
    async () => {
        const {
            authService
        } = criarDependencias();

        const resultado =
            await authService.cadastrar(
                criarDadosValidos()
            );

        assert.equal(
            'senha' in resultado.usuario,
            false
        );

        assert.equal(
            'senhaHash' in resultado.usuario,
            false
        );
    }
);