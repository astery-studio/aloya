import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDiaryEditService } from '../../../../src/features/diary/services/diaryEdit.service.js';
import { validarCriacaoRegistro } from '../../../../src/features/diary/validators/diaryEntry.validator.js';

test('edição de data recalcula os ciclos de origem e destino', async () => {
    const recalculos = [];
    const atual = {
        id: 10,
        usuarioId: 7,
        dataRegistro: new Date('2026-11-08T00:00:00.000Z'),
        faseCicloAssociada: 'menstrual',
        versao: 2,
        criadoEm: new Date('2026-11-08T12:00:00.000Z'),
        atualizadoEm: new Date('2026-11-08T12:00:00.000Z'),
        categorias: [
            {
                categoriaId: 'anotacao_livre',
                macrocategoriaNome: 'Saúde e Acompanhamento',
                categoriaNome: 'Anotação livre',
                valorEscalado: null,
                casasDecimais: null,
                valorDuracaoMinutos: null,
                valorTexto: 'Antes',
                opcoes: [],
                medicaoTemperatura: null
            }
        ]
    };
    const tx = {
        registroDiario: {
            findFirst: async () => atual,
            update: async ({ data }) => ({
                ...atual,
                dataRegistro: data.dataRegistro,
                faseCicloAssociada: data.faseCicloAssociada,
                versao: 3,
                categorias: [{ ...atual.categorias[0], valorTexto: 'Depois' }]
            })
        },
        preferenciaMacrocategoriaDiario: { findMany: async () => [] },
        preferenciaCategoriaDiario: { findMany: async () => [] }
    };
    const service = criarDiaryEditService({
        prisma: { $transaction: async (operacao) => operacao(tx) },
        bootstrap: { garantir: async () => undefined },
        phaseService: { resolver: async () => 'folicular' },
        thermalRecalculation: {
            recalcularPorDatas: async (...argumentos) => recalculos.push(argumentos)
        },
        agora: () => new Date('2026-11-08T15:00:00.000Z')
    });
    const dados = validarCriacaoRegistro({
        data: '2026-11-07',
        fusoHorario: 'UTC',
        categorias: [{ categoriaId: 'anotacao_livre', texto: 'Depois' }]
    });

    const resultado = await service.editar(7, 10, 2, dados);

    assert.equal(resultado.data, '2026-11-07');
    assert.equal(resultado.fase, 'folicular');
    assert.deepEqual(recalculos[0].slice(0, 2), [7, ['2026-11-08', '2026-11-07']]);
});

test('preserva categoria inativa no banco e a oculta da resposta de edição', async () => {
    const atual = {
        id: 10,
        usuarioId: 7,
        dataRegistro: new Date('2026-11-08T00:00:00.000Z'),
        faseCicloAssociada: 'folicular',
        versao: 2,
        criadoEm: new Date('2026-11-08T12:00:00.000Z'),
        atualizadoEm: new Date('2026-11-08T12:00:00.000Z'),
        categorias: [
            {
                categoriaId: 'anotacao_livre',
                macrocategoriaNome: 'Saúde e Acompanhamento',
                categoriaNome: 'Anotação livre',
                valorEscalado: null,
                casasDecimais: null,
                valorDuracaoMinutos: null,
                valorTexto: 'Antes',
                opcoes: [],
                medicaoTemperatura: null
            },
            {
                categoriaId: 'sintomas_emocionais',
                macrocategoriaNome: 'Emocional',
                categoriaNome: 'Sintomas emocionais',
                valorEscalado: null,
                casasDecimais: null,
                valorDuracaoMinutos: null,
                valorTexto: null,
                opcoes: [],
                medicaoTemperatura: null
            }
        ]
    };
    let dadosAtualizacao;
    const tx = {
        registroDiario: {
            findFirst: async () => atual,
            update: async ({ data }) => {
                dadosAtualizacao = data;
                return {
                    ...atual,
                    versao: 3,
                    categorias: [
                        { ...atual.categorias[0], valorTexto: 'Depois' },
                        atual.categorias[1]
                    ]
                };
            }
        },
        preferenciaMacrocategoriaDiario: { findMany: async () => [] },
        preferenciaCategoriaDiario: {
            findMany: async () => [{ categoriaId: 'sintomas_emocionais', ativa: false }]
        }
    };
    const service = criarDiaryEditService({
        prisma: { $transaction: async (operacao) => operacao(tx) },
        bootstrap: { garantir: async () => undefined },
        phaseService: { resolver: async () => 'folicular' },
        thermalRecalculation: { recalcularPorDatas: async () => undefined },
        agora: () => new Date('2026-11-08T15:00:00.000Z')
    });
    const dados = validarCriacaoRegistro({
        data: '2026-11-08',
        fusoHorario: 'UTC',
        categorias: [{ categoriaId: 'anotacao_livre', texto: 'Depois' }]
    });

    const resultado = await service.editar(7, 10, 2, dados);

    assert.ok(dadosAtualizacao.categorias.deleteMany.categoriaId.in.includes('anotacao_livre'));
    assert.equal(
        dadosAtualizacao.categorias.deleteMany.categoriaId.in.includes('sintomas_emocionais'),
        false
    );
    assert.deepEqual(resultado.categorias.map(({ id }) => id), ['anotacao_livre']);
});
