import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { criarContraceptiveController } from '../src/features/contraceptives/contraceptive.controller.js';
import { criarRotasAnticoncepcionais } from '../src/features/contraceptives/contraceptive.routes.js';
import { criarContraceptiveService } from '../src/features/contraceptives/contraceptive.service.js';
import { criarAuthMiddleware } from '../src/middlewares/auth.middleware.js';
import { tratarErros } from '../src/middlewares/error.middleware.js';

const agora = new Date('2026-09-24T07:00:00.000Z');
const registro = {
    id: 1, usuarioId: 7, nome: 'Mercilon', tipo: 'pilula',
    horariosProgramados: ['08:00'], frequencia: 'uso_continuo',
    dataInicioUso: agora, dataValidade: null, nivelIntensidadeAlerta: 'critico',
    periodosPausa: [], criadoEm: agora
};

function criarBanco({ falhar = false } = {}) {
    return {
        sessao: { findFirst: async () => ({
            id: 3,
            usuario: { id: 7, papel: 'principal', statusConta: 'ativa' }
        }) },
        anticoncepcional: {
            create: async ({ data }) => {
                if (falhar) throw new Error('banco indisponível');
                return { ...registro, ...data };
            },
            findMany: async () => [registro]
        }
    };
}

async function comApi(banco, executar) {
    const app = express();
    const service = criarContraceptiveService(banco, () => agora);
    const controller = criarContraceptiveController(service);
    const authMiddleware = criarAuthMiddleware({
        prisma: banco,
        tokenService: {
            validarTokenSessao: () => ({ usuarioId: 7 }),
            gerarHashToken: () => 'hash-seguro'
        }
    });
    app.use(express.json());
    app.use('/api/anticoncepcionais', criarRotasAnticoncepcionais({
        autenticar: authMiddleware.autenticar,
        controller
    }));
    app.use(tratarErros);

    const servidor = app.listen(0);
    await new Promise((resolve) => servidor.once('listening', resolve));
    try {
        const { port } = servidor.address();
        return await executar(`http://127.0.0.1:${port}/api/anticoncepcionais`);
    } finally {
        await new Promise((resolve) => servidor.close(resolve));
    }
}
const autorizacao = { authorization: 'Bearer token-seguro', 'content-type': 'application/json' };

test('cadastra e lista somente após autenticação', async () => comApi(criarBanco(), async (url) => {
    const resposta = await fetch(url, { method: 'POST', headers: autorizacao, body: JSON.stringify({
        nome: 'Mercilon', tipo: 'pilula', frequenciaId: 'pilula_continuo', horarios: ['08:00']
    }) });
    assert.equal(resposta.status, 201);
    assert.equal((await resposta.json()).anticoncepcional.nome, 'Mercilon');
    assert.equal((await fetch(url, { headers: autorizacao })).status, 200);
    assert.equal((await fetch(url)).status, 401);
}));

test('normaliza erros de validação e internos', async () => {
    await comApi(criarBanco(), async (url) => assert.equal((await fetch(url, {
        method: 'POST', headers: autorizacao, body: '{}'
    })).status, 422));
    await comApi(criarBanco({ falhar: true }), async (url) => assert.equal((await fetch(url, {
        method: 'POST', headers: autorizacao, body: JSON.stringify({
            nome: 'Mercilon', tipo: 'pilula', frequenciaId: 'pilula_continuo', horarios: ['08:00']
        })
    })).status, 500));
});
