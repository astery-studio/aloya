import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarConfiguracoesContaRateLimit,
    criarAlteracaoSenhaRateLimit,
    criarExclusaoContaRateLimit
} from '../src/middlewares/rateLimit.middleware.js';

function criarRateLimitMock() {
    return (opcoes) => opcoes;
}

test('limites de configurações usam a conta autenticada como chave', () => {
    const dependencias = {
        rateLimit: criarRateLimitMock(),
        janelaMs: 900000,
        limite: 5
    };

    const limitadores = [
        criarConfiguracoesContaRateLimit(dependencias),
        criarAlteracaoSenhaRateLimit(dependencias),
        criarExclusaoContaRateLimit(dependencias)
    ];

    for (const limitador of limitadores) {
        assert.equal(
            limitador.keyGenerator({ usuario: { id: 42 } }),
            'usuario:42'
        );
    }
});

test('limites de senha e exclusão ignoram respostas bem-sucedidas', () => {
    const dependencias = {
        rateLimit: criarRateLimitMock(),
        janelaMs: 900000,
        limite: 5
    };

    assert.equal(
        criarAlteracaoSenhaRateLimit(dependencias).skipSuccessfulRequests,
        true
    );
    assert.equal(
        criarExclusaoContaRateLimit(dependencias).skipSuccessfulRequests,
        true
    );
});

test('bloqueio de senha não registra corpo nem credenciais', () => {
    let registro = null;
    const limitador = criarAlteracaoSenhaRateLimit({
        rateLimit: criarRateLimitMock(),
        janelaMs: 900000,
        limite: 5,
        logger: {
            warn(dados) {
                registro = dados;
            }
        }
    });
    const resposta = {
        statusRecebido: null,
        status(codigo) {
            this.statusRecebido = codigo;
            return this;
        },
        json() {
            return this;
        }
    };

    limitador.handler({
        method: 'PATCH',
        originalUrl: '/users/me/password',
        usuario: { id: 1 },
        body: { senhaAtual: 'segredo', novaSenha: 'outro-segredo' },
        headers: { authorization: 'Bearer token-secreto' }
    }, resposta);

    const log = JSON.stringify(registro);
    assert.equal(log.includes('segredo'), false);
    assert.equal(log.includes('token-secreto'), false);
    assert.equal(resposta.statusRecebido, 429);
});
