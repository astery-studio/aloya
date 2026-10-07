//Testa a validação segura do mês solicitado para o calendário.
import assert from 'node:assert/strict';
import test from 'node:test';

import { validarMesCalendario } from '../../../../src/features/cycles/calendar/calendar.validator.js';

function capturarErro(acao) {
    try {
        acao();
        return null;
    } catch (erro) {
        return erro;
    }
}

test('aceita e normaliza um mês válido', () => {
    assert.deepEqual(validarMesCalendario('2026-10'), {
        chave: '2026-10',
        ano: 2026,
        mes: 10
    });
});

test('aceita meses passados sem impor limite de navegação', () => {
    assert.deepEqual(validarMesCalendario('0001-01'), {
        chave: '0001-01',
        ano: 1,
        mes: 1
    });
});

test('aceita o último mês de um ano', () => {
    assert.deepEqual(validarMesCalendario('2026-12'), {
        chave: '2026-12',
        ano: 2026,
        mes: 12
    });
});

test('rejeita valores que não sejam strings simples', () => {
    for (const entrada of [undefined, null, 202610, {}, [], ['2026-10'], true]) {
        const erro = capturarErro(() => validarMesCalendario(entrada));

        assert.equal(erro?.status, 422);
        assert.equal(erro?.codigo, 'MES_CALENDARIO_INVALIDO');
        assert.equal(erro?.message, 'Informe o mês no formato AAAA-MM.');
    }
});

test('rejeita meses inexistentes e formatos ambíguos', () => {
    const entradasInvalidas = [
        '',
        ' ',
        '0000-01',
        '2026-00',
        '2026-13',
        '2026-1',
        '26-10',
        '10-2026',
        '2026/10',
        '2026-10-01',
        ' 2026-10 ',
        '2026-10 ',
        '2026-10?admin=true'
    ];

    for (const entrada of entradasInvalidas) {
        const erro = capturarErro(() => validarMesCalendario(entrada));

        assert.equal(erro?.status, 422);
        assert.equal(erro?.codigo, 'MES_CALENDARIO_INVALIDO');
        assert.equal(erro?.message, 'Informe o mês no formato AAAA-MM.');
    }
});