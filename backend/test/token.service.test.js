const test = require('node:test');
const assert = require('node:assert/strict');

const {
    criarTokenService
} = require('../src/services/token.service');

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
                    algorithm: 'HS256'
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