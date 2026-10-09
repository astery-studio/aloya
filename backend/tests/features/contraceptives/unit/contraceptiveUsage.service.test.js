import assert from 'node:assert/strict';
import test from 'node:test';
import { criarAvaliadorJanelaEficacia, lerJanelasDeUso } from '../../../../src/features/contraceptives/services/contraceptiveUsage.service.js';
import { dataHoraNoFuso, dataLocalNoFuso } from '../../../../src/features/contraceptives/validators/contraceptiveUsage.validator.js';

test('não inventa prazos clínicos por tipo ou nome; a configuração é por identificador', () => {
    const avaliar = criarAvaliadorJanelaEficacia({ 1: 60 });
    const programadoEm = new Date('2026-10-09T11:00:00Z');
    assert.equal(avaliar({ anticoncepcional: { id: 1, tipo: 'pilula' }, programadoEm }).toISOString(), '2026-10-09T12:00:00.000Z');
    assert.equal(avaliar({ anticoncepcional: { id: 2, tipo: 'pilula' }, programadoEm }), null);
    assert.deepEqual(lerJanelasDeUso(''), {});
    assert.deepEqual(lerJanelasDeUso('{"1":60}'), { 1: 60 });
    for (const valor of ['x', '[]', 'null', '{"pilula":60}', '{"1":-1}', '{"1":"60"}']) assert.throws(() => lerJanelasDeUso(valor));
});
test('o fuso respeita o dia local, mudanças de horário e não cria horários inexistentes', () => {
    assert.equal(dataLocalNoFuso(new Date('2026-10-09T01:00:00Z'), 'America/Sao_Paulo'), '2026-10-08');
    assert.equal(dataHoraNoFuso('2026-10-09', '08:00', 'America/Sao_Paulo').toISOString(), '2026-10-09T11:00:00.000Z');
    assert.equal(dataHoraNoFuso('2026-03-08', '02:30', 'America/New_York'), null);
    assert.equal(dataHoraNoFuso('2026-11-01', '01:30', 'America/New_York').toISOString(), '2026-11-01T05:30:00.000Z');
});
