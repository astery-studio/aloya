import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { DatabaseSync as Database } from 'node:sqlite';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import express from 'express';

import { criarCycleEditController } from '../../../../src/features/cycles/controllers/cycleEdit.controller.js';
import { criarCycleEditRoutes } from '../../../../src/features/cycles/routes/cycleEdit.routes.js';
import { criarCycleEditService } from '../../../../src/features/cycles/services/cycleEdit.service.js';
import { criarCycleEditValidator } from '../../../../src/features/cycles/validators/cycleEdit.validator.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

const { PrismaClient } = prismaPackage;
const MIGRATION = fileURLToPath(
    new URL(
        '../../../../prisma/migrations/20260913221156_estrutura_inicial/migration.sql',
        import.meta.url
    )
);

function criarBancoTemporario() {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-edicao-ciclo-'));
    const caminho = join(diretorio, 'teste.db');
    const banco = new Database(caminho);
    banco.exec('PRAGMA foreign_keys = ON');
    banco.exec(readFileSync(MIGRATION, 'utf8'));
    banco.close();
    return { diretorio, caminho };
}

function criarPrisma(caminho) {
    const url = `file:${caminho.replaceAll('\\', '/')}`;
    return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

async function popular(prisma) {
    await prisma.usuario.createMany({
        data: [
            {
                id: 1,
                nome: 'Ana',
                dataNascimento: new Date('2000-01-01T00:00:00.000Z'),
                email: 'ana.edicao@example.com',
                senhaHash: 'hash',
                papel: 'principal',
                statusConta: 'ativa'
            },
            {
                id: 2,
                nome: 'Bia',
                dataNascimento: new Date('2000-01-01T00:00:00.000Z'),
                email: 'bia.edicao@example.com',
                senhaHash: 'hash',
                papel: 'principal',
                statusConta: 'ativa'
            }
        ]
    });

    const ciclos = [
        [1, 1, '2026-07-08', '2026-07-12', null, true],
        [2, 1, '2026-08-07', '2026-08-11', 30, false],
        [3, 1, '2026-09-04', '2026-09-08', 28, false],
        [4, 2, '2026-08-01', '2026-08-04', null, true]
    ];

    for (const [id, usuarioId, inicio, fim, duracaoCiclo, inicial] of ciclos) {
        const dataInicio = new Date(`${inicio}T00:00:00.000Z`);
        const dataFim = new Date(`${fim}T00:00:00.000Z`);
        await prisma.registroCiclo.create({
            data: {
                id,
                usuarioId,
                dataInicio,
                dataFim,
                duracaoMenstruacao: 5,
                duracaoCiclo,
                ehCicloInicial: inicial,
                diasMenstruacao: {
                    create: Array.from({ length: 5 }, (_, indice) => ({
                        data: new Date(dataInicio.getTime() + indice * 86_400_000)
                    }))
                }
            }
        });
    }

    await prisma.previsao.create({
        data: {
            usuarioId: 1,
            registroCicloBaseId: 3,
            duracaoCicloPrevista: 28,
            duracaoLuteaUsada: 14,
            duracaoMenstruacaoUsada: 5,
            fimFaseMenstrual: new Date('2026-09-08T00:00:00.000Z'),
            inicioFaseFolicular: new Date('2026-09-09T00:00:00.000Z'),
            fimFaseFolicular: new Date('2026-09-16T00:00:00.000Z'),
            dataEstimadaOvulacao: new Date('2026-09-17T00:00:00.000Z'),
            inicioFaseLutea: new Date('2026-09-18T00:00:00.000Z'),
            dataFimCicloPrevisto: new Date('2026-10-01T00:00:00.000Z'),
            inicioJanelaFertil: new Date('2026-09-12T00:00:00.000Z'),
            fimJanelaFertil: new Date('2026-09-18T00:00:00.000Z'),
            nivelConfianca: 'media'
        }
    });
}

function criarAplicacao(prisma) {
    const service = criarCycleEditService({ prisma });
    const validator = criarCycleEditValidator({
        agora: () => new Date('2026-10-29T12:00:00.000Z')
    });
    const controller = criarCycleEditController({ service, validator });

