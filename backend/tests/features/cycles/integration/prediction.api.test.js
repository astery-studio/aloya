import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';

import { criarPredictionController } from '../../../../src/features/cycles/controllers/prediction.controller.js';
import { criarPredictionRoutes } from '../../../../src/features/cycles/routes/prediction.routes.js';
import { criarPredictionService } from '../../../../src/features/cycles/services/prediction.service.js';
import { criarAuthMiddleware } from '../../../../src/shared/middleware/auth.middleware.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

async function comApi(executar) {
    let usuarioConsultado;
    const banco = {
        sessao: { findFirst: async () => ({
            id: 2, usuario: { id: 7, papel: 'principal', statusConta: 'ativa' }
        }) },
        usuario: { findUnique: async ({ where }) => {
            usuarioConsultado = where.id;
            return {
                duracaoCicloInformada: 28, duracaoMenstruacaoInformada: 5,
                duracaoLuteaInformada: 14,
                registrosCiclo: [{ dataInicio: new Date('2026-10-01T00:00:00Z'), dataFim: null }]
            };
        } }
    };
    const service = criarPredictionService({ banco, prisma: banco, agora: () => new Date('2026-10-05T12:00:00Z') });
    const controller = criarPredictionController({ predictionService: service });
    const auth = criarAuthMiddleware({ prisma: banco, tokenService: {
        validarTokenSessao: () => ({ usuarioId: 7 }), gerarHashToken: () => 'hash'
    } });
    const app = express();
    app.use('/cycles', criarPredictionRoutes({
        Router: express.Router, autenticar: auth.autenticar, controller
    }));
    app.use(tratarErros);
    const servidor = app.listen(0);
    await new Promise((resolve) => servidor.once('listening', resolve));
    try {
        const url = `http://127.0.0.1:${servidor.address().port}/cycles/prediction`;
        await executar(url, () => usuarioConsultado);
    } finally {
        await new Promise((resolve) => servidor.close(resolve));
    }
}

test('protege a previsão e isola a consulta pela sessão', async () => comApi(async (url, usuario) => {
    assert.equal((await fetch(url)).status, 401);
    const resposta = await fetch(`${url}?usuarioId=99`, {
        headers: { authorization: 'Bearer token-seguro' }
    });
    assert.equal(resposta.status, 200);
    assert.equal(usuario(), 7);
    assert.equal((await resposta.json()).previsao.proximoInicioEstimado, '2026-10-29');
}));
