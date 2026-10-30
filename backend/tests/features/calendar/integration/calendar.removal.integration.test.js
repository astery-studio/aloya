//Exercita remoção, persistência e a grade usada pelo aplicativo com SQLite temporário.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import { criarCalendarModule } from '../../../../src/features/calendar/calendar.module.js';
import { criarCycleRemovalModule } from '../../../../src/features/cycles/cycleRemoval.module.js';
import { normalizarMes } from '../../../../../frontend/src/features/calendar/utils/cycleCalendar.utils.js';

const { PrismaClient } = prismaPackage;
const migration = new URL(
    '../../../../prisma/migrations/20260913221156_estrutura_inicial/migration.sql',
    import.meta.url
);
const data = (texto) => new Date(`${texto}T00:00:00.000Z`);
const julho = (dia) => `2026-07-${String(dia).padStart(2, '0')}`;

async function criarCenario(
    t,
    { posterior = true, dias = [21, 22, 23, 24, 25, 26, 27], aberto = false } = {}
) {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-remocao-calendario-'));
    const caminho = join(diretorio, 'teste.db');
    const banco = new DatabaseSync(caminho);
    banco.exec('PRAGMA foreign_keys = ON');
    banco.exec(readFileSync(migration, 'utf8'));
    banco.close();
    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` })
    });
    t.after(async () => {
        await prisma.$disconnect();
        rmSync(diretorio, { recursive: true, force: true });
    });
    await prisma.usuario.create({
        data: {
            id: 1,
            nome: 'Carla',
            dataNascimento: data('2000-01-01'),
            email: 'carla@example.com',
            senhaHash: 'hash',
            papel: 'principal',
            statusConta: 'ativa',
            duracaoCicloInformada: 28,
            duracaoMenstruacaoInformada: 5,
            duracaoLuteaInformada: 14
        }
    });
    await prisma.registroCiclo.create({
        data: {
            id: 10,
            usuarioId: 1,
            dataInicio: data(julho(dias[0])),
            dataFim: aberto ? null : data(julho(dias.at(-1))),
            duracaoMenstruacao: aberto ? null : dias.length,
            ehCicloInicial: true,
            diasMenstruacao: {
                create: dias.map((dia) => ({ data: data(julho(dia)) }))
            }
        }
    });
    if (posterior) {
        await prisma.registroCiclo.create({
            data: {
                id: 11,
                usuarioId: 1,
                dataInicio: data('2026-08-18'),
                dataFim: data('2026-08-22'),
                duracaoMenstruacao: 5,
                duracaoCiclo: 28,
                diasMenstruacao: {
                    create: [18, 19, 20, 21, 22].map((dia) => ({ data: data(`2026-08-${dia}`) }))
                }
            }
        });
    }
    const calendario = criarCalendarModule({ prisma }).calendarService;
    const remocao = criarCycleRemovalModule({ prisma }).service;
    const buscar = async (mes = '2026-07') => {
        const resposta = await calendario.buscarMes({ usuarioId: 1, mes });
        return { resposta, grade: normalizarMes(resposta, '2026-10-30') };
    };
    const remover = (dia) => remocao.removerDia({ usuarioId: 1, cicloId: 10, data: julho(dia) });
    return { prisma, remocao, buscar, remover };
}

function localizar(grade, dia) {
    return grade.semanas.flat().find((item) => item?.dia === dia);
}

for (const posterior of [true, false]) {
    test(`dias 23 e 26 removidos não reaparecem vermelhos (${posterior ? 'histórico confirmado' : 'último ciclo'})`, async (t) => {
        const { prisma, buscar, remover } = await criarCenario(t, { posterior });
        assert.equal(localizar((await buscar()).grade, 23).tipo, 'menstruacao');
        await remover(23);
        await remover(26);
        const { resposta, grade } = await buscar();
        assert.deepEqual(
            resposta.diasMenstruacao.map((item) => item.data),
            ['2026-07-21', '2026-07-22', '2026-07-24', '2026-07-25', '2026-07-27']
        );
        for (const dia of [23, 26]) {
            assert.notEqual(
                localizar(grade, dia).tipo,
                'menstruacao',
                `dia ${dia} voltou a ser pintado`
            );
            assert.equal(localizar(grade, dia).registroCicloId, null);
        }
        for (const dia of [21, 22, 24, 25, 27]) {
            assert.equal(localizar(grade, dia).tipo, 'menstruacao');
            assert.equal(localizar(grade, dia).registroCicloId, 10);
        }
        const registro = await prisma.registroCiclo.findUnique({ where: { id: 10 } });
        assert.equal(registro.duracaoMenstruacao, 5);
        assert.equal(registro.dataFim.toISOString().slice(0, 10), '2026-07-27');
        assert.equal(await prisma.registroCiclo.count(), posterior ? 2 : 1);
        if (!posterior) {
            const agosto = await buscar('2026-08');
            const prevista = agosto.resposta.previsao.periodos.find(
                (periodo) => periodo.menstruacaoPrevista?.inicio === '2026-08-18'
            );
            assert.deepEqual(prevista?.menstruacaoPrevista, {
                inicio: '2026-08-18',
                fim: '2026-08-22'
            });
        }
    });
}

test('remover as extremidades atualiza o início e fim sem dividir o ciclo', async (t) => {
    const { prisma, buscar, remover } = await criarCenario(t);
    await remover(21);
    await remover(27);
    const { grade } = await buscar();
    assert.notEqual(localizar(grade, 21).tipo, 'menstruacao');
    assert.notEqual(localizar(grade, 27).tipo, 'menstruacao');
    const ciclo = await prisma.registroCiclo.findUnique({ where: { id: 10 } });
    assert.equal(ciclo.dataInicio.toISOString().slice(0, 10), '2026-07-22');
    assert.equal(ciclo.dataFim.toISOString().slice(0, 10), '2026-07-26');
    assert.equal(ciclo.duracaoMenstruacao, 5);
    const seguinte = await prisma.registroCiclo.findUnique({ where: { id: 11 } });
    assert.equal(seguinte.duracaoCiclo, 27);
    assert.equal(await prisma.registroCiclo.count(), 2);
});

test('remover o único dia elimina ciclo e previsões em todos os meses', async (t) => {
    const { prisma, buscar, remover } = await criarCenario(t, { posterior: false, dias: [23] });
    const resultado = await remover(23);
    assert.equal(resultado.cicloRemovido, true);
    for (const mes of ['2026-07', '2026-08', '2026-10']) {
        const { resposta, grade } = await buscar(mes);
        assert.equal(resposta.possuiCiclos, false);
        assert.equal(resposta.previsao, null);
        assert.ok(
            grade.semanas
                .flat()
                .filter(Boolean)
                .every((dia) => dia.tipo === null)
        );
    }
    assert.equal(await prisma.registroCiclo.count(), 0);
    assert.equal(await prisma.diaMenstruacao.count(), 0);
});

test('excluir ciclo completo elimina os dias sem deixar previsões órfãs', async (t) => {
    const { prisma, remocao, buscar } = await criarCenario(t, { posterior: false });
    await remocao.excluirCiclo({ usuarioId: 1, cicloId: 10 });
    const { resposta } = await buscar();
    assert.equal(resposta.possuiCiclos, false);
    assert.equal(resposta.previsao, null);
    assert.deepEqual(resposta.diasMenstruacao, []);
    assert.equal(await prisma.diaMenstruacao.count(), 0);
});

test('remoção mantém as fases históricas pelo próximo início real e as projeções futuras', async (t) => {
    const { buscar, remover } = await criarCenario(t);
    await remover(23);
    await remover(26);
    const julho = await buscar();
    assert.equal(localizar(julho.grade, 28).tipo, 'folicular');
    assert.equal(localizar(julho.grade, 31).tipo, 'folicular');
    const agosto = await buscar('2026-08');
    assert.equal(localizar(agosto.grade, 3).tipo, 'ovulacao');
    assert.equal(localizar(agosto.grade, 4).tipo, 'lutea');
    const setembro = await buscar('2026-09');
    assert.ok(
        setembro.grade.semanas
            .flat()
            .filter(Boolean)
            .some((dia) => dia.tipo === 'menstruacao' && dia.previsto)
    );
});

test('ciclo aberto conserva os dias menstruais assumidos quando ainda não existe fim registrado', async (t) => {
    const { buscar } = await criarCenario(t, { posterior: false, dias: [21], aberto: true });
    const { grade } = await buscar();
    assert.equal(localizar(grade, 21).tipo, 'menstruacao');
    assert.equal(localizar(grade, 21).registroCicloId, 10);
    assert.equal(localizar(grade, 22).tipo, 'menstruacao');
    assert.equal(localizar(grade, 22).registroCicloId, null);
});

test('dois ciclos no mesmo mês preservam as fases do primeiro e os dias removidos', async (t) => {
    const { prisma, buscar, remover } = await criarCenario(t, {
        posterior: false,
        dias: [1, 2, 3, 4, 5]
    });
    await prisma.registroCiclo.create({
        data: {
            id: 11,
            usuarioId: 1,
            dataInicio: data(julho(29)),
            dataFim: data(julho(31)),
            duracaoMenstruacao: 3,
            duracaoCiclo: 28,
            diasMenstruacao: { create: [29, 30, 31].map((dia) => ({ data: data(julho(dia)) })) }
        }
    });
    await remover(2);
    const { grade } = await buscar();
    assert.notEqual(localizar(grade, 2).tipo, 'menstruacao');
    assert.equal(localizar(grade, 6).tipo, 'folicular');
    assert.equal(localizar(grade, 14).tipo, 'ovulacao');
    assert.equal(localizar(grade, 15).tipo, 'lutea');
    assert.equal(localizar(grade, 28).tipo, 'lutea');
    assert.equal(localizar(grade, 29).tipo, 'menstruacao');
});

test('intervalo incompatível com a duração lútea não fabrica fases para preencher lacunas', async (t) => {
    const { prisma, buscar, remover } = await criarCenario(t, {
        posterior: false,
        dias: [1, 2, 3, 4, 5, 6, 7, 8]
    });
    await prisma.registroCiclo.create({
        data: {
            id: 11,
            usuarioId: 1,
            dataInicio: data(julho(21)),
            dataFim: data(julho(25)),
            duracaoMenstruacao: 5,
            duracaoCiclo: 20,
            diasMenstruacao: {
                create: [21, 22, 23, 24, 25].map((dia) => ({ data: data(julho(dia)) }))
            }
        }
    });
    await remover(5);
    await remover(6);
    const { grade } = await buscar();
    assert.notEqual(localizar(grade, 5).tipo, 'menstruacao');
    assert.equal(localizar(grade, 8).tipo, 'menstruacao');
    for (let dia = 9; dia <= 20; dia += 1) {
        assert.equal(localizar(grade, dia).tipo, null);
    }
    assert.ok(
        !grade.semanas
            .flat()
            .filter(Boolean)
            .some((dia) => dia.dia < 21 && dia.tipo === 'ovulacao')
    );
});
