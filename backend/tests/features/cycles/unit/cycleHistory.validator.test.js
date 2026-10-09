//Testa os limites e o cursor usados na paginação segura do histórico.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    LIMITE_MAXIMO,
    LIMITE_PADRAO,
    criarCursorHistorico,
    decodificarCursorHistorico,
    validarConsultaHistorico
} from '../../../../src/features/cycles/cycleHistory.validator.js';

const dataInicio = new Date('2026-09-04T00:00:00.000Z');

//Cria manualmente um cursor para testar cargas malformadas.
function codificarConteudo(conteudo) {
    return Buffer.from(
        JSON.stringify(conteudo),
        'utf8'
    ).toString('base64url');
}

test('usa o limite padrão quando a consulta está vazia', () => {
    assert.deepEqual(
        validarConsultaHistorico({}),
        {
            limite: LIMITE_PADRAO,
            cursor: null
        }
    );
});

test('aceita limite entre um e o máximo permitido', () => {
    assert.equal(
        validarConsultaHistorico({
            limit: '1'
        }).limite,
        1
    );

    assert.equal(
        validarConsultaHistorico({
            limit: String(LIMITE_MAXIMO)
        }).limite,
        LIMITE_MAXIMO
    );
});

test('cria e decodifica um cursor com data e id', () => {
    const cursor = criarCursorHistorico({
        dataInicio,
        id: 25
    });

    assert.deepEqual(
        decodificarCursorHistorico(cursor),
        {
            dataInicio,
            id: 25
        }
    );
});

test('aceita uma consulta com limite e cursor válidos', () => {
    const cursor = criarCursorHistorico({
        dataInicio,
        id: 25
    });

    assert.deepEqual(
        validarConsultaHistorico({
            limit: '20',
            cursor
        }),
        {
            limite: 20,
            cursor: {
                dataInicio,
                id: 25
            }
        }
    );
});

test('rejeita consulta nula, textual ou em formato de lista', () => {
    for (const consulta of [
        null,
        'limit=20',
        []
    ]) {
        assert.throws(
            () => validarConsultaHistorico(consulta),
            {
                status: 400,
                codigo: 'CONSULTA_HISTORICO_INVALIDA'
            }
        );
    }
});

test('rejeita parâmetros desconhecidos', () => {
    assert.throws(
        () => validarConsultaHistorico({
            usuarioId: '999'
        }),
        {
            status: 400,
            codigo: 'PARAMETRO_HISTORICO_DESCONHECIDO'
        }
    );
});

test('rejeita limites inválidos', () => {
    const valoresInvalidos = [
        '',
        '0',
        '01',
        '1.5',
        'abc',
        String(LIMITE_MAXIMO + 1),
        '999',
        ' 20 ',
        20,
        [],
        {}
    ];

    for (const limit of valoresInvalidos) {
        assert.throws(
            () => validarConsultaHistorico({
                limit
            }),
            {
                status: 400,
                codigo: 'LIMITE_HISTORICO_INVALIDO'
            }
        );
    }
});

test('rejeita cursor vazio ou com caracteres inválidos', () => {
    for (const cursor of [
        '',
        'cursor inválido',
        'abc=',
        [],
        {}
    ]) {
        assert.throws(
            () => decodificarCursorHistorico(cursor),
            {
                status: 400,
                codigo: 'CURSOR_HISTORICO_INVALIDO'
            }
        );
    }
});

test('rejeita cursor maior que o limite de segurança', () => {
    assert.throws(
        () => decodificarCursorHistorico('a'.repeat(257)),
        {
            status: 400,
            codigo: 'CURSOR_HISTORICO_INVALIDO'
        }
    );
});

test('rejeita cursor que não contém JSON válido', () => {
    const cursor = Buffer.from(
        'não é JSON',
        'utf8'
    ).toString('base64url');

    assert.throws(
        () => decodificarCursorHistorico(cursor),
        {
            status: 400,
            codigo: 'CURSOR_HISTORICO_INVALIDO'
        }
    );
});

test('rejeita versão desconhecida do cursor', () => {
    const cursor = codificarConteudo({
        v: 2,
        dataInicio: dataInicio.toISOString(),
        id: 25
    });

    assert.throws(
        () => decodificarCursorHistorico(cursor),
        {
            status: 400,
            codigo: 'CURSOR_HISTORICO_INVALIDO'
        }
    );
});

test('rejeita campos extras no cursor', () => {
    const cursor = codificarConteudo({
        v: 1,
        dataInicio: dataInicio.toISOString(),
        id: 25,
        usuarioId: 999
    });

    assert.throws(
        () => decodificarCursorHistorico(cursor),
        {
            status: 400,
            codigo: 'CURSOR_HISTORICO_INVALIDO'
        }
    );
});

test('rejeita data impossível ou fora do formato UTC exato', () => {
    const datasInvalidas = [
        '2026-02-30T00:00:00.000Z',
        '2026-09-04',
        '04/09/2026',
        null
    ];

    for (const dataInvalida of datasInvalidas) {
        const cursor = codificarConteudo({
            v: 1,
            dataInicio: dataInvalida,
            id: 25
        });

        assert.throws(
            () => decodificarCursorHistorico(cursor),
            {
                status: 400,
                codigo: 'CURSOR_HISTORICO_INVALIDO'
            }
        );
    }
});

test('rejeita identificador inválido no cursor', () => {
    const identificadoresInvalidos = [
        0,
        -1,
        1.5,
        '25',
        null,
        Number.MAX_SAFE_INTEGER + 1
    ];

    for (const id of identificadoresInvalidos) {
        const cursor = codificarConteudo({
            v: 1,
            dataInicio: dataInicio.toISOString(),
            id
        });

        assert.throws(
            () => decodificarCursorHistorico(cursor),
            {
                status: 400,
                codigo: 'CURSOR_HISTORICO_INVALIDO'
            }
        );
    }
});

test('rejeita criação de cursor com data inválida', () => {
    assert.throws(
        () => criarCursorHistorico({
            dataInicio: new Date('inválida'),
            id: 25
        }),
        {
            name: 'TypeError',
            message: 'A data de início do cursor é inválida.'
        }
    );
});

test('rejeita criação de cursor com identificador inválido', () => {
    assert.throws(
        () => criarCursorHistorico({
            dataInicio,
            id: 0
        }),
        {
            name: 'TypeError',
            message: 'O identificador do cursor é inválido.'
        }
    );
});