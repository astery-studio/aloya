import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import express from 'express';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import { criarContraceptiveController } from '../../../../src/features/contraceptives/contraceptive.controller.js';
import { criarContraceptiveService } from '../../../../src/features/contraceptives/contraceptive.service.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

const { PrismaClient } = prismaPackage;
const migrations = fileURLToPath(new URL('../../../../prisma/migrations/', import.meta.url));
const agora = new Date('2026-10-09T10:00:00.000Z');

function criarBancoTemporario() {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-listagem-hu019-'));
    const caminho = join(diretorio, 'teste.db');
    const banco = new DatabaseSync(caminho);
    try {
        for (const nome of readdirSync(migrations, { withFileTypes: true })
            .filter((entrada) => entrada.isDirectory()).map((entrada) => entrada.name).sort()) {
            banco.exec(readFileSync(join(migrations, nome, 'migration.sql'), 'utf8'));
        }
    } finally {
        banco.close();
    }
    return { diretorio, caminho };
}

function removerBancoTemporario(diretorio) {
    const destino = resolve(diretorio);
    const base = resolve(tmpdir());
    assert.equal(resolve(destino, '..'), base);
    assert.ok(destino.startsWith(join(base, 'aloya-listagem-hu019-')));
    rmSync(destino, { recursive: true, force: true });
}

test('HU-019 GET com SQLite real preserva usos, proprietário e remoção lógica sem gravar', async () => {
    const { diretorio, caminho } = criarBancoTemporario();
    const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` }) });
    let servidor;

    try {
        for (const id of [1, 2]) {
            await prisma.usuario.create({ data: {
                id,
                nome: `Usuária ${id}`,
                dataNascimento: new Date('2000-01-01T00:00:00Z'),
                email: `listagem-${id}@example.com`,
                senhaHash: 'hash-de-teste',
                papel: 'principal',
                statusConta: 'ativa'
            } });
        }

        for (const [id, usuarioId, horario, ativo] of [
            [10, 1, '20:00', true],
            [11, 1, '08:00', true],
            [12, 1, '11:00', false],
            [20, 2, '09:00', true]
        ]) {
            await prisma.anticoncepcional.create({ data: {
                id, usuarioId, nome: `Método ${id}`, tipo: 'pilula',
                horariosProgramados: [horario], frequencia: 'uso_continuo',
                dataInicioUso: new Date('2026-09-01T00:00:00Z'),
                ativo, removidoEm: ativo ? null : new Date('2026-10-08T10:00:00Z')
            } });
        }

        const confirmado = await prisma.usoAnticoncepcional.create({ data: {
            anticoncepcionalId: 11,
            dataUsoProgramado: new Date('2026-10-09T00:00:00Z'),
            horarioProgramado: '08:00',
            horarioRealConfirmacao: new Date('2026-10-09T11:02:34.567Z'),
            statusUso: 'confirmado',
            confirmacaoForaPrazo: true
        } });
        await prisma.usoAnticoncepcional.create({ data: {
            anticoncepcionalId: 12,
            dataUsoProgramado: new Date('2026-10-07T00:00:00Z'),
            horarioProgramado: '11:00',
            statusUso: 'nao_confirmado'
        } });
        await prisma.usoAnticoncepcional.create({ data: {
            anticoncepcionalId: 20,
            dataUsoProgramado: new Date('2026-10-09T00:00:00Z'),
            horarioProgramado: '09:00',
            statusUso: 'confirmado',
            horarioRealConfirmacao: agora
        } });

        const controller = criarContraceptiveController(criarContraceptiveService(prisma, () => agora));
        const app = express();
        // Identidade injetada pelo middleware: parâmetros de listagem não mudam o titular.
        app.get('/anticoncepcionais', (requisicao, _resposta, proximo) => {
            requisicao.usuario = { id: 1 };
            proximo();
        }, controller.listar);
        app.use(tratarErros);
        servidor = app.listen(0, '127.0.0.1');
        await once(servidor, 'listening');
        const url = `http://127.0.0.1:${servidor.address().port}/anticoncepcionais`;
        const quantidadeAntes = await prisma.usoAnticoncepcional.count();

        const padrao = await fetch(url);
        const padraoCorpo = await padrao.json();
        assert.equal(padrao.status, 200);
        assert.deepEqual(padraoCorpo.anticoncepcionais.map(({ id }) => id), [10, 11]);

        const completa = await fetch(`${url}?incluirRemovidos=true&fusoHorario=America%2FSao_Paulo&usuarioId=2`);
        const { anticoncepcionais } = await completa.json();
        assert.equal(completa.status, 200);
        assert.deepEqual(anticoncepcionais.map(({ id }) => id), [11, 10, 12]);
        const metodoConfirmado = anticoncepcionais.find(({ id }) => id === 11);
        assert.equal(metodoConfirmado.usosHoje[0].id, String(confirmado.id));
        assert.equal(metodoConfirmado.usosHoje[0].status, 'foraDoPrazo');
        assert.equal(metodoConfirmado.historico[0].confirmadoEm, '2026-10-09T11:02:34.567Z');
        const removido = anticoncepcionais.find(({ id }) => id === 12);
        assert.equal(removido.ativo, false);
        assert.deepEqual(removido.usosHoje, []);
        assert.equal(removido.historico[0].estado, 'naoConfirmado');
        assert.equal(await prisma.usoAnticoncepcional.count(), quantidadeAntes);
        assert.equal(await prisma.anticoncepcional.count(), 4);
    } finally {
        if (servidor) await new Promise((concluir, rejeitar) => servidor.close((erro) => erro ? rejeitar(erro) : concluir()));
        await prisma.$disconnect();
        removerBancoTemporario(diretorio);
    }
});
