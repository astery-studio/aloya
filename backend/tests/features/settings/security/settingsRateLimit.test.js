import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { rateLimit } from 'express-rate-limit';

import {
    criarConfiguracoesContaRateLimit,
    criarAlteracaoSenhaRateLimit,
    criarExclusaoContaRateLimit
} from '../../../../src/shared/middleware/rateLimit.middleware.js';

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

test('o limite de dispositivos permite continuar salvando preferências de notificações', async (t) => {
    const app = express();
    const opcoes = { rateLimit, janelaMs: 60_000, limite: 1, logger: { warn() {} } };
    const dispositivos = criarConfiguracoesContaRateLimit({
        ...opcoes, codigo: 'LIMITE_DISPOSITIVOS_NOTIFICACAO'
    });
    const preferencias = criarConfiguracoesContaRateLimit({
        ...opcoes, codigo: 'LIMITE_PREFERENCIAS_NOTIFICACAO'
    });
    app.use((req, _res, next) => {
        req.usuario = { id: 1 };
        next();
    });
    app.post('/dispositivos', dispositivos, (_req, res) => res.sendStatus(204));
    app.patch('/preferencias', preferencias, (_req, res) => res.sendStatus(204));
    const server = app.listen(0, '127.0.0.1');
    t.after(() => new Promise((resolver) => server.close(resolver)));
    await new Promise((resolver, rejeitar) => server.once('listening', resolver).once('error', rejeitar));
    const url = `http://127.0.0.1:${server.address().port}`;
    const registrar = () => fetch(`${url}/dispositivos`, { method: 'POST' });
    const salvar = () => fetch(`${url}/preferencias`, { method: 'PATCH' });

    assert.equal((await registrar()).status, 204);
    const bloqueio = await registrar();
    assert.equal(bloqueio.status, 429);
    assert.ok(Number(bloqueio.headers.get('Retry-After')) > 0);
    assert.equal((await bloqueio.json()).erro.codigo, 'LIMITE_DISPOSITIVOS_NOTIFICACAO');
    assert.equal((await salvar()).status, 204);
    assert.equal((await salvar()).status, 429);
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
