import assert from 'node:assert/strict';
import test from 'node:test';

import { encontrarRetorno } from '../../../../src/features/diary/thermal/thermal.return.js';

const regra = { habilitado: true, margemDecimos: 0, quantidadeConsecutiva: 3 };
const referencia = Array.from({ length: 6 }, () => ({ valorDecimos: 364 }));
const mapa = (valores) =>
    new Map(
        valores.map((valorDecimos, indice) => [
            `2026-01-${String(indice + 10).padStart(2, '0')}`,
            { valorDecimos, perturbada: false }
        ])
    );

test('confirma retorno após três medições consecutivas na linha de base', () => {
    const retorno = encontrarRetorno(
        mapa([366, 364, 364, 364]),
        '2026-01-09',
        '2026-01-13',
        referencia,
        regra
    );
    assert.deepEqual(retorno, { dataInicio: '2026-01-11', dataConfirmacao: '2026-01-13' });
});

test('lacuna, perturbação ou retorno incompleto não confirmam retorno', () => {
    const incompleto = mapa([364, 364]);
    const perturbado = mapa([364, 364, 364]);
    perturbado.get('2026-01-11').perturbada = true;
    assert.equal(encontrarRetorno(incompleto, '2026-01-09', '2026-01-11', referencia, regra), null);
    assert.equal(encontrarRetorno(perturbado, '2026-01-09', '2026-01-12', referencia, regra), null);
    assert.equal(encontrarRetorno(perturbado, '2026-01-09', '2026-01-12', referencia), null);
});
