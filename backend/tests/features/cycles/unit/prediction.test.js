import assert from 'node:assert/strict';
import test from 'node:test';

import { calcularPrevisao } from '../../../../src/features/cycles/prediction.js';

const parametros = {
    duracaoCicloInformada: null,
    duracaoMenstruacaoInformada: null,
    duracaoLuteaInformada: null
};

test('não cria datas sem um início elegível', () => {
    assert.deepEqual(calcularPrevisao({
        registros: [], parametros, dataReferencia: '2026-10-05'
    }), {
        status: 'DADOS_INSUFICIENTES',
        motivos: ['INICIO_ELEGIVEL_AUSENTE']
    });
});

test('gera previsão inicial provisória e explicita suas limitações', () => {
    const registros = [{ dataInicio: new Date('2026-10-01T00:00:00Z'), dataFim: null }];
    const resultado = calcularPrevisao({ registros, parametros, dataReferencia: '2026-10-05' });

    assert.equal(resultado.proximoInicioEstimado, '2026-10-29');
    assert.equal(resultado.origemDuracaoCiclo, 'PADRAO_PROVISORIO');
    assert.equal(resultado.confiabilidadeMenstrual.nivel, 'BAIXA');
    assert.equal(resultado.baseEstimativaOvulacao.origemDuracaoLutea, 'PADRAO_PROVISORIO');
    assert.ok(resultado.limitacoes.includes('EFEITOS_DE_ANTICONCEPCIONAIS_NAO_CONSIDERADOS'));
    assert.match(resultado.avisos[0], /não substitui orientação médica/);
    assert.match(resultado.avisos[1], /não considera os efeitos de anticoncepcionais/);
    assert.match(resultado.avisos[2], /Continue registrando/);
    assert.equal(resultado.dataOvulacaoEstimada, '2026-10-14');
    assert.equal('sangramentoAtual' in resultado, false);
    assert.equal(registros[0].dataFim, null);
});

test('não usa início futuro para calcular a previsão atual', () => {
    const resultado = calcularPrevisao({
        registros: [
            { dataInicio: '2026-10-01', dataFim: null },
            { dataInicio: '2026-11-01', dataFim: null }
        ],
        parametros,
        dataReferencia: '2026-10-05'
    });

    assert.equal(resultado.proximoInicioEstimado, '2026-10-29');
    assert.ok(resultado.limitacoes.includes('INICIO_FUTURO_IGNORADO'));
    assert.equal(resultado.confiabilidadeMenstrual.nivel, 'BAIXA');
});

test('mantém previsão vencida sem avançar ciclos fictícios', () => {
    const resultado = calcularPrevisao({
        registros: [{
            dataInicio: new Date('2026-09-01T00:00:00Z'),
            dataFim: new Date('2026-09-05T00:00:00Z')
        }],
        parametros: { ...parametros, duracaoCicloInformada: 30 },
        dataReferencia: '2026-11-20'
    });

    assert.equal(resultado.status, 'PREVISAO_ULTRAPASSADA');
    assert.equal(resultado.proximoInicioEstimado, '2026-10-01');
    assert.equal(resultado.faixaEstimada, null);
    assert.equal(resultado.versaoAlgoritmo, '1.0.0');
});
