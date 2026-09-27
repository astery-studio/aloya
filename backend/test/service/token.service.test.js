/**
 * Testes de geração, finalidade, validade e leitura dos JWTs de recuperação.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarTokenService
} from '../../src/services/token.service.js';

function criarDependencias() {
    const chamadas = {
        sign: [],
        verify: []
    };

    const jwt = {
        sign(payload, secret, options) {
            chamadas.sign.push({
                payload,
                secret,
                options
            });

            return 'jwt-de-recuperacao';
        },

        decode() {
            return {
                exp: 1767229200
            };
        },

        verify(token, secret, options) {
            chamadas.verify.push({
                token,
                secret,
                options
            });

            return {
                sub: '7',
                finalidade:
                    'recuperacao_senha'
            };
        }
    };

    const crypto = {
        randomUUID() {
            return 'id-unico';
        },
        createHash(algoritmo) {
            assert.equal(
                algoritmo,
                'sha256'
            );

            return {
                update(token) {
                    assert.equal(
                        token,
                        'jwt-de-recuperacao'
                    );

                    return this;
                },

                digest(formato) {
                    assert.equal(
                        formato,
                        'hex'
                    );

                    return 'hash-do-jwt';
                }
            };
        }
    };

    const tokenService =
        criarTokenService({
            jwt,
            crypto,
            secret:
                'segredo-seguro-de-testes',
            expiresIn: '90d'
        });

    return {
        tokenService,
        chamadas,
        jwt
    };
}

test(
    'gera JWT de recuperação válido por 60 minutos',
    () => {
        const {
            tokenService,
            chamadas
        } = criarDependencias();

        const resultado =
            tokenService
                .gerarTokenRecuperacao({
                    id: 7
                });

        assert.deepEqual(chamadas.sign, [
            {
                payload: {
                    finalidade:
                        'recuperacao_senha'
                },

                secret:
                    'segredo-seguro-de-testes',

                options: {
                    subject: '7',
                    expiresIn: '60m',
                    algorithm: 'HS256',
                    jwtid: 'id-unico'
                }
            }
        ]);

        assert.deepEqual(resultado, {
            token:
                'jwt-de-recuperacao',
            tokenHash: 'hash-do-jwt',

            validadeToken:
                new Date(1767229200000)
        });
    }
);

test(
    'valida JWT destinado à recuperação de senha',
    () => {
        const {
            tokenService,
            chamadas
        } = criarDependencias();

        const resultado =
            tokenService
                .validarTokenRecuperacao(
                    'jwt-de-recuperacao'
                );

        assert.deepEqual(resultado, {
            usuarioId: 7
        });

        assert.deepEqual(
            chamadas.verify,
            [
                {
                    token:
                        'jwt-de-recuperacao',

                    secret:
                        'segredo-seguro-de-testes',

                    options: {
                        algorithms: [
                            'HS256'
                        ]
                    }
                }
            ]
        );
    }
);

test(
    'rejeita JWT com finalidade diferente',
    () => {
        const {
            tokenService,
            jwt
        } = criarDependencias();

        jwt.verify = () => ({
            sub: '7',
            finalidade: 'sessao'
        });

        assert.throws(
            () =>
                tokenService
                    .validarTokenRecuperacao(
                        'jwt-de-sessao'
                    ),
            {
                message:
                    'Token de recuperação inválido.'
            }
        );
    }
);

test('gera e resume um token de sessão', () => {
    const { tokenService, chamadas } = criarDependencias();
    const resultado = tokenService.gerarTokenSessao({
        id: 7,
        papel: 'principal'
    });

    assert.deepEqual(chamadas.sign[0], {
        payload: { papel: 'principal' },
        secret: 'segredo-seguro-de-testes',
        options: {
            subject: '7',
            expiresIn: '90d',
            algorithm: 'HS256'
        }
    });
    assert.deepEqual(resultado, {
        token: 'jwt-de-recuperacao',
        tokenHash: 'hash-do-jwt',
        validadeSessao: new Date(1767229200000)
    });
});

test('rejeita sessão sem data de expiração', () => {
    const { tokenService, jwt } = criarDependencias();
    jwt.decode = () => null;

    assert.throws(
        () => tokenService.gerarTokenSessao({ id: 7, papel: 'principal' }),
        { message: 'Não foi possível definir a validade da sessão.' }
    );
});

test('valida identidade e papel da sessão', () => {
    const { tokenService, jwt } = criarDependencias();
    jwt.verify = () => ({ sub: '7', papel: 'principal' });

    assert.deepEqual(tokenService.validarTokenSessao('jwt-de-sessao'), {
        usuarioId: 7,
        papel: 'principal'
    });

    jwt.verify = () => ({ papel: 'principal' });
    assert.throws(
        () => tokenService.validarTokenSessao('jwt-sem-sub'),
        { message: 'Token sem identificador de usuário.' }
    );
});

test('rejeita recuperação sem data de expiração', () => {
    const { tokenService, jwt } = criarDependencias();
    jwt.decode = () => ({});
    assert.throws(
        () => tokenService.gerarTokenRecuperacao({ id: 7 }),
        { message: 'Não foi possível definir a validade da recuperação.' }
    );
});
