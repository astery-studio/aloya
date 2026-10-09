import assert from 'node:assert/strict';
import test from 'node:test';

import { calcularPrevisao } from '../../../../src/features/cycles/prediction.js';
import { criarPredictionService } from '../../../../src/features/cycles/prediction.service.js';

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
