import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import { criarContraceptiveUsageService, criarAvaliadorJanelaEficacia } from '../../../../src/features/contraceptives/contraceptiveUsage.service.js';
import { criarContraceptiveUsageController } from '../../../../src/features/contraceptives/contraceptiveUsage.controller.js';
import { criarRotasUsosAnticoncepcionais } from '../../../../src/features/contraceptives/contraceptiveUsage.routes.js';
import { criarContraceptiveService } from '../../../../src/features/contraceptives/contraceptive.service.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

test('HU-023 SQLite/API: doses, timestamp, desmarcação, prazo e autorização sem alterar notificações', async () => {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-uso-hu023-'));
    const caminho = join(diretorio, 'teste.db');
    const migrations = fileURLToPath(new URL('../../../../prisma/migrations/', import.meta.url));
    const sqlite = new DatabaseSync(caminho);
    for (const nome of readdirSync(migrations, { withFileTypes: true }).filter((entrada) => entrada.isDirectory()).map((entrada) => entrada.name).sort()) {
        sqlite.exec(readFileSync(join(migrations, nome, 'migration.sql'), 'utf8'));
    }
    sqlite.close();
    const { PrismaClient } = prismaPackage;
    const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` }) });
    let agora = new Date('2026-10-09T11:02:34.567Z');
    // Prazos deste teste são fixtures técnicas, não recomendações clínicas.
    const service = criarContraceptiveUsageService(prisma, {
        relogio: () => agora, avaliarJanelaEficacia: criarAvaliadorJanelaEficacia({ 1: 60 })
    });
    let servidor;
    try {
        for (const id of [1, 2]) await prisma.usuario.create({ data: {
            id, nome: 'Teste', email: `uso-${id}@example.com`, dataNascimento: new Date('2000-01-01'),
            senhaHash: 'hash-teste', statusConta: 'ativa', papel: 'principal'
        } });
        for (const [id, usuarioId, tipo, frequencia] of [[1, 1, 'pilula', 'uso_continuo'], [2, 2, 'pilula', 'uso_continuo'], [3, 1, 'diu_hormonal', null], [4, 1, 'anel_vaginal', 'uso_21_dias']]) {
            await prisma.anticoncepcional.create({ data: {
                id, usuarioId, nome: `Método ${id}`, tipo, frequencia,
                horariosProgramados: ['08:00', '20:00'], dataInicioUso: new Date('2026-10-01'), nivelIntensidadeAlerta: 'moderado'
            } });
        }
        const criarAlerta = (instante) => prisma.notificacao.create({ data: {
            usuarioId: 1, tipoOrigem: 'anticoncepcional', origemId: 1,
            dataHoraProgramada: new Date(instante), intensidadeAlerta: 'moderado', statusEnvio: 'agendada'
        } });
        await criarAlerta('2026-10-09T11:00:00Z');
        await criarAlerta('2026-10-09T23:00:00Z');
        const alertasAntes = await prisma.notificacao.findMany({ orderBy: { id: 'asc' } });
        const app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            if (!req.headers.authorization) return res.status(401).end();
            req.usuario = { id: 1 }; next();
        });
        app.use('/api/anticoncepcionais', criarRotasUsosAnticoncepcionais({
            controller: criarContraceptiveUsageController(service), rateLimit: (_req, _res, next) => next()
        }));
        app.use(tratarErros);
        servidor = app.listen(0);
        await new Promise((res) => servidor.once('listening', res));
        const url = `http://127.0.0.1:${servidor.address().port}/api/anticoncepcionais`;
        async function put(id, confirmar, adicionais = {}, autenticado = true) {
            const resposta = await fetch(`${url}/${id}/usos`, {
                method: 'PUT', headers: { 'content-type': 'application/json', ...(autenticado ? { authorization: 'Bearer teste' } : {}) },
                body: JSON.stringify({ data: '2026-10-09', horario: '08:00', confirmar, fusoHorario: 'America/Sao_Paulo', ...adicionais })
            });
            return { status: resposta.status, dados: resposta.status === 401 ? null : await resposta.json() };
        }
        assert.equal((await put(1, true, {}, false)).status, 401);
        assert.equal((await put(2, true)).status, 404);
        assert.equal((await put(3, true)).status, 422);
        assert.equal((await put(1, true, { horario: '24:00' })).status, 422);
        assert.equal((await put(1, true, { usuarioId: 2 })).status, 422);
        assert.equal((await put(1, true, { data: '2026-10-10' })).status, 422);
        const confirmado = await put(1, true);
        assert.equal(confirmado.status, 200);
        assert.equal(confirmado.dados.uso.confirmadoEm, agora.toISOString());
        assert.equal(confirmado.dados.uso.status, 'confirmado');
        assert.equal(confirmado.dados.uso.prazoConfigurado, true);
        agora = new Date('2026-10-09T11:05:00Z');
        const repetido = await put(1, true);
        assert.equal(repetido.dados.uso.confirmadoEm, confirmado.dados.uso.confirmadoEm);
        assert.equal((await put(1, false)).dados.uso.status, 'pendente');
        agora = new Date('2026-10-09T12:01:00Z');
        assert.equal((await put(1, true)).dados.uso.status, 'foraDoPrazo');
        assert.equal((await put(1, false)).dados.uso.status, 'pendente');
        const semPrazo = await put(4, true);
        assert.equal(semPrazo.status, 200);
        assert.equal(semPrazo.dados.uso.prazoConfigurado, false);
        assert.equal(semPrazo.dados.uso.confirmacaoForaPrazo, false);
        assert.equal((await put(4, false)).dados.uso.status, 'pendente');
        const lista = await criarContraceptiveService(prisma, () => agora).listar(1, { fusoHorario: 'America/Sao_Paulo' });
        const item = lista.find((registro) => registro.id === 1);
        assert.equal(item.usosHoje[0].status, 'pendente');
        assert.equal(item.usosHoje[1].status, 'pendente');
        assert.equal(item.historico.length, 1);
        assert.equal(await prisma.usoAnticoncepcional.count(), 2);
        assert.deepEqual(await prisma.notificacao.findMany({ orderBy: { id: 'asc' } }), alertasAntes);
    } finally {
        if (servidor) await new Promise((res) => servidor.close(res));
        await prisma.$disconnect();
        assert.equal(resolve(diretorio, '..'), resolve(tmpdir()));
        assert.ok(diretorio.startsWith(join(tmpdir(), 'aloya-uso-hu023-')));
        rmSync(diretorio, { recursive: true, force: true });
    }
});

test('HU-023 preserva notificações existentes ao registrar horários concorrentes e de dias diferentes', async () => {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-uso-hu023-'));
    const caminho = join(diretorio, 'teste.db');
    const migrations = fileURLToPath(new URL('../../../../prisma/migrations/', import.meta.url));
    const sqlite = new DatabaseSync(caminho);
    for (const nome of readdirSync(migrations, { withFileTypes: true }).filter((entrada) => entrada.isDirectory()).map((entrada) => entrada.name).sort()) {
        sqlite.exec(readFileSync(join(migrations, nome, 'migration.sql'), 'utf8'));
    }
    sqlite.close();
    const { PrismaClient } = prismaPackage;
    const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` }) });
    const service = criarContraceptiveUsageService(prisma, { relogio: () => new Date('2026-10-09T16:00:00Z') });

    try {
        await prisma.usuario.create({ data: {
            id: 1, nome: 'Teste', email: 'alertas-legados@example.com', dataNascimento: new Date('2000-01-01'),
            senhaHash: 'hash-teste', statusConta: 'ativa', papel: 'principal'
        } });
        for (const [id, horariosProgramados] of [[1, ['08:00', '11:00']], [2, ['02:00', '23:00']], [3, ['08:00', '11:00']]]) {
            await prisma.anticoncepcional.create({ data: {
                id, usuarioId: 1, nome: `Método ${id}`, tipo: 'pilula', frequencia: 'uso_continuo',
                horariosProgramados, dataInicioUso: new Date('2026-10-01')
            } });
        }
        const alerta = (anticoncepcionalId, instante, adicionais = {}) => prisma.notificacao.create({ data: {
            usuarioId: 1, tipoOrigem: 'anticoncepcional', origemId: anticoncepcionalId,
            dataHoraProgramada: new Date(instante), statusEnvio: 'agendada', ...adicionais
        } });
        const confirmar = (id, horario) => service.definirConfirmacao(1, id, {
            data: '2026-10-09', horario, confirmar: true, fusoHorario: 'America/Sao_Paulo'
        });

        const oito = await alerta(1, '2026-10-09T08:00:00Z');
        const onze = await alerta(1, '2026-10-09T11:00:00Z');
        const outroDia = await alerta(1, '2026-10-10T08:00:00Z');
        await confirmar(1, '08:00');
        assert.equal((await prisma.notificacao.findUnique({ where: { id: oito.id } })).statusEnvio, 'agendada');
        assert.equal((await prisma.notificacao.findUnique({ where: { id: onze.id } })).statusEnvio, 'agendada');
        assert.equal((await prisma.notificacao.findUnique({ where: { id: outroDia.id } })).statusEnvio, 'agendada');
        await confirmar(1, '11:00');
        assert.equal((await prisma.notificacao.findUnique({ where: { id: onze.id } })).statusEnvio, 'agendada');

        // 23h BR corresponde a 02h UTC no dia seguinte, que tem uma dose própria.
        const vinteETres = await alerta(2, '2026-10-09T23:00:00Z');
        const duasDiaSeguinte = await alerta(2, '2026-10-10T02:00:00Z');
        await confirmar(2, '23:00');
        assert.equal((await prisma.notificacao.findUnique({ where: { id: vinteETres.id } })).statusEnvio, 'agendada');
        assert.equal((await prisma.notificacao.findUnique({ where: { id: duasDiaSeguinte.id } })).statusEnvio, 'agendada');

        const oitoConcorrente = await alerta(3, '2026-10-09T08:00:00Z');
        const onzeConcorrente = await alerta(3, '2026-10-09T11:00:00Z');
        const antesDaConcorrencia = await prisma.notificacao.findMany({ orderBy: { id: 'asc' } });
        const [primeiro, segundo] = await Promise.all([confirmar(3, '08:00'), confirmar(3, '11:00')]);
        assert.notEqual(primeiro.id, segundo.id);
        assert.equal((await prisma.notificacao.findUnique({ where: { id: oitoConcorrente.id } })).statusEnvio, 'agendada');
        assert.equal((await prisma.notificacao.findUnique({ where: { id: onzeConcorrente.id } })).statusEnvio, 'agendada');
        assert.equal(await prisma.usoAnticoncepcional.count({ where: { anticoncepcionalId: 3 } }), 2);
        assert.deepEqual(await prisma.notificacao.findMany({ orderBy: { id: 'asc' } }), antesDaConcorrencia);
    } finally {
        await prisma.$disconnect();
        assert.equal(resolve(diretorio, '..'), resolve(tmpdir()));
        assert.ok(diretorio.startsWith(join(tmpdir(), 'aloya-uso-hu023-')));
        rmSync(diretorio, { recursive: true, force: true });
    }
});
