//Testa a integração entre consulta, cálculo e resposta do resumo.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarCycleHistoryService
} from '../../../../src/features/cycles/cycleHistory.service.js';

const DIA_EM_MS = 86_400_000;

function criarData(dataInicial, dias) {
    return new Date(
        dataInicial.getTime()
        + dias * DIA_EM_MS
    );
}

test('inclui métricas e confiança calculadas na resposta', async () => {
    const inicio =
        new Date(
            '2026-01-01T00:00:00.000Z'
        );

    const registrosResumo = [
        0,
        28,
        56,
        84
    ].map(dias => ({
        dataInicio:
            criarData(inicio, dias),
        dataFim:
            criarData(inicio, dias + 4),
        duracaoMenstruacao: 5
    }));

    const registroDaPagina = {
        id: 4,
        dataInicio:
            criarData(inicio, 84),
        dataFim:
            criarData(inicio, 88),
        duracaoMenstruacao: 5,
        duracaoCiclo: 28,
        classificacao: 'normal',
        ehCicloInicial: false
    };

    const repository = {
        async listarPagina() {
            return {
                registros: [
                    registroDaPagina
                ],
                temMais: false,
                proximoCursor: null
            };
        },

        async listarParaResumo(usuarioId) {
            assert.equal(
                usuarioId,
                7
            );

            return registrosResumo;
        },

        async contarDoUsuario() {
            return 4;
        },

        async contarAteCursor() {
            return 0;
        }
    };

    const service =
        criarCycleHistoryService({
            repository
        });

    const resultado =
        await service.listarHistorico({
            usuarioId: 7,
            consulta: {
                limit: '1'
            }
        });

    assert.deepEqual(
        resultado.resumo,
        {
            cicloMedioDias: 28,
            menstruacaoMediaDias: 5,
            quantidadeCiclos: 4,
            confianca: 'media'
        }
    );
});