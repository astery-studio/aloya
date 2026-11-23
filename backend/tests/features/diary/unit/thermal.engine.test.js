import assert from 'node:assert/strict';
import test from 'node:test';

import { CONFIGURACOES_TERMICAS_CAUSAIS } from '../../../../src/features/diary/thermal/thermal.config.js';
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

const config = (variante, disponibilidade = 'B1') =>
    CONFIGURACOES_TERMICAS_CAUSAIS.find(
        (item) => item.variante === variante && item.disponibilidade === disponibilidade
    );

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

    assert.equal(rejeitada.estado, 'NENHUMA_ELEVACAO_IDENTIFICADA');
    assert.equal(aceita.estado, 'ELEVACAO_DETECTADA');
});

test('A1 e A2 mantêm limiares independentes', () => {
    const medicoes = serie([364, 364, 364, 364, 364, 364, 366, 366, 366]);
    assert.equal(detectarPadraoTermico(medicoes, config('A1')).estado, 'ELEVACAO_DETECTADA');
    assert.equal(
        detectarPadraoTermico(medicoes, config('A2')).estado,
        'NENHUMA_ELEVACAO_IDENTIFICADA'
    );
});

test('A4-C compara com a maior das seis temperaturas anteriores', () => {
    const medicoes = serie([360, 361, 362, 363, 364, 365, 366, 366, 366]);
    assert.equal(
        detectarPadraoTermico(medicoes, config('A4-C')).estado,
        'NENHUMA_ELEVACAO_IDENTIFICADA'
    );
});

test('B2 tolera lacunas somente dentro da janela de nove dias', () => {
    const medicoes = serie([364, 364, 364, 364, 364, 364, 364, 366, 366, 366]);
    medicoes.splice(2, 1);
    assert.equal(detectarPadraoTermico(medicoes, config('A1', 'B1')).estado, 'DADOS_INSUFICIENTES');
    assert.equal(detectarPadraoTermico(medicoes, config('A1', 'B2')).estado, 'ELEVACAO_DETECTADA');
});

test('detecção causal permanece igual quando temperaturas futuras chegam', () => {
    const base = serie([364, 364, 364, 364, 364, 364, 366, 366, 366]);
    const inicial = detectarPadraoTermico(base, config('A1'));
    const posterior = detectarPadraoTermico(
        [...base, ...serie([350, 350], '2026-01-10')],
        config('A1')
    );
    assert.deepEqual(posterior.sequencias[0], inicial.sequencias[0]);
});

test('detecção causal só existe no terceiro dia elevado disponível', () => {
    const medicoes = serie([364, 364, 364, 364, 364, 364, 366, 366, 366]);
    assert.equal(
        detectarPadraoTermico(medicoes.slice(0, 7), config('A1')).estado,
        'DADOS_INSUFICIENTES'
    );
    assert.equal(
        detectarPadraoTermico(medicoes.slice(0, 8), config('A1')).estado,
        'DADOS_INSUFICIENTES'
    );
    assert.equal(detectarPadraoTermico(medicoes, config('A1')).estado, 'ELEVACAO_DETECTADA');
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
        'NENHUMA_ELEVACAO_IDENTIFICADA'
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

test('primeira elevação preserva retorno confirmado sem fabricar outra sequência', () => {
    const resultado = detectarPadraoTermico(
        serie([364, 364, 364, 364, 364, 364, 366, 366, 366, 364, 364, 364])
    );
    assert.equal(resultado.sequencias.length, 1);
    assert.deepEqual(resultado.sequencias[0].retornoLinhaBase, {
        dataInicio: '2026-01-10',
        dataConfirmacao: '2026-01-12'
    });
});

test('elevação posterior sem retorno completo não vira segunda sequência', () => {
    const resultado = detectarPadraoTermico(
        serie([364, 364, 364, 364, 364, 364, 366, 366, 366, 364, 364, 367, 367, 367])
    );
    assert.equal(resultado.estado, 'ELEVACAO_DETECTADA');
    assert.equal(resultado.sequencias.length, 1);
    assert.equal(resultado.sequencias[0].retornoLinhaBase, null);
});

test('registra duas elevações somente quando existe retorno caracterizado', () => {
    const resultado = detectarPadraoTermico(
        serie([
            364, 364, 364, 364, 364, 364, 366, 366, 366, 364, 364, 364, 364, 364, 364, 366, 366, 366
        ])
    );

    assert.equal(resultado.estado, 'INCONCLUSIVO');
    assert.equal(resultado.sequencias.length, 2);
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
    assert.equal(editado.estado, 'NENHUMA_ELEVACAO_IDENTIFICADA');
});
