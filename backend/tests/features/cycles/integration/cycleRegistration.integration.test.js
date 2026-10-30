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
        mes: '2026-09'
    });
    assert.equal(calendario.diasMenstruacao.length, 6);
    assert.equal(calendario.possuiCiclos, true);
});

test('reenvio offline é idempotente, isolado por conta e rejeita chave reutilizada', async (t) => {
    const { prisma, registrar, module } = await cenario(t);
    const primeiro = await registrar({ data: '2026-10-01' }, 'chave-offline-001');
    const repetido = await registrar(
        { dataInicio: '2026-10-01', dataFim: '2026-10-01' },
        'chave-offline-001'
    );
    assert.equal(repetido.repetida, true);
    assert.deepEqual(repetido.ciclo, primeiro.ciclo);
    assert.equal(await prisma.diaMenstruacao.count(), 1);
    await assert.rejects(() => registrar({ data: '2026-10-02' }, 'chave-offline-001'), {
        codigo: 'CHAVE_SINCRONIZACAO_REUTILIZADA'
    });
    await assert.rejects(() => registrar({ data: '2026-10-01' }), {
        codigo: 'CONFLITO_REGISTRO_MENSTRUAL'
    });
    await module.service.registrar({
        usuarioId: 2,
        chave: 'chave-offline-001',
        corpo: { data: '2026-10-01' }
    });
    assert.equal(await prisma.registroCiclo.count(), 2);
});

test('falha no recibo reverte dias, ciclos e notificações; mesma chave permite tentar novamente', async (t) => {
    const { prisma, registrar } = await cenario(t);
    await prisma.$executeRawUnsafe(
        `CREATE TRIGGER falha_recibo BEFORE INSERT ON sincronizacoes_menstruais BEGIN SELECT RAISE(ABORT, 'falha simulada'); END;`
    );
    await assert.rejects(() => registrar({ data: '2026-10-01' }, 'operacao-retry'));
    assert.equal(await prisma.diaMenstruacao.count(), 0);
    assert.equal(await prisma.registroCiclo.count(), 0);
    assert.equal(await prisma.notificacao.count(), 0);
    await prisma.$executeRawUnsafe('DROP TRIGGER falha_recibo');
    assert.equal((await registrar({ data: '2026-10-01' }, 'operacao-retry')).repetida, false);
});

test('compartilhamento revalida permissões, não notifica sem autorização e não duplica eventos', async (t) => {
    const { prisma, registrar, module } = await cenario(t);
    const vinculo = await prisma.vinculoRedeApoio.create({
        data: {
            titularId: 1,
            contatoId: 2,
            emailConvidado: 'teste2@example.com',
            status: 'ativo',
            permissoesIndividuais: ['geral.historico_ciclo']
        }
    });
    await prisma.vinculoRedeApoio.create({
        data: {
            titularId: 1,
            contatoId: 3,
            emailConvidado: 'teste3@example.com',
            status: 'ativo',
            permissoesIndividuais: ['geral.fase_atual']
        }
    });
    await registrar({ data: '2026-10-01' }, 'operacao-compartilhada');
    await registrar({ data: '2026-10-01' }, 'operacao-compartilhada');
    assert.equal(await prisma.notificacao.count(), 1);
    assert.equal(
        (await module.sharingService.buscar({ contatoId: 2, titularId: '1' })).ciclos.length,
        1
    );
    await assert.rejects(() => module.sharingService.buscar({ contatoId: 3, titularId: '1' }), {
        status: 404
    });
    await prisma.vinculoRedeApoio.update({
        where: { id: vinculo.id },
        data: { status: 'revogado' }
    });
    await assert.rejects(() => module.sharingService.buscar({ contatoId: 2, titularId: '1' }), {
        status: 404
    });
    await registrar({ data: '2026-10-02' });
    assert.equal(await prisma.notificacao.count(), 1);
});

test('marcações retroativas preservam a cronologia e não unem ciclos separados', async (t) => {
    const { registrar, prisma } = await cenario(t);
    await registrar({ dataInicio: '2026-10-10', dataFim: '2026-10-12' });
    const prependido = await registrar({ data: '2026-10-09' });
    assert.equal(prependido.ciclo.dataInicio, '2026-10-09');
    assert.equal(await prisma.registroCiclo.count(), 1);
    await registrar({ data: '2026-10-16' });
    await assert.rejects(() => registrar({ dataInicio: '2026-10-13', dataFim: '2026-10-15' }), {
        status: 409
    });
    await assert.rejects(() => registrar({ data: '2026-11-01' }), { status: 422 });
    assert.equal(await prisma.registroCiclo.count(), 2);
});

test('rotas autenticadas entregam o resultado síncrono e permitem repetir uma sincronização HTTP', async (t) => {
    const { module, prisma } = await cenario(t);
    const app = express();
    app.use(express.json());
    app.use(
        '/api/cycles',
        criarCycleRegistrationRoutes({
            Router: express.Router,
            controller: module.controller,
            authMiddleware: {
                autenticar(req, res, next) {
                    if (req.get('Authorization') !== 'Bearer teste') return res.sendStatus(401);
                    req.usuario = { id: 1 };
                    next();
                }
            }
        })
    );
    app.use(tratarErros);
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => new Promise((resolve) => server.close(resolve)));
    const url = `http://127.0.0.1:${server.address().port}/api/cycles`;
    assert.equal((await fetch(`${url}/registrations`, { method: 'POST' })).status, 401);
    const opcoes = {
        method: 'POST',
        headers: {
            Authorization: 'Bearer teste',
            'Content-Type': 'application/json',
            'Idempotency-Key': 'http-operacao-1'
        },
        body: JSON.stringify({ dataInicio: '2026-10-01', dataFim: '2026-10-05' })
    };
    const inicio = performance.now();
    const resposta = await fetch(`${url}/registrations`, opcoes);
    const corpo = await resposta.json();
    t.diagnostic(
        `Registro, persistência e recálculo HTTP: ${Math.round(performance.now() - inicio)}ms (medição local, sem garantia de rede/dispositivo).`
    );
    assert.equal(resposta.status, 201);
    assert.equal(resposta.headers.get('cache-control'), 'private, no-store');
    assert.ok(corpo.previsao.proximoInicioEstimado);
    assert.equal(corpo.ciclo.dias.length, 5);
    assert.equal((await fetch(`${url}/registrations`, opcoes)).status, 200);
    assert.equal(await prisma.diaMenstruacao.count(), 5);
    assert.equal(
        (await fetch(`${url}/shared/2`, { headers: { Authorization: 'Bearer teste' } })).status,
        404
    );
    assert.equal(
        (await fetch(`${url}/shared/invalido`, { headers: { Authorization: 'Bearer teste' } }))
            .status,
        422
    );
});

test('encerra ciclo anterior aberto sem inventar dias de sangramento', async (t) => {
    const { prisma, registrar } = await cenario(t);
    const aberto = await prisma.registroCiclo.create({
        data: {
            usuarioId: 1,
            dataInicio: new Date('2026-09-01'),
            dataFim: null,
            ehCicloInicial: true,
            diasMenstruacao: { create: { data: new Date('2026-09-01') } }
        }
    });
    await registrar({ data: '2026-09-29' });
    const encerrado = await prisma.registroCiclo.findUnique({ where: { id: aberto.id } });
    assert.equal(encerrado.dataFim.toISOString().slice(0, 10), '2026-09-01');
    assert.equal(encerrado.duracaoMenstruacao, 1);
    assert.equal(encerrado.duracaoCiclo, 28);
    assert.equal(await prisma.diaMenstruacao.count(), 2);
});

test('categoria e preferência de notificação são respeitadas após a sincronização', async (t) => {
    const { prisma, registrar, module } = await cenario(t);
    const categoria = await prisma.categoriaPermissao.create({
        data: {
            titularId: 1,
            nome: 'Familia',
            nomeNormalizado: 'familia',
            conjuntoDadosVisiveis: ['geral.historico_ciclo']
        }
    });
    await prisma.vinculoRedeApoio.create({
        data: {
            titularId: 1,
            contatoId: 2,
            emailConvidado: 'teste2@example.com',
            categoriaId: categoria.id,
            status: 'ativo',
            permissoesIndividuais: []
        }
    });
    await prisma.preferenciaNotificacao.create({ data: { usuarioId: 2, redeApoioAtiva: false } });
    await registrar({ data: '2026-10-01' });
    assert.equal(await prisma.notificacao.count(), 0);
    assert.equal(
        (await module.sharingService.buscar({ contatoId: 2, titularId: '1' })).ciclos.length,
        1
    );
    await prisma.categoriaPermissao.update({
        where: { id: categoria.id },
        data: { conjuntoDadosVisiveis: [] }
    });
    await assert.rejects(() => module.sharingService.buscar({ contatoId: 2, titularId: '1' }), {
        status: 404
    });
});

test('compartilhamento pagina e apresenta ciclos abertos sem expor outras contas', async (t) => {
    const { prisma, module } = await cenario(t);
    await prisma.vinculoRedeApoio.create({
        data: {
            titularId: 1,
            contatoId: 2,
            emailConvidado: 'teste2@example.com',
            status: 'ativo',
            permissoesIndividuais: ['geral.historico_ciclo']
        }
    });
    await prisma.registroCiclo.createMany({
        data: Array.from({ length: 51 }, (_, i) => ({
            id: 100 + i,
            usuarioId: 1,
            dataInicio: new Date(Date.UTC(2020, 0, 1 + i * 28)),
            dataFim: i === 0 ? null : new Date(Date.UTC(2020, 0, 5 + i * 28)),
            duracaoMenstruacao: i === 0 ? null : 5
        }))
    });
    const pagina = await module.sharingService.buscar({ contatoId: 2, titularId: '1' });
    assert.equal(pagina.ciclos.length, 50);
    const ultima = await module.sharingService.buscar({
        contatoId: 2,
        titularId: '1',
        antesDe: String(pagina.proximoCursor)
    });
    assert.equal(ultima.ciclos.length, 1);
    assert.equal(ultima.ciclos[0].dataFim, null);
    assert.equal(ultima.proximoCursor, null);
    await assert.rejects(
        () =>
            module.service.registrar({
                usuarioId: 999,
                chave: 'usuario-inexistente',
                corpo: { data: '2026-10-01' }
            }),
        { status: 404 }
    );
});

test('controller compartilha dados autorizados sem cache e respeita a sessão do contato', async (t) => {
    const { prisma, module, registrar } = await cenario(t);
    await registrar({ data: '2026-10-01' });
    await prisma.vinculoRedeApoio.create({
        data: {
            titularId: 1,
            contatoId: 2,
            emailConvidado: 'teste2@example.com',
            status: 'ativo',
            permissoesIndividuais: ['geral.historico_ciclo']
        }
    });
    let corpo;
    const headers = new Map();
    await module.controller.compartilhar(
        { usuario: { id: 2 }, params: { titularId: '1' }, query: {} },
        {
            set(nome, valor) {
                headers.set(nome, valor);
            },
            json(valor) {
                corpo = valor;
            }
        },
        (erro) => {
            throw erro;
        }
    );
    assert.equal(headers.get('Cache-Control'), 'private, no-store');
    assert.equal(corpo.ciclos.length, 1);
