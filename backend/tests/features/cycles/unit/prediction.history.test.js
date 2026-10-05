import assert from 'node:assert/strict';
import test from 'node:test';

import {
    construirIntervalos,
    identificarAmbiguidades,
    selecionarRegistrosElegiveis,
    selecionarIntervalosRecentes
} from '../../../../src/features/cycles/prediction.history.js';

test('dois inícios formam um intervalo e o ciclo mais recente fica incompleto', () => {
    const registros = [
        { dataInicio: new Date('2026-02-10T00:00:00Z'), dataFim: null },
        { dataInicio: new Date('2026-01-10T00:00:00Z'), dataFim: new Date('2026-01-14T00:00:00Z') }
    ];

    const intervalos = construirIntervalos(registros);

    assert.equal(intervalos.length, 1);
    assert.equal(intervalos[0].duracao, 31);
    assert.equal(registros[0].dataFim, null);
});

test('exclui inícios futuros e tecnicamente inválidos sem alterar a entrada', () => {
    const registros = [
        { dataInicio: '2026-09-01', dataFim: '2026-09-05' },
        { dataInicio: '2026-10-20', dataFim: null },
        { dataInicio: 'data-inválida', dataFim: null }
    ];
    const copia = structuredClone(registros);
    const resultado = selecionarRegistrosElegiveis(registros, '2026-10-05');

    assert.deepEqual(resultado.registros, [registros[0]]);
    assert.deepEqual(resultado.ambiguidades, [
        'INICIO_FUTURO_IGNORADO',
        'INICIO_INVALIDO'
    ]);
    assert.deepEqual(registros, copia);
});

test('não usa término futuro em avaliação cronológica', () => {
    const resultado = selecionarRegistrosElegiveis([{
        dataInicio: '2026-10-01',
        dataFim: '2026-10-10'
    }], '2026-10-05');

    assert.equal(resultado.registros[0].dataFim, null);
    assert.deepEqual(resultado.ambiguidades, ['FIM_FUTURO_IGNORADO']);
});

test('preserva intervalos incomuns e não modifica os registros recebidos', () => {
    const registros = [
        { dataInicio: new Date('2026-01-01T00:00:00Z') },
        { dataInicio: new Date('2026-03-22T00:00:00Z') },
        { dataInicio: new Date('2026-04-12T00:00:00Z') }
    ];
    const copia = structuredClone(registros);

    assert.deepEqual(construirIntervalos(registros).map(({ duracao }) => duracao), [80, 21]);
    assert.deepEqual(registros, copia);
});

test('seleciona no histórico somente os seis intervalos mais recentes', () => {
    const intervalos = [20, 21, 26, 27, 28, 29, 30, 31]
        .map((duracao) => ({ duracao }));

    assert.deepEqual(
        selecionarIntervalosRecentes(intervalos).map(({ duracao }) => duracao),
        [26, 27, 28, 29, 30, 31]
    );
});

test('identifica somente ambiguidades presentes nos registros', () => {
    const inicio = new Date('2026-04-12T00:00:00Z');
    assert.deepEqual(identificarAmbiguidades([
        { dataInicio: inicio, dataFim: new Date('2026-04-11T00:00:00Z') },
        { dataInicio: inicio, dataFim: null }
    ]), ['INICIOS_DUPLICADOS', 'FIM_ANTERIOR_AO_INICIO']);
});
