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

