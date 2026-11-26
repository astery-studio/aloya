import assert from 'node:assert/strict';
import test from 'node:test';

import { calcularPrevisao } from '../../../../src/features/cycles/utils/prediction.js';
import { criarPredictionService } from '../../../../src/features/cycles/services/prediction.service.js';

test('usa histórico somente no cálculo e respeita o parâmetro lúteo declarado', () => {
    const registros = [
        { dataInicio: new Date('2026-09-01T00:00:00Z'), dataFim: new Date('2026-09-04T00:00:00Z') },
        { dataInicio: new Date('2026-10-01T00:00:00Z'), dataFim: new Date('2026-10-06T00:00:00Z') }
    ];
    const resultado = calcularPrevisao({ registros, parametros: {
        duracaoCicloInformada: null, duracaoMenstruacaoInformada: null,
        duracaoLuteaInformada: 12
    }, dataReferencia: '2026-10-10' });

    assert.equal(resultado.origemDuracaoCiclo, 'HISTORICO_INDIVIDUAL');
    assert.equal('sangramentoAtual' in resultado, false);
    assert.equal(resultado.baseEstimativaOvulacao.origemDuracaoLutea, 'DURACAO_DECLARADA');
    assert.equal('faseAtualEstimada' in resultado, false);
});

test('omite fases incompatíveis sem omitir a próxima menstruação', () => {
    const resultado = calcularPrevisao({
        registros: [{ dataInicio: new Date('2026-10-01T00:00:00Z'), dataFim: new Date('2026-10-18T00:00:00Z') }],
        parametros: { duracaoCicloInformada: 20, duracaoMenstruacaoInformada: null, duracaoLuteaInformada: 14 },
        dataReferencia: '2026-10-19'
    });

    assert.equal(resultado.status, 'PARCIALMENTE_DISPONIVEL');
    assert.equal(resultado.proximoInicioEstimado, '2026-10-21');
    assert.equal(resultado.fasesEstimadas, null);
    assert.equal(resultado.baseEstimativaOvulacao.status, 'INDISPONIVEL');
});

test('trata usuário inexistente sem produzir previsão', async () => {
    const service = criarPredictionService({
        prisma: { usuario: { findUnique: async () => null } }
    });
    await assert.rejects(() => service.buscar(99), { codigo: 'USUARIO_NAO_ENCONTRADO' });
});

test('usa confiança alta no histórico regular sem emitir aviso de baixa confiança', () => {
    const registros = [
        ['2026-05-06', '2026-05-10'],
        ['2026-06-03', '2026-06-07'],
        ['2026-07-01', '2026-07-05'],
        ['2026-07-29', '2026-08-02'],
        ['2026-08-26', '2026-08-30'],
        ['2026-09-23', '2026-09-27'],
        ['2026-10-21', '2026-10-25']
    ].map(([dataInicio, dataFim]) => ({ dataInicio, dataFim }));

    const previsao = calcularPrevisao({
        registros,
        parametros: {},
        dataReferencia: '2026-10-26'
    });

    assert.equal(previsao.confiabilidadeMenstrual.nivel, 'ALTA');
    assert.equal(previsao.avisos.length, 2);
});
