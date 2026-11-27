import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import express from 'express';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import { criarNotificationPreferencesRoutes } from '../../../src/features/notifications/notificationPreferences.routes.js';
import { criarNotificationPreferencesService } from '../../../src/features/notifications/notificationPreferences.service.js';
import { tratarErros } from '../../../src/shared/middleware/error.middleware.js';

test('API SQLite mantém preferências por conta e preserva escolhas em atualizações pontuais', async (t) => {
    const dir = mkdtempSync(join(tmpdir(), 'aloya-notificacoes-'));
    const caminho = join(dir, 'teste.db');
    const migrations = new URL('../../../prisma/migrations/', import.meta.url);
    const sqlite = new DatabaseSync(caminho);
    for (const nome of readdirSync(migrations, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort()) {
        sqlite.exec(readFileSync(new URL(`${nome}/migration.sql`, migrations), 'utf8'));
    }
    sqlite.close();
    const prisma = new prismaPackage.PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${caminho}` }) });
    t.after(async () => { await prisma.$disconnect(); rmSync(dir, { recursive: true, force: true }); });
    for (const id of [1, 2]) await prisma.usuario.create({ data: {
        id, nome: 'Teste', email: `conta-${id}@example.com`, dataNascimento: new Date('2000-01-01'),
        senhaHash: 'teste', statusConta: 'ativa', papel: 'principal'
    } });
    await prisma.preferenciaNotificacao.create({ data: { usuarioId: 2, horarioLembreteDiario: '18:00', antecedenciaAvisoTroca: 7 } });
    const app = express();
    app.use(express.json());
    app.use(criarNotificationPreferencesRoutes({
        Router: express.Router, service: criarNotificationPreferencesService(prisma),
        rateLimit: (_req, _res, next) => next(),
        autenticar: (req, res, next) => {
            const id = Number(req.get('authorization'));
            if (![1, 2].includes(id)) return res.sendStatus(401);
            req.usuario = { id };
            return next();
        }
    }));
    app.use(tratarErros);
    const server = app.listen(0, '127.0.0.1');
    t.after(() => new Promise((resolver) => server.close(resolver)));
    await new Promise((resolver, rejeitar) => server.once('listening', resolver).once('error', rejeitar));
    const url = `http://127.0.0.1:${server.address().port}/`;
    const chamar = (id, dados) => fetch(url, {
        method: dados ? 'PATCH' : 'GET', headers: { authorization: String(id), 'content-type': 'application/json' },
        body: dados && JSON.stringify(dados)
    });
    const salvar = (chave, valor) => chamar(1, { chave, valor });
    assert.equal((await chamar(0)).status, 401);
    assert.equal((await chamar(1, { chave: 'ciclo.diario', valor: false, usuarioId: 2 })).status, 422);
    const leituraInicial = await chamar(1);
    assert.equal(leituraInicial.headers.get('cache-control'), 'no-store');
    assert.equal((await leituraInicial.json()).preferencias.horarioLembreteDiario, '20:00');
    assert.equal(await prisma.preferenciaNotificacao.count(), 1);
    await prisma.notificacao.createMany({
        data: [1, 2].map((usuarioId) => ({
            usuarioId,
            tipoOrigem: 'lembrete_diario',
            evento: 'ciclo.diario.lembrete',
            ocorrencia: 'teste',
            dataHoraProgramada: new Date('2030-01-01')
        }))
    });
    const respostas = await Promise.all([
        salvar('ciclo.diario', false), salvar('ciclo.diario.resumoSemanal', true),
        salvar('antecedenciaProximoCiclo', 0), salvar('horarioLembreteDiario', '21:30')
    ]);
    assert.deepEqual(respostas.map((resposta) => resposta.status), [200, 200, 200, 200]);
    const { preferencias } = await (await chamar(1)).json();
    assert.equal(preferencias['ciclo.diario'], false);
    assert.equal(preferencias['ciclo.diario.resumoSemanal'], true);
    assert.equal(preferencias.antecedenciaProximoCiclo, 0);
    assert.equal(preferencias.horarioLembreteDiario, '21:30');
    const alertas = await prisma.notificacao.findMany({ orderBy: { usuarioId: 'asc' } });
    assert.deepEqual(
        alertas.map((alerta) => alerta.statusEnvio),
        ['cancelada', 'agendada']
    );
    assert.equal((await salvar('ciclo.diario', true)).status, 200);
    assert.equal((await (await chamar(1)).json()).preferencias['ciclo.diario.resumoSemanal'], true);
    assert.equal((await (await chamar(2)).json()).preferencias.horarioLembreteDiario, '18:00');
    assert.equal((await prisma.preferenciaNotificacao.findUnique({ where: { usuarioId: 2 } })).antecedenciaAvisoTroca, 7);

    const padroes = () => fetch(`${url}padroes`, { headers: { authorization: '1' } });
    await prisma.catalogoNotificacao.create({ data: { versao: 1, dados: { categorias: [] } } });
    const catalogoAtual = await (await padroes()).json();
    assert.equal(catalogoAtual.categorias.length, 4);
    assert.equal(catalogoAtual.preferencias['redeApoio.dicas.apoio'], undefined);
    assert.equal((await padroes()).status, 200);
    assert.equal(await prisma.catalogoNotificacao.count(), 2);

    const restauracao = await fetch(`${url}restaurar`, {
        method: 'POST',
        headers: { authorization: '1' }
    });
    assert.equal(restauracao.status, 200);
    const restauradas = await restauracao.json();
    assert.equal(restauradas.preferencias.horarioLembreteDiario, '20:00');
    assert.equal(restauradas.efetivas['ciclo.diario.resumoSemanal'], false);
});
