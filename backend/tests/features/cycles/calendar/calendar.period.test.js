//Testa os limites mensais UTC usados nas consultas do calendário.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarIntervaloMensal } from '../../../../src/features/cycles/utils/calendar.period.js';

test('cria os limites exatos de um mês comum', () => {
    const intervalo = criarIntervaloMensal({
        ano: 2026,
        mes: 10
    });

    assert.equal(intervalo.inicioMes.toISOString(), '2026-10-01T00:00:00.000Z');
    assert.equal(intervalo.fimMesExclusivo.toISOString(), '2026-11-01T00:00:00.000Z');
    assert.equal(intervalo.ultimoDia, '2026-10-31');
});

test('avança dezembro para janeiro do ano seguinte', () => {
    const intervalo = criarIntervaloMensal({
        ano: 2026,
        mes: 12
    });

    assert.equal(intervalo.inicioMes.toISOString(), '2026-12-01T00:00:00.000Z');
    assert.equal(intervalo.fimMesExclusivo.toISOString(), '2027-01-01T00:00:00.000Z');
    assert.equal(intervalo.ultimoDia, '2026-12-31');
});

test('calcula fevereiro corretamente em ano bissexto', () => {
    const intervalo = criarIntervaloMensal({
        ano: 2028,
        mes: 2
    });

    assert.equal(intervalo.inicioMes.toISOString(), '2028-02-01T00:00:00.000Z');
    assert.equal(intervalo.fimMesExclusivo.toISOString(), '2028-03-01T00:00:00.000Z');
    assert.equal(intervalo.ultimoDia, '2028-02-29');
});

test('não converte anos antigos para o século vinte', () => {
    const intervalo = criarIntervaloMensal({
        ano: 1,
        mes: 1
    });

    assert.equal(intervalo.inicioMes.toISOString(), '0001-01-01T00:00:00.000Z');
    assert.equal(intervalo.fimMesExclusivo.toISOString(), '0001-02-01T00:00:00.000Z');
    assert.equal(intervalo.ultimoDia, '0001-01-31');
});

test('rejeita anos e meses fora do contrato', () => {
    const entradasInvalidas = [
        undefined,
        null,
        {},
        {ano: 0, mes: 1},
        {ano: 10000, mes: 1},
        {ano: 2026, mes: 0},
        {ano: 2026, mes: 13},
        {ano: 2026.5, mes: 10},
        {ano: '2026', mes: 10}
    ];

    for (const entrada of entradasInvalidas) {
        assert.throws(
            () => criarIntervaloMensal(entrada),
            {
                name: 'TypeError',
                message: 'Intervalo mensal inválido.'
            }
        );
    }
});