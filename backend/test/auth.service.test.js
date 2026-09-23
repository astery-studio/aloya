/**
 * Testes do login, persistência da sessão e tratamento seguro de credenciais.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarAuthService
} from '../src/services/auth.service.js';

function criarUsuarioValido(alteracoes = {}) {
    return {
        id: 1,
        nome: 'Carla Cristina',
        email: 'carla@email.com',
        senhaHash: 'hash-persistido',
        papel: 'principal',
        statusConta: 'ativa',
        ...alteracoes
    };
}

function criarDependencias({
    usuario = criarUsuarioValido(),
    senhaCorresponde = true
} = {}) {
    const chamadas = {
        buscarUsuario: [],
        compararSenha: [],
        gerarTokenSessao: [],
        criarSessao: []
    };

    const prisma = {
        usuario: {
            async findUnique(argumentos) {
                chamadas.buscarUsuario.push(argumentos);

                return usuario;
            }
        },

        sessao: {
            async create(argumentos) {
                chamadas.criarSessao.push(argumentos);

                return {
                    id: 10,
                    ...argumentos.data
                };
            }
        }
    };

    const passwordService = {
        async compararSenha(senha, senhaHash) {
            chamadas.compararSenha.push({
                senha,
                senhaHash
            });

            return senhaCorresponde;
        }
    };

    const tokenService = {
        gerarTokenSessao(usuarioRecebido) {
            chamadas.gerarTokenSessao.push(
                usuarioRecebido
            );

            return {
                token: 'token-de-sessao',
                tokenHash: 'hash-do-token',
                validadeSessao:
                    new Date('2026-12-31T23:59:59.000Z')
            };
        }
    };

    const authService = criarAuthService({
        prisma,
        passwordService,
        tokenService,
        parentalConsentService: {},
        logger: {
            error() {}
        }
    });

    return {
        authService,
        chamadas
    };
}

test(
    'autentica credenciais válidas e cria uma sessão persistida',
    async () => {
        const {
            authService,
            chamadas
        } = criarDependencias();

        const resultado =
            await authService.realizarLogin(
                {
                    email: 'carla@email.com',
                    senha: 'senha-segura'
                },
                'Celular de teste'
            );

        assert.deepEqual(chamadas.buscarUsuario, [
            {
                where: {
                    email: 'carla@email.com'
                },

                select: {
                    id: true,
                    nome: true,
                    email: true,
                    senhaHash: true,
                    papel: true,
                    statusConta: true
                }
            }
        ]);

        assert.deepEqual(chamadas.compararSenha, [
            {
                senha: 'senha-segura',
                senhaHash: 'hash-persistido'
            }
        ]);

        assert.equal(
            chamadas.gerarTokenSessao.length,
            1
        );

        assert.deepEqual(chamadas.criarSessao, [
            {
                data: {
                    usuarioId: 1,
                    tokenSessaoHash: 'hash-do-token',
                    validadeSessao:
                        new Date(
                            '2026-12-31T23:59:59.000Z'
                        ),
                    dispositivo: 'Celular de teste'
                }
            }
        ]);

        assert.deepEqual(resultado, {
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
        });
    }
);

test(
    'persiste dispositivo nulo quando ele não é informado',
    async () => {
        const {
            authService,
            chamadas
        } = criarDependencias();

        await authService.realizarLogin({
            email: 'carla@email.com',
            senha: 'senha-segura'
        });

        assert.equal(
            chamadas.criarSessao[0].data.dispositivo,
            null
        );
    }
);

test(
    'compara a senha com hash fictício quando o usuário não existe',
    async () => {
        const {
            authService,
            chamadas
        } = criarDependencias({
            usuario: null,
            senhaCorresponde: false
        });

        await assert.rejects(
            authService.realizarLogin({
                email: 'inexistente@email.com',
                senha: 'senha-segura'
            }),
            {
                message: 'E-mail ou senha incorretos.',
                status: 401,
                codigo: 'CREDENCIAIS_INVALIDAS'
            }
        );

        assert.deepEqual(chamadas.compararSenha, [
            {
                senha: 'senha-segura',
                senhaHash: null
            }
        ]);

        assert.equal(
            chamadas.gerarTokenSessao.length,
            0
        );

        assert.equal(
            chamadas.criarSessao.length,
            0
        );
    }
);

test(
    'rejeita senha incorreta com mensagem genérica',
    async () => {
        const {
            authService,
            chamadas
        } = criarDependencias({
            senhaCorresponde: false
        });

        await assert.rejects(
            authService.realizarLogin({
                email: 'carla@email.com',
                senha: 'senha-incorreta'
            }),
            {
                message: 'E-mail ou senha incorretos.',
                status: 401,
                codigo: 'CREDENCIAIS_INVALIDAS'
            }
        );

        assert.equal(
            chamadas.gerarTokenSessao.length,
            0
        );

        assert.equal(
            chamadas.criarSessao.length,
            0
        );
    }
);

test(
    'rejeita conta inativa com a mesma mensagem das credenciais inválidas',
    async () => {
        const {
            authService,
            chamadas
        } = criarDependencias({
            usuario: criarUsuarioValido({
                statusConta: 'suspensa'
            })
        });

        await assert.rejects(
            authService.realizarLogin({
                email: 'carla@email.com',
                senha: 'senha-segura'
            }),
            {
                message: 'E-mail ou senha incorretos.',
                status: 401,
                codigo: 'CREDENCIAIS_INVALIDAS'
            }
        );

        assert.equal(
            chamadas.gerarTokenSessao.length,
            0
        );

        assert.equal(
            chamadas.criarSessao.length,
            0
        );
    }
);

test(
    'não retorna hash da senha nem status interno da conta',
    async () => {
        const {
            authService
        } = criarDependencias();

        const resultado =
            await authService.realizarLogin({
                email: 'carla@email.com',
                senha: 'senha-segura'
            });

        assert.equal(
            'senhaHash' in resultado.usuario,
            false
        );

        assert.equal(
            'statusConta' in resultado.usuario,
            false
        );
    }
);
