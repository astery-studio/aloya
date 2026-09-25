import assert from 'node:assert/strict';
import test from 'node:test';
import { obterFrequencia } from '../../../src/features/contraceptives/contraceptive.constants.js';
import { calcularPeriodosPausa, calcularProximoUso, estaEmPausa } from '../../../src/features/contraceptives/contraceptive.schedule.js';

test('calcula pausas consecutivas a partir do primeiro uso', () => {
    const regra = obterFrequencia('pilula', 'pilula_21_7');
    const pausas = calcularPeriodosPausa(new Date('2026-09-01T00:00:00.000Z'), regra, 2);
    assert.deepEqual(pausas, [
        { inicio: '2026-09-22', fim: '2026-09-28' },
        { inicio: '2026-10-20', fim: '2026-10-26' }
    ]);
    assert.equal(estaEmPausa(new Date('2026-09-25T00:00:00.000Z'), pausas), true);
});

test('uso contínuo não gera pausa', () => {
    const regra = obterFrequencia('pilula', 'pilula_continuo');
    assert.deepEqual(calcularPeriodosPausa(new Date('2026-09-01T00:00:00.000Z'), regra), []);
});

test('próximo uso ignora dias de pausa e retoma ao final', () => {
    const regra = obterFrequencia('pilula', 'pilula_21_7');
    const primeiroUso = new Date('2026-09-01T00:00:00.000Z');
    const pausas = calcularPeriodosPausa(primeiroUso, regra, 2);
    const proximo = calcularProximoUso({
        horarios: ['08:00'], dataPrimeiroUso: primeiroUso, regra, periodosPausa: pausas
    }, new Date('2026-09-24T12:00:00.000Z'));
    assert.equal(proximo.toISOString(), '2026-09-29T08:00:00.000Z');
});
