import test from 'node:test';
import assert from 'node:assert/strict';
import {
    adicionarDias,
    diferencaDias,
    ehDataCalendarioValida,
    formatarData,
    paraDataCalendario
} from '../../../../src/features/cycles/utils/calendar.js';

test('valida e formata texto e objeto de data em UTC', () => {
    const data = new Date('2026-10-09T23:45:00.000Z');
    assert.equal(formatarData('2026-10-09'), '2026-10-09');
    assert.equal(formatarData(data), '2026-10-09');
    assert.equal(ehDataCalendarioValida(data), true);
    assert.equal(paraDataCalendario(data).toISOString(), '2026-10-09T00:00:00.000Z');
});

test('rejeita datas e quantidades inválidas e reconhece datas inválidas', () => {
    for (const valor of ['1899-12-31', '2026-02-29', '2026/01/01', new Date(Number.NaN), null]) {
        assert.equal(ehDataCalendarioValida(valor), false);
        assert.throws(() => formatarData(valor), TypeError);
        assert.throws(() => paraDataCalendario(valor), TypeError);
    }
    assert.throws(() => adicionarDias('2026-01-01', 1.5), TypeError);
});

test('adiciona e calcula dias entre datas incluindo mudança de mês e ano', () => {
    assert.equal(adicionarDias('2026-12-31', 1), '2027-01-01');
    assert.equal(adicionarDias('2026-10-01', -1), '2026-09-30');
    assert.equal(diferencaDias('2026-10-01', '2026-10-05'), 4);
});
