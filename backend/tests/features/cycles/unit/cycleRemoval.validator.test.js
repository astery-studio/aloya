import test from 'node:test';
import assert from 'node:assert/strict';
import {
    validarCicloId,
    validarDataRegistro,
    validarExclusaoCiclo,
    validarRemocaoDia,
    validarUsuarioId
} from '../../../../src/features/cycles/validators/cycleRemoval.validator.js';

test('valida identificadores numéricos e textuais do ciclo', () => {
    assert.equal(validarCicloId(12), 12);
    assert.equal(validarCicloId('12'), 12);
    assert.equal(validarUsuarioId(7), 7);
});

test('rejeita identificadores de usuário nulos, não inteiros e fora do intervalo seguro', () => {
    for (const valor of [undefined, null, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
        assert.throws(() => validarUsuarioId(valor), { codigo: 'SESSAO_INVALIDA', status: 401 });
    }
});

test('rejeita identificadores de ciclo com texto, zero à esquerda e valores inseguros', () => {
    for (const valor of [
        undefined,
        null,
        '',
        '0',
        '01',
        '-2',
        '1.2',
        '1abc',
        Number.MAX_SAFE_INTEGER + 1
    ]) {
        assert.throws(() => validarCicloId(valor), { codigo: 'CICLO_INVALIDO', status: 400 });
    }
});

test('converte uma data ISO válida em meia-noite UTC', () => {
    const data = validarDataRegistro('2024-02-29');
    assert.equal(data.toISOString(), '2024-02-29T00:00:00.000Z');
});

test('rejeita formatos, datas inexistentes e anos anteriores ao calendário do produto', () => {
    for (const valor of [undefined, null, 20260901, '2026-9-01', '2026-02-29', '1899-12-31']) {
        assert.throws(() => validarDataRegistro(valor), {
            codigo: 'DATA_REGISTRO_INVALIDA',
            status: 400
        });
    }
});

test('valida os argumentos e normaliza o dia selecionado', () => {
    assert.deepEqual(validarRemocaoDia({ usuarioId: 3, cicloId: '5', data: '2026-09-04' }), {
        usuarioId: 3,
        cicloId: 5,
        data: new Date('2026-09-04T00:00:00.000Z')
    });
});

test('valida os argumentos da exclusão completa sem exigir data', () => {
    assert.deepEqual(validarExclusaoCiclo({ usuarioId: 3, cicloId: 5 }), {
        usuarioId: 3,
        cicloId: 5
    });
});
