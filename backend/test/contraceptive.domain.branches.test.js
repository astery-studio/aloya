import assert from 'node:assert/strict';
import test from 'node:test';
import { obterFrequencia } from '../src/features/contraceptives/contraceptive.constants.js';
import { apresentarAnticoncepcional } from '../src/features/contraceptives/contraceptive.presenter.js';
import { calcularPeriodosPausa, calcularProximoUso } from '../src/features/contraceptives/contraceptive.schedule.js';
import { criarContraceptiveService } from '../src/features/contraceptives/contraceptive.service.js';

const inicio = new Date('2026-09-01T00:00:00.000Z');

test('resolve frequência por valor e trata combinações desconhecidas', () => {
    assert.equal(obterFrequencia('pilula', 'uso_continuo').periodicidade, 'diaria');
    assert.equal(obterFrequencia('desconhecido', 'uso_continuo'), null);
    assert.equal(obterFrequencia('pilula', 'desconhecida'), null);
});

test('calcula agendas diárias, semanais e mensais', () => {
    const diario = obterFrequencia('pilula', 'pilula_continuo');
    const semanal = obterFrequencia('adesivo', 'adesivo_continuo');
    const mensal = obterFrequencia('injetavel', 'injetavel_mensal');
    const proximo = (regra, agora, horarios = ['08:00']) => calcularProximoUso({
        horarios, dataPrimeiroUso: inicio, regra, periodosPausa: []
    }, new Date(agora));

    assert.equal(proximo(diario, '2026-09-01T09:00:00Z').toISOString(), '2026-09-02T08:00:00.000Z');
    assert.equal(proximo(semanal, '2026-09-02T09:00:00Z').toISOString(), '2026-09-08T08:00:00.000Z');
    assert.equal(proximo(mensal, '2026-09-02T09:00:00Z').toISOString(), '2026-10-01T08:00:00.000Z');
    assert.equal(proximo(diario, '2026-08-20T09:00:00Z').toISOString(), '2026-09-01T08:00:00.000Z');
    assert.equal(proximo(diario, '2026-09-01T09:00:00Z', []), null);
});

test('não calcula pausas sem uma regra cíclica', () => {
    assert.deepEqual(calcularPeriodosPausa(inicio, null), []);
    assert.deepEqual(calcularPeriodosPausa(inicio, { diasPausa: 0 }), []);
    assert.deepEqual(calcularPeriodosPausa(inicio, { diasPausa: 7, continuo: true }), []);
});

test('apresenta DIU sem programação nem datas opcionais', () => {
    const apresentado = apresentarAnticoncepcional({
        id: 2, nome: 'Mirena', tipo: 'diu_hormonal', horariosProgramados: [],
        frequencia: null, dataInicioUso: null, dataValidade: null,
        nivelIntensidadeAlerta: 'critico', periodosPausa: [], criadoEm: inicio
    }, inicio);

    assert.equal(apresentado.frequenciaId, null);
    assert.equal(apresentado.dataPrimeiroUso, null);
    assert.equal(apresentado.dataValidade, null);
    assert.equal(apresentado.proximoUsoPrevisto, null);
});

test('persiste DIU sem calcular pausas usando o relógio padrão', async () => {
    let dados;
    const prisma = { anticoncepcional: { create: async ({ data }) => {
        dados = data;
        return { id: 3, ...data, criadoEm: new Date() };
    } } };
    const service = criarContraceptiveService(prisma);
    await service.cadastrar(7, { nome: 'Mirena', tipo: 'diu_hormonal', dataValidade: '2099-01-01' });
    assert.deepEqual(dados.periodosPausa, []);
});
