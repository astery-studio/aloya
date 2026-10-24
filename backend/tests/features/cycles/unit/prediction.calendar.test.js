import assert from 'node:assert/strict';
import test from 'node:test';

import {
    adicionarDias,
    diferencaDias,
    formatarData
} from '../../../../src/features/cycles/utils/calendar.js';

test('soma dias de calendário em viradas de mês, ano e ano bissexto', () => {
    assert.equal(adicionarDias('2026-01-31', 1), '2026-02-01');
    assert.equal(adicionarDias('2026-12-31', 1), '2027-01-01');
    assert.equal(adicionarDias('2028-02-28', 1), '2028-02-29');
});

test('calcula datas persistidas pelos componentes normalizados em UTC', () => {
    const inicio = new Date('2026-10-17T23:30:00-03:00');

    assert.equal(adicionarDias(inicio, 1), '2026-10-19');
    assert.equal(diferencaDias('2026-10-18', '2026-10-20'), 2);
});

test('não modifica objetos Date recebidos', () => {
    const data = new Date('2028-02-28T00:00:00.000Z');

    adicionarDias(data, 1);
    assert.equal(data.toISOString(), '2028-02-28T00:00:00.000Z');
});

test('preserva o dia civil informado sem deslocamento de fuso', () => {
    assert.equal(formatarData('2026-03-01'), '2026-03-01');
    assert.equal(formatarData(new Date('2026-03-01T00:00:00Z')), '2026-03-01');
});

test('rejeita datas impossíveis, formatos ambíguos e deslocamentos inválidos', () => {
    assert.throws(() => formatarData('2026-02-30'), /inválida/);
    assert.throws(() => formatarData('0000-01-01'), /inválida/);
    assert.throws(() => formatarData('01/03/2026'), /inválida/);
    assert.throws(() => formatarData('2026-03-01T23:30:00-03:00'), /inválida/);
    assert.throws(() => adicionarDias('2026-03-01', 1.5), /inválida/);
});
