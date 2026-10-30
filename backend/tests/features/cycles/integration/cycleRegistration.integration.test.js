import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import express from 'express';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { criarCycleRegistrationRoutes } from '../../../../src/features/cycles/routes/cycleRegistration.routes.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import { criarCycleRegistrationModule } from '../../../../src/features/cycles/cycleRegistration.module.js';
import { criarCalendarModule } from '../../../../src/features/calendar/calendar.module.js';

async function cenario(t) {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-hu008-'));
    const caminho = join(diretorio, 'test.db');
    const banco = new Database(caminho);
    banco.pragma('foreign_keys = ON');
    const migrations = fileURLToPath(new URL('../../../../prisma/migrations/', import.meta.url));
    for (const pasta of readdirSync(migrations, { withFileTypes: true })
        .filter((p) => p.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name)))
        banco.exec(readFileSync(join(migrations, pasta.name, 'migration.sql'), 'utf8'));
    banco.close();
    const prisma = new prismaPackage.PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` })
    });
    t.after(async () => {
        await prisma.$disconnect();
        rmSync(diretorio, { recursive: true, force: true });
    });
    for (const id of [1, 2, 3])
        await prisma.usuario.create({
            data: {
                id,
                nome: 'Teste',
                email: `teste${id}@example.com`,
                dataNascimento: new Date('2000-01-01'),
                senhaHash: 'hash',
                papel: 'principal',
                statusConta: 'ativa'
            }
        });
    const module = criarCycleRegistrationModule({
        prisma,
        agora: () => new Date('2026-10-30T12:00:00Z')
    });
    let contador = 0;
    const registrar = (corpo, chave = `operacao-${++contador}`) =>
        module.service.registrar({ usuarioId: 1, corpo, chave });
    return { prisma, module, registrar };
}

test('registra, estende, inicia novo ciclo, encerra anterior e reflete no calendário', async (t) => {
    const { prisma, registrar } = await cenario(t);
    const inicial = await registrar({ data: '2026-09-01' });
    const extensao = await registrar({ dataInicio: '2026-09-02', dataFim: '2026-09-05' });
    assert.equal(extensao.ciclo.id, inicial.ciclo.id);
    assert.equal(extensao.ciclo.duracaoMenstruacao, 5);
    const novo = await registrar({ data: '2026-09-29' });
    assert.notEqual(novo.ciclo.id, inicial.ciclo.id);
    const anterior = await prisma.registroCiclo.findUnique({ where: { id: inicial.ciclo.id } });
    assert.equal(anterior.duracaoCiclo, 28);
    assert.equal(novo.previsao.proximoInicioEstimado, '2026-10-27');
    const calendario = await criarCalendarModule({ prisma }).calendarService.buscarMes({
        usuarioId: 1,
