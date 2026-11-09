import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDiaryEntryService } from '../../../../src/features/diary/services/diaryEntry.service.js';
import { validarCriacaoRegistro } from '../../../../src/features/diary/validators/diaryEntry.validator.js';

function criarCenario() {
    const chamadas = [];
    const chamadasTermicas = [];
    const tx = {
        preferenciaMacrocategoriaDiario: { findMany: async () => [] },
        preferenciaCategoriaDiario: { findMany: async () => [] },
        registroDiario: {
            create: async ({ data }) => {
                chamadas.push(data);
                return {
                    id: 10,
                    dataRegistro: data.dataRegistro,
                    faseCicloAssociada: data.faseCicloAssociada,
                    versao: 0,
                    categorias: [
                        {
                            categoriaId: 'anotacao_livre',
                            macrocategoriaNome: 'Saúde e Acompanhamento',
                            categoriaNome: 'Anotação livre',
                            valorEscalado: null,
                            casasDecimais: null,
                            valorDuracaoMinutos: null,
                            valorTexto: 'Hoje.',
                            opcoes: []
                        }
                    ],
                    criadoEm: new Date('2026-11-08T12:00:00Z'),
                    atualizadoEm: new Date('2026-11-08T12:00:00Z')
                };
            }
        }
    };
    return {
        prisma: { $transaction: async (operacao) => operacao(tx) },
        bootstrap: { garantir: async () => undefined },
        phaseService: { resolver: async () => 'menstrual' },
        thermalRecalculation: {
            recalcularPorDatas: async (...argumentos) => chamadasTermicas.push(argumentos)
        },
        chamadas,
        chamadasTermicas
    };
}

function dados(data, fusoHorario = 'UTC') {
    return validarCriacaoRegistro({
        data,
        fusoHorario,
        categorias: [{ categoriaId: 'anotacao_livre', texto: 'Hoje.' }]
    });
}

test('cria registro com identidade da sessão e snapshot da fase', async () => {
    const cenario = criarCenario();
    const service = criarDiaryEntryService({
        ...cenario,
        agora: () => new Date('2026-11-08T12:00:00Z')
    });
    const resultado = await service.criar(7, dados('2026-11-08'));

    assert.equal(cenario.chamadas[0].usuarioId, 7);
    assert.equal(cenario.chamadas[0].faseCicloAssociada, 'menstrual');
    assert.equal(resultado.categorias[0].texto, 'Hoje.');
    assert.deepEqual(cenario.chamadasTermicas[0].slice(0, 2), [7, ['2026-11-08']]);
});

test('compara data futura no fuso informado', async () => {
    const cenario = criarCenario();
    const service = criarDiaryEntryService({
        ...cenario,
        agora: () => new Date('2026-11-08T02:00:00Z')
    });

    await assert.rejects(() => service.criar(7, dados('2026-11-08', 'America/Sao_Paulo')), {
        codigo: 'DATA_REGISTRO_FUTURA'
    });
    assert.deepEqual(cenario.chamadas, []);
});
