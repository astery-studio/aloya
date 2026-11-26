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

import {
    criarContraceptiveUsageService,
    criarAvaliadorJanelaEficacia
} from '../../../../src/features/contraceptives/services/contraceptiveUsage.service.js';
import { criarContraceptiveUsageController } from '../../../../src/features/contraceptives/controllers/contraceptiveUsage.controller.js';
import { criarRotasUsosAnticoncepcionais } from '../../../../src/features/contraceptives/routes/contraceptiveUsage.routes.js';
import { criarContraceptiveService } from '../../../../src/features/contraceptives/services/contraceptive.service.js';
import { normalizarHorariosPilula } from '../../../../src/features/contraceptives/services/normalizePillSchedule.service.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

test('HU-023 SQLite/API: doses, timestamp, desmarcação, prazo e autorização sem alterar notificações', async () => {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-uso-hu023-'));
    const caminho = join(diretorio, 'teste.db');
    const migrations = fileURLToPath(new URL('../../../../prisma/migrations/', import.meta.url));
    const sqlite = new DatabaseSync(caminho);
    const nomesDasMigracoes = readdirSync(migrations, { withFileTypes: true })
        .filter((entrada) => entrada.isDirectory())
        .map((entrada) => entrada.name)
        .sort();

    for (const nome of nomesDasMigracoes) {
        sqlite.exec(readFileSync(join(migrations, nome, 'migration.sql'), 'utf8'));
    }
    sqlite.close();

    const { PrismaClient } = prismaPackage;
    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` })
    });

    let agora = new Date('2026-10-09T11:02:34.567Z');
    // Prazos deste teste são fixtures técnicas, não recomendações clínicas.
    const service = criarContraceptiveUsageService(prisma, {
        relogio: () => agora,
        avaliarJanelaEficacia: criarAvaliadorJanelaEficacia({ 1: 60 })
    });
    let servidor;

    try {
        for (const id of [1, 2])
            await prisma.usuario.create({
                data: {
                    id,
                    nome: 'Teste',
                    email: `uso-${id}@example.com`,
                    dataNascimento: new Date('2000-01-01'),
                    senhaHash: 'hash-teste',
                    statusConta: 'ativa',
                    papel: 'principal'
                }
            });

        for (const [id, usuarioId, tipo, frequencia] of [
            [1, 1, 'pilula', 'uso_continuo'],
            [2, 2, 'pilula', 'uso_continuo'],
            [3, 1, 'diu_hormonal', null],
            [4, 1, 'anel_vaginal', 'uso_21_dias']
        ]) {
            await prisma.anticoncepcional.create({
                data: {
                    id,
                    usuarioId,
                    nome: `Método ${id}`,
                    tipo,
                    frequencia,
                    horariosProgramados: ['08:00', '20:00'],
                    dataInicioUso: new Date('2026-10-01'),
                    nivelIntensidadeAlerta: 'moderado'
                }
            });
        }

        const criarAlerta = (instante) =>
            prisma.notificacao.create({
                data: {
                    usuarioId: 1,
                    tipoOrigem: 'anticoncepcional',
                    origemId: 1,
                    dataHoraProgramada: new Date(instante),
                    intensidadeAlerta: 'moderado',
                    statusEnvio: 'agendada'
                }
            });
        await criarAlerta('2026-10-09T11:00:00Z');
        await criarAlerta('2026-10-09T23:00:00Z');
        const alertasAntes = await prisma.notificacao.findMany({ orderBy: { id: 'asc' } });

        const app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            if (!req.headers.authorization) return res.status(401).end();
            req.usuario = { id: 1 };
            next();
        });
        app.use(
            '/api/anticoncepcionais',
            criarRotasUsosAnticoncepcionais({
                controller: criarContraceptiveUsageController(service),
                rateLimit: (_req, _res, next) => next()
            })
        );
        app.use(tratarErros);
        servidor = app.listen(0);
        await new Promise((res) => servidor.once('listening', res));
        const url = `http://127.0.0.1:${servidor.address().port}/api/anticoncepcionais`;

        async function put(id, confirmar, adicionais = {}, autenticado = true) {
            const resposta = await fetch(`${url}/${id}/usos`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json',
                    ...(autenticado ? { authorization: 'Bearer teste' } : {})
                },
                body: JSON.stringify({
                    data: '2026-10-09',
                    horario: '08:00',
                    confirmar,
                    fusoHorario: 'America/Sao_Paulo',
                    ...adicionais
                })
            });
            return {
                status: resposta.status,
                dados: resposta.status === 401 ? null : await resposta.json()
            };
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
        assert.equal(confirmado.dados.uso.atrasado, false);
        assert.equal(confirmado.dados.uso.prazoConfigurado, true);
        const usoId = confirmado.dados.uso.id;

        async function corrigir(id, estado, autenticado = true) {
            return fetch(`${url}/${id}/usos/${usoId}`, {
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json',
                    ...(autenticado ? { authorization: 'Bearer teste' } : {})
                },
                body: JSON.stringify({ estado, fusoHorario: 'America/Sao_Paulo' })
            });
        }

        assert.equal((await corrigir(1, 'foraDoPrazo', false)).status, 401);
        assert.equal((await corrigir(2, 'foraDoPrazo')).status, 404);
        assert.equal((await corrigir(1, 'naoConfirmado')).status, 422);

        // A correção é feita no dia seguinte e preserva a ocorrência e a confirmação originais.
        agora = new Date('2026-10-10T11:00:00Z');
        const correcao = await corrigir(1, 'foraDoPrazo');
        assert.equal(correcao.status, 200);
        assert.deepEqual((await correcao.json()).uso, {
            id: usoId,
            data: '2026-10-09',
            horarioProgramado: '08:00',
            confirmadoEm: confirmado.dados.uso.confirmadoEm,
            estado: 'foraDoPrazo'
        });
        const relido = await criarContraceptiveService(prisma, () => agora).listar(1, {
            fusoHorario: 'America/Sao_Paulo'
        });
        assert.equal(
            relido.find((registro) => registro.id === 1).historico[0].estado,
            'foraDoPrazo'
        );

        const naoUsou = await corrigir(1, 'naoUsei');
        assert.equal(naoUsou.status, 200);
        const { uso: usoNaoRealizado } = await naoUsou.json();
        assert.equal(usoNaoRealizado.estado, 'naoUsei');
        assert.equal(usoNaoRealizado.confirmadoEm, null);
        assert.equal((await corrigir(1, 'naoSei')).status, 422);

        const restaurado = await corrigir(1, 'confirmado');
        assert.equal(restaurado.status, 200);
        assert.equal((await restaurado.json()).uso.confirmadoEm, confirmado.dados.uso.confirmadoEm);

        agora = new Date('2026-10-09T11:05:00Z');
        const repetido = await put(1, true);
        assert.equal(repetido.dados.uso.confirmadoEm, confirmado.dados.uso.confirmadoEm);
        const desmarcado = await put(1, false);
        assert.equal(desmarcado.dados.uso.status, 'pendente');
        assert.equal(desmarcado.dados.uso.atrasado, true);

        agora = new Date('2026-10-09T12:01:00Z');
        assert.equal((await put(1, true)).dados.uso.status, 'foraDoPrazo');
        assert.equal((await put(1, false)).dados.uso.status, 'pendente');

        const semPrazo = await put(4, true);
        assert.equal(semPrazo.status, 200);
        assert.equal(semPrazo.dados.uso.prazoConfigurado, false);
        assert.equal(semPrazo.dados.uso.confirmacaoForaPrazo, false);
        assert.equal((await put(4, false)).dados.uso.status, 'pendente');

        const lista = await criarContraceptiveService(prisma, () => agora).listar(1, {
            fusoHorario: 'America/Sao_Paulo'
        });
        const item = lista.find((registro) => registro.id === 1);
        assert.equal(item.usosHoje[0].status, 'pendente');
        assert.equal(item.usosHoje[1].status, 'pendente');
        assert.equal(item.historico.length, 1);
        assert.equal(await prisma.usoAnticoncepcional.count(), 2);
        assert.deepEqual(
            await prisma.notificacao.findMany({ orderBy: { id: 'asc' } }),
            alertasAntes
        );

        async function registrarUso(id, data, horario, estado = 'confirmado') {
            return fetch(`${url}/${id}/usos`, {
                method: 'PATCH',
                headers: { 'content-type': 'application/json', authorization: 'Bearer teste' },
                body: JSON.stringify({ estado, data, horario, fusoHorario: 'America/Sao_Paulo' })
            });
        }

        assert.equal((await registrarUso(1, '2026-10-10', '20:00')).status, 422);
        assert.equal((await registrarUso(1, '2026-10-08', '21:00')).status, 422);
        assert.equal((await registrarUso(2, '2026-10-08', '20:00')).status, 404);

        const criado = await registrarUso(1, '2026-10-08', '20:00');
        assert.equal(criado.status, 200);
        const { uso: usoRetroativo } = await criado.json();
        assert.equal(usoRetroativo.confirmadoEm, null);
        assert.equal(usoRetroativo.horarioProgramado, '20:00');
        assert.equal(usoRetroativo.estado, 'confirmado');
        const repeticao = await registrarUso(1, '2026-10-08', '20:00');
        assert.equal((await repeticao.json()).uso.id, usoRetroativo.id);
        const recarregado = await criarContraceptiveService(prisma, () => agora).listar(1);
        assert.deepEqual(
            recarregado
                .find((metodo) => metodo.id === 1)
                .historico.find((uso) => uso.id === usoRetroativo.id),
            usoRetroativo
        );

        const novoNaoUsou = await registrarUso(1, '2026-10-07', '20:00', 'naoUsei');
        assert.equal(novoNaoUsou.status, 200);
        const { uso: historicoNaoUsei } = await novoNaoUsou.json();
        assert.equal(historicoNaoUsei.estado, 'naoUsei');
        assert.equal(historicoNaoUsei.confirmadoEm, null);
        assert.equal(
            (await criarContraceptiveService(prisma, () => agora).listar(1))
                .find((metodo) => metodo.id === 1)
                .historico.find((uso) => uso.id === historicoNaoUsei.id).estado,
            'naoUsei'
        );

        const apagar = (id, autenticado = true) =>
            fetch(`${url}/${id}/usos/${historicoNaoUsei.id}`, {
                method: 'DELETE',
                headers: autenticado ? { authorization: 'Bearer teste' } : {}
            });
        assert.equal((await apagar(1, false)).status, 401);
        assert.equal((await apagar(2)).status, 404);
        assert.equal((await apagar(1)).status, 204);
        const aposExclusao = (await criarContraceptiveService(prisma, () => agora).listar(1)).find(
            (metodo) => metodo.id === 1
        );
        assert.deepEqual(aposExclusao.horarios, ['08:00', '20:00']);
        assert.equal(
            aposExclusao.historico.some((uso) => uso.id === historicoNaoUsei.id),
            false
        );
        assert.equal(
            aposExclusao.historico.some((uso) => uso.id === usoRetroativo.id),
            true
        );
        assert.deepEqual(
            await prisma.notificacao.findMany({ orderBy: { id: 'asc' } }),
            alertasAntes
        );

        assert.equal(await normalizarHorariosPilula(prisma, agora), 2);
        assert.equal(await normalizarHorariosPilula(prisma, agora), 0);
        const normalizado = (await criarContraceptiveService(prisma, () => agora).listar(1)).find(
            (metodo) => metodo.id === 1
        );
        assert.deepEqual(normalizado.horarios, ['08:00']);
        assert.deepEqual(normalizado.historico, aposExclusao.historico);
        const alertas = await prisma.notificacao.findMany({
            where: { origemId: 1 },
            orderBy: { id: 'asc' }
        });
        assert.equal(alertas[1].statusEnvio, 'cancelada');
        assert.equal(alertas[2].statusEnvio, 'agendada');
        assert.equal(alertas[2].dataHoraProgramada.toISOString(), '2026-10-10T08:00:00.000Z');

        // 07h no horário local, antes da dose programada para 08h.
        agora = new Date('2026-10-10T10:00:00Z');
        const registroDeHoje = await registrarUso(1, '2026-10-10', '08:00');
        assert.equal(registroDeHoje.status, 200);
        const { uso: usoHoje } = await registroDeHoje.json();
        assert.equal(usoHoje.estado, 'confirmado');
        assert.equal((await registrarUso(1, '2026-10-10', '20:00')).status, 422);

        const correcaoDeHoje = await fetch(`${url}/1/usos/${usoHoje.id}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json', authorization: 'Bearer teste' },
            body: JSON.stringify({ estado: 'naoUsei', fusoHorario: 'America/Sao_Paulo' })
        });
        assert.equal(correcaoDeHoje.status, 200);
        assert.equal((await correcaoDeHoje.json()).uso.estado, 'naoUsei');
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
    const nomesDasMigracoes = readdirSync(migrations, { withFileTypes: true })
        .filter((entrada) => entrada.isDirectory())
        .map((entrada) => entrada.name)
        .sort();

    for (const nome of nomesDasMigracoes) {
        sqlite.exec(readFileSync(join(migrations, nome, 'migration.sql'), 'utf8'));
    }
    sqlite.close();

    const { PrismaClient } = prismaPackage;
    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` })
    });
    const service = criarContraceptiveUsageService(prisma, {
        relogio: () => new Date('2026-10-09T16:00:00Z')
    });

    try {
        await prisma.usuario.create({
            data: {
                id: 1,
                nome: 'Teste',
                email: 'alertas-legados@example.com',
                dataNascimento: new Date('2000-01-01'),
                senhaHash: 'hash-teste',
                statusConta: 'ativa',
                papel: 'principal'
            }
        });

        const horariosPorMetodo = [
            [1, ['08:00', '11:00']],
            [2, ['02:00', '23:00']],
            [3, ['08:00', '11:00']]
        ];
        for (const [id, horariosProgramados] of horariosPorMetodo) {
            await prisma.anticoncepcional.create({
                data: {
                    id,
                    usuarioId: 1,
                    nome: `Método ${id}`,
                    tipo: 'pilula',
                    frequencia: 'uso_continuo',
                    horariosProgramados,
                    dataInicioUso: new Date('2026-10-01')
                }
            });
        }

        const alerta = (anticoncepcionalId, instante, adicionais = {}) =>
            prisma.notificacao.create({
                data: {
                    usuarioId: 1,
                    tipoOrigem: 'anticoncepcional',
                    origemId: anticoncepcionalId,
                    dataHoraProgramada: new Date(instante),
                    statusEnvio: 'agendada',
                    ...adicionais
                }
            });

        async function verificarAlertaAgendado(id) {
            const notificacao = await prisma.notificacao.findUnique({ where: { id } });
            assert.equal(notificacao.statusEnvio, 'agendada');
        }

        const confirmar = (id, horario) =>
            service.definirConfirmacao(1, id, {
                data: '2026-10-09',
                horario,
                confirmar: true,
                fusoHorario: 'America/Sao_Paulo'
            });

        const oito = await alerta(1, '2026-10-09T08:00:00Z');
        const onze = await alerta(1, '2026-10-09T11:00:00Z');
        const outroDia = await alerta(1, '2026-10-10T08:00:00Z');
        await confirmar(1, '08:00');
        await verificarAlertaAgendado(oito.id);
        await verificarAlertaAgendado(onze.id);
        await verificarAlertaAgendado(outroDia.id);

        await confirmar(1, '11:00');
        await verificarAlertaAgendado(onze.id);

        // 23h BR corresponde a 02h UTC no dia seguinte, que tem uma dose própria.
        const vinteETres = await alerta(2, '2026-10-09T23:00:00Z');
        const duasDiaSeguinte = await alerta(2, '2026-10-10T02:00:00Z');
        await confirmar(2, '23:00');
        await verificarAlertaAgendado(vinteETres.id);
        await verificarAlertaAgendado(duasDiaSeguinte.id);

        const oitoConcorrente = await alerta(3, '2026-10-09T08:00:00Z');
        const onzeConcorrente = await alerta(3, '2026-10-09T11:00:00Z');
        const antesDaConcorrencia = await prisma.notificacao.findMany({ orderBy: { id: 'asc' } });
        const [primeiro, segundo] = await Promise.all([
            confirmar(3, '08:00'),
            confirmar(3, '11:00')
        ]);
        assert.notEqual(primeiro.id, segundo.id);
        await verificarAlertaAgendado(oitoConcorrente.id);
        await verificarAlertaAgendado(onzeConcorrente.id);
        assert.equal(
            await prisma.usoAnticoncepcional.count({ where: { anticoncepcionalId: 3 } }),
            2
        );
        assert.deepEqual(
            await prisma.notificacao.findMany({ orderBy: { id: 'asc' } }),
            antesDaConcorrencia
        );
    } finally {
        await prisma.$disconnect();
        assert.equal(resolve(diretorio, '..'), resolve(tmpdir()));
        assert.ok(diretorio.startsWith(join(tmpdir(), 'aloya-uso-hu023-')));
        rmSync(diretorio, { recursive: true, force: true });
    }
});
