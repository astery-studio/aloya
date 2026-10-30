import assert from 'node:assert/strict';
import test from 'node:test';
import { validarRegistroMenstrual } from '../../../../src/features/cycles/validators/cycleRegistration.validator.js';
import {
    selecionarPeriodo,
    permiteHistorico
} from '../../../../src/features/cycles/utils/cycleRegistration.js';
import { criarCycleRegistrationService } from '../../../../src/features/cycles/services/cycleRegistration.service.js';

const base = {
    usuarioId: 1,
    chave: 'operacao-123',
    corpo: { data: '2026-10-29' },
    agora: new Date('2026-10-30T12:00:00Z')
};

test('valida dia, intervalo, ano bissexto e limite de 366 dias', () => {
    assert.equal(validarRegistroMenstrual(base).fim, '2026-10-29');
    assert.equal(
        validarRegistroMenstrual({
            ...base,
            corpo: { dataInicio: '2024-02-29', dataFim: '2025-02-28' }
        }).inicio,
        '2024-02-29'
    );
    for (const corpo of [
        null,
        [],
        {},
        { data: new Date() },
        { data: '2026-02-30' },
        { data: '2026-10-31' },
        { dataInicio: '2026-10-30', dataFim: '2026-10-29' },
        { dataInicio: '2024-01-01', dataFim: '2026-01-01' },
        { data: '2026-10-29', usuarioId: 9 },
        { data: '2026-10-29', dataFim: null }
    ]) {
        assert.throws(() => validarRegistroMenstrual({ ...base, corpo }), { status: 422 });
    }
    for (const usuarioId of [0, -1, '1', null, 1.5])
        assert.throws(() => validarRegistroMenstrual({ ...base, usuarioId }), { status: 401 });
    for (const chave of ['', null, 'curta', 'x'.repeat(129), 'espaco nao'])
        assert.throws(() => validarRegistroMenstrual({ ...base, chave }), { status: 422 });
});

test('continuidade, preenchimento retroativo e conflitos preservam os ciclos', () => {
    const registro = {
        id: 1,
        dataInicio: '2026-10-10',
        dataFim: '2026-10-14',
        diasMenstruacao: []
    };
    assert.equal(selecionarPeriodo([registro], '2026-10-15', '2026-10-16').registro, registro);
    assert.equal(selecionarPeriodo([registro], '2026-10-08', '2026-10-09').registro, registro);
    assert.equal(selecionarPeriodo([registro], '2026-10-18', '2026-10-18').registro, null);
    assert.throws(() => selecionarPeriodo([registro], '2026-10-12', '2026-10-12'), { status: 409 });
    const seguinte = { ...registro, id: 2, dataInicio: '2026-10-17', dataFim: '2026-10-20' };
    assert.throws(() => selecionarPeriodo([seguinte, registro], '2026-10-15', '2026-10-16'), {
        status: 409
    });
    assert.equal(
        selecionarPeriodo(
            [{ ...registro, dataFim: null, diasMenstruacao: [{ data: '2026-10-11' }] }],
            '2026-10-12',
            '2026-10-12'
        ).registro.id,
        1
    );
    assert.equal(
        selecionarPeriodo([{ ...registro, dataFim: null }], '2026-10-11', '2026-10-11').registro.id,
