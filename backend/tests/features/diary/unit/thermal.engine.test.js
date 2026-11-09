import assert from 'node:assert/strict';
import test from 'node:test';

import { detectarPadraoTermico } from '../../../../src/features/diary/thermal/thermal.engine.js';

function serie(valores, inicio = '2026-01-01') {
    const base = new Date(`${inicio}T00:00:00.000Z`);
    return valores.map((valor, indice) => {
        const data = new Date(base);
        data.setUTCDate(data.getUTCDate() + indice);
        return {
            data: data.toISOString().slice(0, 10),
            valorDecimos: typeof valor === 'object' ? valor.valor : valor,
            perturbada: typeof valor === 'object' && valor.perturbada
        };
    });
}

test('A1/B1 confirma igualdade no limite exato sem arredondar', () => {
    const resultado = detectarPadraoTermico(serie([364, 364, 364, 364, 364, 364, 366, 366, 366]));

    assert.equal(resultado.estado, 'ELEVACAO_DETECTADA');
    assert.equal(resultado.sequencias[0].dataInicioElevacao, '2026-01-07');
    assert.equal(resultado.sequencias[0].dataConfirmacao, '2026-01-09');
    assert.equal(resultado.sequencias[0].referencia.somaDecimos, 2184);
    assert.equal(resultado.aplicarEvidenciaNaConfianca, false);
});

test('média não inteira rejeita 36,6 e aceita 36,7', () => {
    const referencia = [363, 364, 364, 365, 364, 365];
    const rejeitada = detectarPadraoTermico(serie([...referencia, 366, 366, 366]));
    const aceita = detectarPadraoTermico(serie([...referencia, 367, 367, 367]));

    assert.equal(rejeitada.estado, 'NENHUMA_ELEVACAO_DETECTADA');
    assert.equal(aceita.estado, 'ELEVACAO_DETECTADA');
});

test('ausência ou perturbação interrompe a sequência', () => {
    const ausente = serie([364, 364, 364, 364, 364, 364, 366, 366, 366]);
    ausente.splice(7, 1);
    const perturbada = serie([
        364,
        364,
        364,
        364,
        364,
        364,
        366,
        { valor: 366, perturbada: true },
        366
    ]);

    assert.equal(detectarPadraoTermico(ausente).estado, 'DADOS_INSUFICIENTES');
    assert.equal(detectarPadraoTermico(perturbada).estado, 'DADOS_INSUFICIENTES');
});

test('distingue janela sem elevação de dados insuficientes', () => {
    assert.equal(
        detectarPadraoTermico(serie([364, 364, 364, 364, 364, 364, 365, 365, 365])).estado,
        'NENHUMA_ELEVACAO_DETECTADA'
    );
    assert.equal(
        detectarPadraoTermico(serie([364, 364, 364, 364, 364, 364, 366, 366])).estado,
        'DADOS_INSUFICIENTES'
    );
});

test('subida em degraus sem retorno produz uma única sequência', () => {
    const resultado = detectarPadraoTermico(
        serie([364, 364, 364, 364, 364, 364, 366, 366, 366, 368, 368, 368])
    );

    assert.equal(resultado.estado, 'ELEVACAO_DETECTADA');
    assert.equal(resultado.sequencias.length, 1);
});

test('não rearma uma segunda linha de base dentro do mesmo ciclo', () => {
    const resultado = detectarPadraoTermico(
        serie([
            364, 364, 364, 364, 364, 364, 366, 366, 366, 364, 364, 364, 364, 364, 364, 366, 366, 366
        ])
    );

    assert.equal(resultado.estado, 'ELEVACAO_DETECTADA');
    assert.equal(resultado.sequencias.length, 1);
    assert.equal(resultado.sequencias[0].dataInicioElevacao, '2026-01-07');
});

test('resultado independe da ordem de cadastro e é recalculado do zero', () => {
    const medicoes = serie([364, 364, 364, 364, 364, 364, 366, 366, 366]);
    const ordenado = detectarPadraoTermico(medicoes);
    const invertido = detectarPadraoTermico(medicoes.toReversed());
    const editado = detectarPadraoTermico(
        medicoes.map((item) => (item.data === '2026-01-08' ? { ...item, valorDecimos: 364 } : item))
    );

    assert.deepEqual(invertido, ordenado);
    assert.equal(editado.estado, 'NENHUMA_ELEVACAO_DETECTADA');
});
