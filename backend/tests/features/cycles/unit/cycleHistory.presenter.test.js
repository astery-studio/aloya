//Testa o contrato público e a proteção de dados do histórico de ciclos.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    apresentarCicloHistorico
} from '../../../../src/features/cycles/cycleHistory.presenter.js';

//Cria um registro interno válido que pode ser modificado individualmente.
function criarRegistro(alteracoes = {}) {
    return {
        id: 10,
        usuarioId: 99,
        dataInicio:
            new Date('2026-08-07T00:00:00.000Z'),
        dataFim:
            new Date('2026-08-11T00:00:00.000Z'),
        duracaoMenstruacao: 5,
        duracaoCiclo: 28,
        classificacao: 'normal',
        ehCicloInicial: false,
        criadoEm:
            new Date('2026-08-07T12:00:00.000Z'),
        atualizadoEm:
            new Date('2026-08-11T12:00:00.000Z'),
        ...alteracoes
    };
}

test('apresenta um ciclo concluído e normal', () => {
    const resultado = apresentarCicloHistorico(
        criarRegistro(),
        4
    );

    assert.deepEqual(resultado, {
        id: 10,
        numero: 4,
        dataInicio: '2026-08-07',
        dataFim: '2026-08-11',
        diasMenstruais: 5,
        duracaoDias: 28,
        status: 'concluido',
        classificacao: 'normal',
        estimativaIncerta: false,
        cicloInicial: false
    });
});

test('apresenta um ciclo em andamento sem data final', () => {
    const resultado = apresentarCicloHistorico(
        criarRegistro({
            dataFim: null,
            duracaoMenstruacao: null,
            duracaoCiclo: null
        }),
        5
    );

    assert.equal(
        resultado.status,
        'emAndamento'
    );

    assert.equal(
        resultado.dataFim,
        null
    );

    assert.equal(
        resultado.diasMenstruais,
        null
    );

    assert.equal(
        resultado.duracaoDias,
        null
    );
});

test('marca ciclo atípico como estimativa incerta', () => {
    const resultado = apresentarCicloHistorico(
        criarRegistro({
            classificacao: 'atipico'
        }),
        3
    );

    assert.equal(
        resultado.classificacao,
        'atipico'
    );

    assert.equal(
        resultado.estimativaIncerta,
        true
    );
});

test('marca ciclo irregular como estimativa incerta', () => {
    const resultado = apresentarCicloHistorico(
        criarRegistro({
            classificacao: 'irregular'
        }),
        2
    );

    assert.equal(
        resultado.classificacao,
        'irregular'
    );

    assert.equal(
        resultado.estimativaIncerta,
        true
    );
});

test('identifica o primeiro ciclo sem inventar uma duração', () => {
    const resultado = apresentarCicloHistorico(
        criarRegistro({
            duracaoCiclo: null,
            ehCicloInicial: true
        }),
        1
    );

    assert.equal(
        resultado.duracaoDias,
        null
    );

    assert.equal(
        resultado.cicloInicial,
        true
    );
});

test('não expõe usuário ou metadados internos', () => {
    const resultado = apresentarCicloHistorico(
        criarRegistro(),
        4
    );

    assert.equal(
        'usuarioId' in resultado,
        false
    );

    assert.equal(
        'usuario' in resultado,
        false
    );

    assert.equal(
        'criadoEm' in resultado,
        false
    );

    assert.equal(
        'atualizadoEm' in resultado,
        false
    );

    assert.equal(
        'diasMenstruacao' in resultado,
        false
    );
});

test('rejeita registro ausente, textual ou em formato de lista', () => {
    for (const registro of [
        null,
        undefined,
        'ciclo',
        []
    ]) {
        assert.throws(
            () => apresentarCicloHistorico(
                registro,
                1
            ),
            {
                name: 'TypeError',
                message:
                    'O registro interno do ciclo é inválido.'
            }
        );
    }
});

test('rejeita identificador interno inválido', () => {
    for (const id of [
        null,
        0,
        -1,
        1.5,
        '10'
    ]) {
        assert.throws(
            () => apresentarCicloHistorico(
                criarRegistro({
                    id
                }),
                1
            ),
            {
                name: 'TypeError',
                message:
                    'O identificador interno do ciclo é inválido.'
            }
        );
    }
});

test('rejeita número sequencial inválido', () => {
    for (const numero of [
        null,
        0,
        -1,
        1.5,
        '4'
    ]) {
        assert.throws(
            () => apresentarCicloHistorico(
                criarRegistro(),
                numero
            ),
            {
                name: 'TypeError',
                message:
                    'O número sequencial do ciclo é inválido.'
            }
        );
    }
});

test('rejeita data inicial inválida', () => {
    assert.throws(
        () => apresentarCicloHistorico(
            criarRegistro({
                dataInicio:
                    new Date('data inválida')
            }),
            1
        ),
        {
            name: 'TypeError',
            message:
                'O campo interno "dataInicio" possui uma data inválida.'
        }
    );
});

test('rejeita data final inválida', () => {
    assert.throws(
        () => apresentarCicloHistorico(
            criarRegistro({
                dataFim:
                    new Date('data inválida')
            }),
            1
        ),
        {
            name: 'TypeError',
            message:
                'O campo interno "dataFim" possui uma data inválida.'
        }
    );
});

test('rejeita duração menstrual inválida', () => {
    for (const duracaoMenstruacao of [
        0,
        -1,
        1.5,
        '5'
    ]) {
        assert.throws(
            () => apresentarCicloHistorico(
                criarRegistro({
                    duracaoMenstruacao
                }),
                1
            ),
            {
                name: 'TypeError',
                message:
                    'O campo interno "duracaoMenstruacao" possui uma duração inválida.'
            }
        );
    }
});

test('rejeita duração do ciclo inválida', () => {
    for (const duracaoCiclo of [
        0,
        -1,
        1.5,
        '28'
    ]) {
        assert.throws(
            () => apresentarCicloHistorico(
                criarRegistro({
                    duracaoCiclo
                }),
                1
            ),
            {
                name: 'TypeError',
                message:
                    'O campo interno "duracaoCiclo" possui uma duração inválida.'
            }
        );
    }
});

test('rejeita classificação desconhecida', () => {
    assert.throws(
        () => apresentarCicloHistorico(
            criarRegistro({
                classificacao: 'desconhecida'
            }),
            1
        ),
        {
            name: 'TypeError',
            message:
                'A classificação interna do ciclo é inválida.'
        }
    );
});