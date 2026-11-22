import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDiaryEntryService } from '../../../../src/features/diary/services/diaryEntry.service.js';
import { validarCriacaoRegistro } from '../../../../src/features/diary/validators/diaryEntry.validator.js';

function criarCenario(existente = null) {
    const chamadas = [];
    const chamadasTermicas = [];
    const tx = {
        preferenciaMacrocategoriaDiario: { findMany: async () => [] },
        preferenciaCategoriaDiario: { findMany: async () => [] },
        registroDiario: {
            findFirst: async () => existente,
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
            },
            update: async ({ data }) => {
                chamadas.push(data);
                return {
                    ...existente,
                    faseCicloAssociada: data.faseCicloAssociada,
                    versao: existente.versao + 1,
                    categorias: [
                        ...existente.categorias,
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
        tx,
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

test('atualiza transparentemente registro composto apenas por categoria inativa', async () => {
    const existente = {
        id: 10,
        dataRegistro: new Date('2026-11-08T00:00:00Z'),
        faseCicloAssociada: 'folicular',
        versao: 2,
        categorias: [{ categoriaId: 'humor', opcoes: [] }],
        criadoEm: new Date('2026-11-08T10:00:00Z'),
        atualizadoEm: new Date('2026-11-08T10:00:00Z')
    };
    const cenario = criarCenario(existente);
    cenario.tx.preferenciaCategoriaDiario.findMany = async () => [
        { categoriaId: 'humor', ativa: false }
    ];
    const service = criarDiaryEntryService({
        ...cenario,
        agora: () => new Date('2026-11-08T12:00:00Z')
    });

    const resultado = await service.criar(7, dados('2026-11-08'));

    assert.equal(resultado.id, 10);
    assert.equal(resultado.versao, 3);
    assert.deepEqual(
        resultado.categorias.map(({ id }) => id),
        ['anotacao_livre']
    );
    assert.equal(cenario.chamadas[0].categorias.create.length, 1);
});

test('falha térmica impede a conclusão da transação de criação', async () => {
    const cenario = criarCenario();
    let concluida = false;
    cenario.prisma.$transaction = async (operacao) => {
        const resultado = await operacao(cenario.tx);
        concluida = true;
        return resultado;
    };
    cenario.thermalRecalculation.recalcularPorDatas = async () => {
        throw new Error('falha térmica');
    };
    const service = criarDiaryEntryService({
        ...cenario,
        agora: () => new Date('2026-11-08T12:00:00Z')
    });
    await assert.rejects(() => service.criar(7, dados('2026-11-08')), /falha térmica/);
    assert.equal(concluida, false);
});
