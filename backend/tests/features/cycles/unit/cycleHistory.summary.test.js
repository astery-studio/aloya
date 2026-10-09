//Testa as métricas e a confiança calculadas para o resumo do histórico.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarResumoHistorico
} from '../../../../src/features/cycles/utils/cycleHistory.summary.js';

const DIA_EM_MS = 86_400_000;

//Cria registros separados por durações controladas.
function criarRegistros(intervalos, duracoesMenstruais = []) {
    const registros = [];
    let dataAtual = new Date('2026-01-01T00:00:00.000Z');

    registros.push({
        dataInicio: new Date(dataAtual),
        duracaoMenstruacao:
            duracoesMenstruais[0] ?? 5
    });

    intervalos.forEach((duracao, indice) => {
        dataAtual = new Date(
            dataAtual.getTime()
            + duracao * DIA_EM_MS
        );

        registros.push({
            dataInicio: new Date(dataAtual),
            duracaoMenstruacao:
                duracoesMenstruais[indice + 1] ?? 5
        });
    });

    return registros;
}

test('devolve resumo vazio com confiança baixa', () => {
    const resumo = criarResumoHistorico({
        registros: [],
        quantidadeCiclos: 0
    });

    assert.deepEqual(resumo, {
        cicloMedioDias: null,
        menstruacaoMediaDias: null,
        quantidadeCiclos: 0,
        confianca: 'baixa'
    });
});

test('calcula medianas e confiança média com três intervalos consistentes', () => {
    const resumo = criarResumoHistorico({
        registros: criarRegistros(
            [28, 29, 28],
            [5, 4, 5, 6]
        ),
        quantidadeCiclos: 4
    });

    assert.deepEqual(resumo, {
        cicloMedioDias: 28,
        menstruacaoMediaDias: 5,
        quantidadeCiclos: 4,
        confianca: 'media'
    });
});

test('classifica como alta com seis intervalos consistentes', () => {
    const resumo = criarResumoHistorico({
        registros: criarRegistros([
            28,
            29,
            28,
            30,
            29,
            28
        ]),
        quantidadeCiclos: 7
    });

    assert.equal(
        resumo.cicloMedioDias,
        29
    );

    assert.equal(
        resumo.menstruacaoMediaDias,
        5
    );

    assert.equal(
        resumo.confianca,
        'alta'
    );
});

test('classifica como baixa quando existe variabilidade elevada', () => {
    const resumo = criarResumoHistorico({
        registros: criarRegistros([
            28,
            29,
            50
        ]),
        quantidadeCiclos: 4
    });

    assert.equal(
        resumo.confianca,
        'baixa'
    );
});

test('rejeita quantidade total inválida', () => {
    assert.throws(
        () => criarResumoHistorico({
            registros: [],
            quantidadeCiclos: -1
        }),
        {
            name: 'TypeError',
            message:
                'A quantidade de ciclos do resumo é inválida.'
        }
    );
});

test('rejeita duração menstrual inválida', () => {
    assert.throws(
        () => criarResumoHistorico({
            registros: [{
                dataInicio:
                    new Date(
                        '2026-01-01T00:00:00.000Z'
                    ),
                duracaoMenstruacao: 0
            }],
            quantidadeCiclos: 1
        }),
        {
            name: 'TypeError',
            message:
                'A duração menstrual do resumo é inválida.'
        }
    );
});