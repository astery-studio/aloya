import assert from 'node:assert/strict';
import test from 'node:test';
import {
    agruparDias,
    incluirCiclosProximos
} from '../../../../src/features/cycles/utils/cycleContinuity.js';

const data = (dia) => new Date(`2026-10-${dia}T00:00:00Z`);
const ciclo = (id, inicio, fim, dias) => ({
    id,
    dataInicio: data(inicio),
    dataFim: data(fim),
    diasMenstruacao: dias.map((dia) => ({ data: data(dia) }))
});

test('até dois dias de pausa preservam o episódio; três iniciam outro', () => {
    for (const pausa of [0, 1, 2, 3]) {
        const dias = [data(20), data(21 + pausa)];
        assert.equal(agruparDias(dias).length, pausa < 3 ? 1 : 2);
        assert.equal(
            incluirCiclosProximos([dias[0]], [ciclo(2, 21 + pausa, 25, [21 + pausa, 25])]).registros
                .length,
            pausa < 3 ? 1 : 0
        );
    }
});

test('une vizinhos transitivamente sem inventar dias nem modificar os registros recebidos', () => {
    const registros = [ciclo(3, 27, 28, [27, 28]), ciclo(2, 24, 24, [24])];
    const antes = structuredClone(registros);
    const resultado = incluirCiclosProximos([data(21), data(21)], registros);
    assert.deepEqual(
        resultado.registros.map((item) => item.id),
        [2, 3]
    );
    assert.deepEqual(resultado.dias, [21, 24, 27, 28].map(data));
    assert.deepEqual(registros, antes);
    assert.deepEqual(incluirCiclosProximos([], registros), { dias: [], registros: [] });
});

test('um dia dentro de outro período fica para validação ou restauração nesse ciclo', () => {
    assert.equal(
        incluirCiclosProximos([data(23)], [ciclo(2, 21, 25, [21, 22, 24, 25])]).registros.length,
        0
    );
});
