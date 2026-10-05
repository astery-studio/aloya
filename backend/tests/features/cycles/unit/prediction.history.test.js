import assert from 'node:assert/strict';
import test from 'node:test';

import { construirIntervalos, identificarAmbiguidades } from '../../../../src/features/cycles/prediction.history.js';

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

test('identifica somente ambiguidades presentes nos registros', () => {
    const inicio = new Date('2026-04-12T00:00:00Z');
    assert.deepEqual(identificarAmbiguidades([
        { dataInicio: inicio, dataFim: new Date('2026-04-11T00:00:00Z') },
        { dataInicio: inicio, dataFim: null }
    ]), ['INICIOS_DUPLICADOS', 'FIM_ANTERIOR_AO_INICIO']);
});
