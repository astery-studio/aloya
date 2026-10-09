import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContraceptiveController } from '../../../../src/features/contraceptives/contraceptive.controller.js';
import { criarContraceptiveService } from '../../../../src/features/contraceptives/contraceptive.service.js';
import {
    apresentarAnticoncepcionalListagem,
    apresentarUsoHistorico
} from '../../../../src/features/contraceptives/contraceptive.listing.presenter.js';
import {
    horarioPertenceAgenda,
    listarUsosAgendadosHoje,
    proximoUsoListagem,
    usoOcorreNaData
} from '../../../../src/features/contraceptives/contraceptive.listing.schedule.js';

const agora = new Date('2026-10-09T10:00:00.000Z');

function registro(alteracoes = {}) {
    return {
        id: 10,
        usuarioId: 1,
        nome: 'Yaz',
        tipo: 'pilula',
        horariosProgramados: ['08:00', '20:00'],
        frequencia: 'uso_continuo',
        dataInicioUso: new Date('2026-09-01T00:00:00.000Z'),
        dataValidade: null,
        nivelIntensidadeAlerta: 'critico',
        periodosPausa: [],
        ativo: true,
        removidoEm: null,
        criadoEm: new Date('2026-09-01T10:00:00.000Z'),
        usos: [],
        ...alteracoes
    };
}

function uso(alteracoes = {}) {
    return {
        id: 40,
        anticoncepcionalId: 10,
        dataUsoProgramado: new Date('2026-10-09T00:00:00.000Z'),
        horarioProgramado: '08:00',
        horarioRealConfirmacao: null,
        statusUso: 'pendente',
        confirmacaoForaPrazo: false,
        ...alteracoes
    };
}

test('HU-019 apresenta doses independentes hoje e preserva a confirmação real', () => {
    const resultado = apresentarAnticoncepcionalListagem(registro({
        usos: [uso({ statusUso: 'confirmado', horarioRealConfirmacao: new Date('2026-10-09T08:01:32.123Z') })]
    }), agora);

    assert.deepEqual(resultado.usosHoje, [
        { id: '40', data: '2026-10-09', horario: '08:00', status: 'confirmado', confirmadoEm: '2026-10-09T08:01:32.123Z', foraDoPrazo: false },
        { id: '2026-10-09-20:00', data: '2026-10-09', horario: '20:00', status: 'pendente', confirmadoEm: null, foraDoPrazo: false }
    ]);
    assert.equal(resultado.statusUltimoUso, 'pendente');
    assert.equal(resultado.historico.length, 1);
    assert.equal(resultado.historico[0].horarioProgramado, '08:00');
});

test('HU-019 histórico real mais recente primeiro distingue tardio, pendente e não confirmado', () => {
    const resultado = apresentarAnticoncepcionalListagem(registro({ usos: [
        uso({ id: 1, dataUsoProgramado: new Date('2026-10-08T00:00:00Z'), statusUso: 'nao_confirmado' }),
        uso({ id: 2, horarioProgramado: '20:00', statusUso: 'confirmado', confirmacaoForaPrazo: true, horarioRealConfirmacao: new Date('2026-10-10T00:03:00Z') }),
        uso({ id: 3, horarioProgramado: '08:00' })
    ] }), agora);

    assert.deepEqual(resultado.historico.map(({ id, estado }) => ({ id, estado })), [
        { id: '2', estado: 'foraDoPrazo' },
        { id: '3', estado: 'pendente' },
        { id: '1', estado: 'naoConfirmado' }
    ]);
    assert.equal(resultado.usosHoje[1].foraDoPrazo, true);
    assert.equal(resultado.historico[0].confirmadoEm, '2026-10-10T00:03:00.000Z');
});

test('HU-019 não inventa histórico de uso nem presume janela encerrada', () => {
    const semRegistros = apresentarAnticoncepcionalListagem(registro(), agora);
    assert.deepEqual(semRegistros.historico, []);
    assert.equal(semRegistros.usosHoje.length, 2);
    assert.equal(apresentarUsoHistorico(uso({ dataUsoProgramado: new Date('2026-09-01T00:00:00Z') })).estado, 'pendente');
});

test('HU-019 DIU não recebe controles de marcação diária mesmo com dados persistidos', () => {
    const resultado = apresentarAnticoncepcionalListagem(registro({ tipo: 'diu_hormonal', usos: [uso()] }), agora);
    assert.deepEqual(resultado.usosHoje, []);
    assert.equal(resultado.proximoUsoPrevisto, null);
    assert.equal(horarioPertenceAgenda(registro({ tipo: 'diu_hormonal' }), '2026-10-09', '08:00'), false);
});

test('HU-019 histórico preserva usos não confirmados do esquema existente', () => {
    const resultado = apresentarAnticoncepcionalListagem(registro({ usos: [uso({
        statusUso: 'nao_confirmado'
    })] }), agora);
    assert.equal(resultado.historico[0].estado, 'naoConfirmado');
    assert.equal(resultado.usosHoje[0].status, 'naoConfirmado');
    assert.equal(resultado.statusUltimoUso, 'pendente');
});

test('HU-019 validade do DIU é uma contagem civil no fuso, sem marcação ou histórico diário', () => {
    const diu = registro({ tipo: 'diu_hormonal', dataValidade: new Date('2026-10-10T00:00:00Z') });
    const resultado = apresentarAnticoncepcionalListagem(diu, new Date('2026-10-10T01:00:00Z'), 'America/Sao_Paulo');
    assert.equal(resultado.validadeRestante, 'Vence em 1 dia');
    assert.equal(resultado.validadeExpirada, false);
    assert.equal(apresentarAnticoncepcionalListagem(diu, new Date('2026-10-10T12:00:00Z')).validadeRestante, 'Vence hoje');
    assert.equal(apresentarAnticoncepcionalListagem(diu, new Date('2026-10-11T12:00:00Z')).validadeRestante, 'Validade encerrada');
    assert.equal(apresentarAnticoncepcionalListagem(diu, new Date('2026-10-11T12:00:00Z')).validadeExpirada, true);
});

test('HU-019 anel segue controles de uso diário do protótipo nos ciclos contínuos 21 e 28', () => {
    for (const frequencia of ['uso_21_dias', 'uso_28_dias']) {
        const anel = registro({ tipo: 'anel_vaginal', frequencia, horariosProgramados: ['10:00', '10:02'] });
        const resultado = apresentarAnticoncepcionalListagem(anel, new Date('2026-10-09T09:00:00Z'));
        assert.deepEqual(resultado.usosHoje.map(({ horario }) => horario), ['10:00', '10:02']);
        assert.equal(resultado.proximoUsoPrevisto, '2026-10-09T10:00:00.000Z');
        assert.equal(horarioPertenceAgenda(anel, '2026-10-09', '10:00'), true);
        assert.equal(usoOcorreNaData(anel, '2026-09-02'), true);
    }
});

test('HU-019 anel 3 semanas/1 semana respeita dias de uso e pausa', () => {
    const anel = registro({ tipo: 'anel_vaginal', frequencia: 'uso_3_semanas_pausa_1_semana' });
    assert.equal(usoOcorreNaData(anel, '2026-09-01'), true);
    assert.equal(usoOcorreNaData(anel, '2026-09-02'), true);
    assert.equal(usoOcorreNaData(anel, '2026-09-21'), true);
    assert.equal(usoOcorreNaData(anel, '2026-09-22'), false);
    assert.equal(usoOcorreNaData(anel, '2026-09-28'), false);
    assert.equal(usoOcorreNaData(anel, '2026-09-29'), true);
});

test('HU-019 históricos ausentes ou vazios são apresentados vazios sem quebrar a agenda', () => {
    for (const usos of [[], undefined, null, {}]) {
        const resultado = apresentarAnticoncepcionalListagem(registro({ usos }), agora);
        assert.deepEqual(resultado.historico, []);
        assert.equal(resultado.usosHoje.length, 2);
        assert.equal(resultado.statusUltimoUso, 'pendente');
    }
});

test('HU-019 anticoncepcional removido preserva histórico sem agenda ativa', () => {
    const resultado = apresentarAnticoncepcionalListagem(registro({
        ativo: false, removidoEm: agora, usos: [uso()]
    }), agora);
    assert.equal(resultado.ativo, false);
    assert.equal(resultado.removidoEm, agora.toISOString());
    assert.equal(resultado.historico.length, 1);
    assert.deepEqual(resultado.usosHoje, []);
    assert.equal(resultado.proximoUsoPrevisto, null);
});

test('HU-019 ciclos da pílula incluem pausa e retomam além de 24 ciclos persistidos', () => {
    const pilula = registro({ frequencia: 'uso_21_dias_pausa_7_dias' });
    assert.equal(usoOcorreNaData(pilula, '2026-09-21'), true);
    assert.equal(usoOcorreNaData(pilula, '2026-09-22'), false);
    assert.equal(usoOcorreNaData(pilula, '2026-09-28'), false);
    assert.equal(usoOcorreNaData(pilula, '2026-09-29'), true);
    const inicio = Date.parse('2026-09-01');
    const pausaDepoisDe24 = new Date(inicio + (25 * 28 + 21) * 86_400_000).toISOString().slice(0, 10);
    assert.equal(usoOcorreNaData(pilula, pausaDepoisDe24), false);
});

test('HU-019 adesivo aplica recorrência semanal e pausa sem doses diárias', () => {
    const adesivo = registro({ tipo: 'adesivo', frequencia: 'uso_3_semanas_pausa_1_semana' });
    for (const data of ['2026-09-01', '2026-09-08', '2026-09-15', '2026-09-29']) {
        assert.equal(usoOcorreNaData(adesivo, data), true, data);
    }
    assert.equal(usoOcorreNaData(adesivo, '2026-09-02'), false);
    assert.equal(usoOcorreNaData(adesivo, '2026-09-22'), false);
});

test('HU-019 injetáveis respeitam frequência mensal, bimestral e trimestral', () => {
    for (const [frequencia, intervalo] of [
        ['aplicacao_mensal', 1], ['aplicacao_bimestral', 2], ['aplicacao_trimestral', 3]
    ]) {
        const injetavel = registro({ tipo: 'injetavel', frequencia, horariosProgramados: ['09:00'] });
        assert.equal(usoOcorreNaData(injetavel, '2026-09-01'), true);
        assert.equal(usoOcorreNaData(injetavel, '2026-09-02'), false);
        assert.equal(usoOcorreNaData(injetavel, '2026-10-01'), intervalo === 1);
        const proximo = proximoUsoListagem(injetavel, new Date('2026-09-02T00:00:00Z'));
        assert.equal(proximo.toISOString(), `2026-${String(9 + intervalo).padStart(2, '0')}-01T09:00:00.000Z`);
    }
});

test('HU-019 agenda não aceita data impossível, anterior ao início ou horário não cadastrado', () => {
    assert.equal(usoOcorreNaData(registro(), '2026-02-30'), false);
    assert.equal(usoOcorreNaData(registro(), '2026-08-31'), false);
    assert.equal(horarioPertenceAgenda(registro(), '2026-10-09', '8:00'), false);
    assert.equal(horarioPertenceAgenda(registro(), '2026-10-09', '09:00'), false);
    assert.equal(horarioPertenceAgenda(registro(), '2026-10-09', '08:00'), true);
    const horarios = listarUsosAgendadosHoje(registro({ horariosProgramados: ['20:00', '08:00', '08:00', '24:00', null] }), agora);
    assert.deepEqual(horarios.map(({ horario }) => horario), ['08:00', '20:00']);
});

test('HU-019 considera o dia e o próximo instante no fuso do dispositivo', () => {
    const madrugadaUtc = new Date('2026-10-10T01:00:00Z');
    const resultado = apresentarAnticoncepcionalListagem(registro(), madrugadaUtc, 'America/Sao_Paulo');
    assert.equal(resultado.usosHoje[0].data, '2026-10-09');
    assert.equal(resultado.proximoUsoPrevisto, '2026-10-10T11:00:00.000Z');
    assert.equal(apresentarAnticoncepcionalListagem(registro(), madrugadaUtc).usosHoje[0].data, '2026-10-10');
});

test('HU-019 consulta inclui usos restritos ao proprietário e ordena o próximo horário primeiro sem gravar', async () => {
    let consulta;
    const prisma = {
        anticoncepcional: {
            async findMany(entrada) {
                consulta = entrada;
                return [
                    registro({ id: 1, horariosProgramados: ['22:00'] }),
                    registro({ id: 2, horariosProgramados: ['11:00'] }),
                    registro({ id: 3, tipo: 'diu_hormonal', dataValidade: new Date('2030-01-01') })
                ];
            },
            create() { throw new Error('GET não pode gravar'); }
        },
        usoAnticoncepcional: { upsert() { throw new Error('GET não pode materializar uso'); } }
    };
    const service = criarContraceptiveService(prisma, () => agora);
    const resultado = await service.listar(25);
    assert.deepEqual(consulta.where, { usuarioId: 25, ativo: true });
    assert.deepEqual(consulta.include.usos.orderBy, [{ dataUsoProgramado: 'desc' }, { horarioProgramado: 'desc' }]);
    assert.deepEqual(resultado.map(({ id }) => id), [2, 1, 3]);
});

test('HU-019 consulta de removidos é explícita e fuso inválido falha antes da consulta', async () => {
    let consulta;
    const service = criarContraceptiveService({ anticoncepcional: {
        async findMany(entrada) { consulta = entrada; return []; }
    } }, () => agora);
    await service.listar(25, { incluirRemovidos: true });
    assert.deepEqual(consulta.where, { usuarioId: 25 });
    consulta = null;
    await assert.rejects(service.listar(25, { fusoHorario: 'fuso/inexistente' }), { codigo: 'FUSO_HORARIO_INVALIDO' });
    assert.equal(consulta, null);
});

test('HU-019 controller mantém chamada legada e encaminha apenas opções explícitas', async () => {
    const chamadas = [];
    const controller = criarContraceptiveController({ async listar(...argumentos) { chamadas.push(argumentos); return []; } });
    const resposta = { status() { return this; }, json() {} };
    const proximo = (erro) => { throw erro; };
    await controller.listar({ usuario: { id: 1 } }, resposta, proximo);
    await controller.listar({ usuario: { id: 1 }, query: { incluirRemovidos: 'false' } }, resposta, proximo);
    await controller.listar({ usuario: { id: 1 }, query: { incluirRemovidos: 'true', fusoHorario: 'America/Sao_Paulo' } }, resposta, proximo);
    assert.deepEqual(chamadas, [[1], [1], [1, { incluirRemovidos: true, fusoHorario: 'America/Sao_Paulo' }]]);
});
