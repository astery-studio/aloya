import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleEditValidator } from '../../../../src/features/cycles/validators/cycleEdit.validator.js';

const validator = criarCycleEditValidator({
    agora: () => new Date('2026-10-29T15:00:00.000Z')
});

test('aceita alteração parcial e término nulo', () => {
    assert.deepEqual(validator.validarCorpo({ dataInicio: '2026-10-20' }), {
        dataInicio: new Date('2026-10-20T00:00:00.000Z')
    });
    assert.deepEqual(validator.validarCorpo({ dataFim: null }), { dataFim: null });
});

test('aceita a data atual sem tratá-la como futura', () => {
    assert.deepEqual(validator.validarCorpo({ dataFim: '2026-10-29' }), {
        dataFim: new Date('2026-10-29T00:00:00.000Z')
    });
});

test('usa o relógio padrão quando ele não é injetado', () => {
    assert.deepEqual(criarCycleEditValidator().validarCorpo({ dataFim: null }), {
        dataFim: null
    });
});

test('rejeita início posterior ao término', () => {
    assert.throws(
        () =>
            validator.validarCorpo({
                dataInicio: '2026-10-20',
                dataFim: '2026-10-19'
            }),
        { status: 422, codigo: 'ORDEM_DATAS_CICLO_INVALIDA' }
    );
});

test('rejeita datas futuras e calendários inexistentes', () => {
    assert.throws(() => validator.validarCorpo({ dataInicio: '2026-10-30' }), {
        status: 422,
        codigo: 'DATA_CICLO_FUTURA'
    });
    assert.throws(() => validator.validarCorpo({ dataInicio: '2026-02-30' }), {
        status: 422,
        codigo: 'DATA_CICLO_INVALIDA'
    });
});

test('rejeita corpo vazio e campos capazes de trocar a propriedade', () => {
    for (const body of [null, [], 'datas']) {
        assert.throws(() => validator.validarCorpo(body), {
            status: 400,
            codigo: 'EDICAO_CICLO_INVALIDA'
        });
    }
    assert.throws(() => validator.validarCorpo({}), { status: 422, codigo: 'EDICAO_CICLO_VAZIA' });
    assert.throws(() => validator.validarCorpo({ usuarioId: 99 }), {
        status: 422,
        codigo: 'CAMPOS_CICLO_NAO_PERMITIDOS'
    });
});

test('valida identificadores positivos sem aceitar sufixos', () => {
    assert.equal(validator.validarIdCiclo('17'), 17);
    assert.throws(() => validator.validarIdCiclo('17abc'), {
        status: 400,
        codigo: 'ID_CICLO_INVALIDO'
    });
    assert.throws(() => validator.validarIdCiclo('0'), {
        status: 400,
        codigo: 'ID_CICLO_INVALIDO'
    });
    assert.throws(() => validator.validarIdCiclo('9007199254740992'), {
        status: 400,
        codigo: 'ID_CICLO_INVALIDO'
    });
});
