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
import { criarContraceptiveController } from '../../../../src/features/contraceptives/controllers/contraceptive.controller.js';
import { criarContraceptiveService } from '../../../../src/features/contraceptives/services/contraceptive.service.js';
import { criarContraceptiveUsageService } from '../../../../src/features/contraceptives/services/contraceptiveUsage.service.js';
import { criarRotasAnticoncepcionais } from '../../../../src/features/contraceptives/routes/contraceptive.routes.js';
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

test('grava os usos confirmados entre o início e hoje e mantém as correções', async () => {
    const { diretorio, caminho } = criarBancoTemporario();
    const adapter = new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` });
    const prisma = new PrismaClient({ adapter });

    try {
        const usuaria = await prisma.usuario.create({
            data: {
                nome: 'Usuária Teste',
                dataNascimento: new Date('2000-01-01T00:00:00Z'),
                email: 'inicio@example.com',
                senhaHash: 'hash-de-teste',
                papel: 'principal',
                statusConta: 'ativa'
            }
        });
        // Em São Paulo ainda é dia 8, mesmo quando a data UTC já mudou para o dia 9.
        const relogio = () => new Date('2026-10-09T01:00:00Z');
        const fusoHorario = 'America/Sao_Paulo';
        const service = criarContraceptiveService(prisma, relogio);
        const serviceUsos = criarContraceptiveUsageService(prisma, { relogio });
        const cadastro = await service.cadastrar(usuaria.id, {
            nome: 'Método Teste',
            tipo: 'pilula',
            frequenciaId: 'pilula_21_7',
            horarios: ['08:00'],
            dataPrimeiroUso: '2026-09-10'
        }, { fusoHorario });

        const salvo = await prisma.anticoncepcional.findUnique({ where: { id: cadastro.id } });
        assert.equal(salvo.dataInicioUso.toISOString(), '2026-09-10T00:00:00.000Z');
        assert.equal(cadastro.historico.length, 22);
        assert.equal(cadastro.historico.at(-1).data, '2026-09-10');
        assert.deepEqual(cadastro.historico.slice(0, 2).map(({ data }) => data), ['2026-10-08', '2026-09-30']);
        assert.ok(cadastro.historico.every(({ estado, confirmadoEm }) => estado === 'confirmado' && confirmadoEm === null));
        assert.equal(cadastro.usosHoje[0].status, 'confirmado');

        const [recarregado] = await service.listar(usuaria.id, { fusoHorario });
        assert.deepEqual(recarregado.historico, cadastro.historico);

        const primeiroUso = recarregado.historico.at(-1);
        const segundoUso = recarregado.historico.at(-2);
        await serviceUsos.corrigirHistorico(usuaria.id, cadastro.id, primeiroUso.id, {
            estado: 'naoUsei', fusoHorario
        });
        await serviceUsos.apagarRegistroHistorico(usuaria.id, cadastro.id, segundoUso.id);

        const diaSeguinte = criarContraceptiveService(prisma, () => agora);
        const [atualizado] = await diaSeguinte.listar(usuaria.id, { fusoHorario });
        assert.equal(atualizado.historico.at(-1).estado, 'naoUsei');
        assert.equal(atualizado.historico.some(({ id }) => id === segundoUso.id), false);
        assert.equal(atualizado.usosHoje[0].data, '2026-10-09');
        assert.equal(atualizado.usosHoje[0].status, 'pendente');

        const criarUsoAntesDoInicio = () => serviceUsos.corrigirHistorico(usuaria.id, cadastro.id, undefined, {
            data: '2026-09-09', horario: '08:00', estado: 'confirmado', fusoHorario
        });
        await assert.rejects(criarUsoAntesDoInicio, { status: 422, codigo: 'USO_ANTES_DO_INICIO' });

        const legado = await prisma.usoAnticoncepcional.create({
            data: {
                anticoncepcionalId: cadastro.id,
                dataUsoProgramado: new Date('2026-09-08T00:00:00.000Z'),
                horarioProgramado: '08:00',
                statusUso: 'confirmado'
            }
        });
        const corrigido = await serviceUsos.corrigirHistorico(usuaria.id, cadastro.id, legado.id, {
            estado: 'naoUsei', fusoHorario
        });
        assert.equal(corrigido.estado, 'naoUsei');
        await serviceUsos.apagarRegistroHistorico(usuaria.id, cadastro.id, legado.id);

        const editado = await service.editar(usuaria.id, cadastro.id, {
            nome: cadastro.nome,
            tipo: cadastro.tipo,
            frequenciaId: cadastro.frequenciaId,
            horarios: cadastro.horarios,
            intensidadeAlerta: cadastro.intensidadeAlerta,
            dataPrimeiroUso: '2026-09-09'
        });
        assert.deepEqual(editado.periodosPausa[0], { inicio: '2026-09-30', fim: '2026-10-06' });

        const [depoisDaEdicao] = await service.listar(usuaria.id, { fusoHorario });
        assert.deepEqual(depoisDaEdicao.historico, atualizado.historico);
        assert.equal((await criarUsoAntesDoInicio()).estado, 'confirmado');
    } finally {
        await prisma.$disconnect();
        removerBancoTemporario(diretorio);
    }
});

test('lista registros removidos e só apaga definitivamente os que pertencem à sessão', async () => {
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
        app.use('/anticoncepcionais', criarRotasAnticoncepcionais({
            autenticar(requisicao, resposta, proximo) {
                if (requisicao.headers.authorization !== 'Bearer teste') return resposta.status(401).end();
                requisicao.usuario = { id: 1 };
                proximo();
            },
            controller,
            edicaoRateLimit: (_requisicao, _resposta, proximo) => proximo()
        }));
        app.use(tratarErros);
        servidor = app.listen(0, '127.0.0.1');
        await once(servidor, 'listening');
        const url = `http://127.0.0.1:${servidor.address().port}/anticoncepcionais`;
        const quantidadeAntes = await prisma.usoAnticoncepcional.count();

        const headers = { authorization: 'Bearer teste' };
        const padrao = await fetch(url, { headers });
        const padraoCorpo = await padrao.json();
        assert.equal(padrao.status, 200);
        assert.deepEqual(padraoCorpo.anticoncepcionais.map(({ id }) => id), [10, 11]);

        const completa = await fetch(`${url}?incluirRemovidos=true&fusoHorario=America%2FSao_Paulo&usuarioId=2`, { headers });
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

        await prisma.anticoncepcional.update({ where: { id: 20 }, data: { ativo: false } });
        await prisma.notificacao.createMany({
            data: [1, 2].map((usuarioId) => ({
                usuarioId,
                tipoOrigem: 'anticoncepcional',
                origemId: 12,
                dataHoraProgramada: agora,
                statusEnvio: 'cancelada'
            }))
        });

        const apagar = (id, autenticado = true) => fetch(`${url}/${id}/definitivo`, {
            method: 'DELETE',
            headers: autenticado ? headers : {}
        });
        assert.equal((await apagar(12, false)).status, 401);
        assert.equal((await apagar(10)).status, 404);
        assert.equal((await apagar(20)).status, 404);
        assert.equal((await apagar(12)).status, 204);
        assert.equal((await apagar(12)).status, 404);

        assert.equal(await prisma.anticoncepcional.count(), 3);
        assert.equal(await prisma.usoAnticoncepcional.count({ where: { anticoncepcionalId: 12 } }), 0);
        const alertasRestantes = await prisma.notificacao.findMany({ where: { origemId: 12 } });
        assert.deepEqual(alertasRestantes.map(({ usuarioId }) => usuarioId), [2]);

        const depois = await fetch(`${url}?incluirRemovidos=true`, { headers });
        const { anticoncepcionais: restantes } = await depois.json();
        assert.equal(restantes.some(({ id }) => id === 12), false);
    } finally {
        if (servidor) await new Promise((concluir, rejeitar) => servidor.close((erro) => erro ? rejeitar(erro) : concluir()));
        await prisma.$disconnect();
        removerBancoTemporario(diretorio);
    }
});
