import assert from 'node:assert/strict';
import test from 'node:test';

import { OPCOES_POR_ID } from '../../../../src/features/diary/catalog/diaryCatalog.lookup.js';
import {
    apresentarDecimal,
    apresentarDetalheRegistro
} from '../../../../src/features/diary/presenters/diaryEntry.presenter.js';
import {
    apresentarResumoRegistro,
    criarTrechoAnotacao,
    obterNomeMicrocategoria
} from '../../../../src/features/diary/presenters/diaryHistory.presenter.js';

const instante = new Date('2026-11-08T12:00:00.000Z');

function categoria(base) {
    return {
        categoriaId: 'anotacao_livre',
        macrocategoriaNome: 'Saúde',
        categoriaNome: 'Anotação livre',
        valorEscalado: null,
        casasDecimais: null,
        valorDuracaoMinutos: null,
        valorTexto: null,
        opcoes: [],
        ...base
    };
}

test('apresenta todos os formatos, ordenações e metadados térmicos', () => {
    assert.equal(apresentarDecimal(null, 1), null);
    assert.equal(apresentarDecimal(12, null), null);
    assert.equal(apresentarDecimal(-12, 1), '-1.2');
    assert.equal(apresentarDecimal(12, 0), '12');

    const opcao = [...OPCOES_POR_ID.values()].find(
        (item) => item.categoriaId === 'sintomas_fisicos'
    );
    const registro = {
        id: 1,
        dataRegistro: instante,
        faseCicloAssociada: 'lutea',
        versao: 2,
        criadoEm: instante,
        atualizadoEm: instante,
        categorias: [
            categoria({
                categoriaId: 'tempo_sono',
                categoriaNome: 'Tempo',
                valorDuracaoMinutos: 480
            }),
            categoria({
                categoriaId: 'temperatura_basal',
                categoriaNome: 'Temperatura',
                valorEscalado: 367,
                casasDecimais: 1,
                medicaoTemperatura: { perturbada: true, motivoPerturbacao: 'Febre' }
            }),
            categoria({
                categoriaId: 'sintomas_fisicos',
                categoriaNome: 'Sintomas',
                opcoes: [
                    { opcaoId: 'desconhecida', grupo: null, opcaoNome: 'Z' },
                    { opcaoId: opcao.id, grupo: opcao.grupo, opcaoNome: opcao.nome }
                ]
            }),
            categoria({ valorTexto: '😀 texto' }),
            categoria({ categoriaId: 'desconhecida', categoriaNome: 'Desconhecida' })
        ]
    };

    const detalhe = apresentarDetalheRegistro(registro, { dia: 21, numero: 3 });
    assert.deepEqual(detalhe.ciclo, { dia: 21, numero: 3 });
    assert.equal(detalhe.categorias.find((item) => item.id === 'temperatura_basal').valor, '36.7');
    assert.equal(
        detalhe.categorias.find((item) => item.id === 'temperatura_basal').motivoPerturbacao,
        'Febre'
    );
    assert.equal(detalhe.categorias.find((item) => item.id === 'tempo_sono').duracaoMinutos, 480);
    assert.equal(detalhe.categorias.find((item) => item.texto).quantidadeCaracteres, 7);
});

test('apresenta valores ausentes e ordenação desconhecida', () => {
    const opcao = [...OPCOES_POR_ID.values()].find(
        (item) => item.categoriaId === 'sintomas_fisicos'
    );
    const registro = {
        id: 1,
        dataRegistro: instante,
        faseCicloAssociada: null,
        versao: 0,
        criadoEm: instante,
        atualizadoEm: instante,
        categorias: []
    };
    const semMotivo = apresentarDetalheRegistro({
        ...registro,
        categorias: [
            categoria({
                categoriaId: 'temperatura_basal',
                valorEscalado: 360,
                casasDecimais: 1,
                medicaoTemperatura: null
            })
        ]
    });
    assert.equal(semMotivo.categorias[0].perturbada, false);
    assert.equal('motivoPerturbacao' in semMotivo.categorias[0], false);

    apresentarDetalheRegistro({
        ...registro,
        categorias: [
            categoria({ categoriaId: 'desconhecida_a', opcoes: undefined }),
            categoria({ categoriaId: 'desconhecida_b', opcoes: undefined }),
            categoria({ categoriaId: 'peso' }),
            categoria({ categoriaId: 'temperatura_basal' }),
            categoria({
                categoriaId: 'sintomas_fisicos',
                opcoes: [
                    { opcaoId: opcao.id, grupo: null, opcaoNome: 'Conhecida' },
                    { opcaoId: 'desconhecida_a', grupo: null, opcaoNome: 'A' },
                    { opcaoId: 'desconhecida_b', grupo: null, opcaoNome: 'B' }
                ]
            })
        ]
    });
});

test('resumo cobre decimal, duração, ausência de valor e desempates', () => {
    const opcao = [...OPCOES_POR_ID.values()].find(
        (item) => item.categoriaId === 'sintomas_fisicos'
    );
    const base = {
        id: 1,
        dataRegistro: instante,
        faseCicloAssociada: null,
        versao: 0,
        atualizadoEm: instante
    };
    const resumo = apresentarResumoRegistro(
        {
            ...base,
            categorias: [
                categoria({
                    categoriaId: 'peso',
                    categoriaNome: 'Peso',
                    valorEscalado: 605,
                    casasDecimais: 1
                }),
                categoria({
                    categoriaId: 'tempo_sono',
                    categoriaNome: 'Sono',
                    valorDuracaoMinutos: 450
                }),
                categoria({
                    categoriaId: 'sintomas_fisicos',
                    categoriaNome: 'Sintomas',
                    opcoes: [{ opcaoId: opcao.id, opcaoNome: opcao.nome }]
                }),
                categoria({ categoriaId: 'anotacao_livre', valorTexto: '' }),
                categoria({ categoriaId: 'peso', categoriaNome: 'Peso vazio' }),
                categoria({ categoriaId: 'desconhecida' })
            ]
        },
        new Set(['peso', 'tempo_sono', 'sintomas_fisicos', 'anotacao_livre', 'desconhecida'])
    );
    assert.equal(resumo.principais.length, 3);
    assert.equal(resumo.maisQuantidade, 0);
    assert.equal(resumo.trechoAnotacao, null);

    const opcoes = [...OPCOES_POR_ID.values()]
        .filter((item) => item.categoriaId === 'sintomas_fisicos')
        .slice(0, 2);
    const somenteOpcoes = apresentarResumoRegistro(
        {
            ...base,
            categorias: [
                categoria({
                    categoriaId: 'sintomas_fisicos',
                    categoriaNome: 'Sintomas',
                    opcoes: [
                        ...opcoes.map((item) => ({ opcaoId: item.id, opcaoNome: item.nome })),
                        { opcaoId: 'inexistente', opcaoNome: 'Outro' }
                    ]
                }),
                categoria({ categoriaId: 'peso' })
            ]
        },
        new Set(['sintomas_fisicos', 'peso'])
    );
    assert.equal(somenteOpcoes.principais.length, 1);
});

test('resumo nomeia a microcategoria específica de banheiro', () => {
    const intestinal = [...OPCOES_POR_ID.values()].find(
        (item) => item.categoriaId === 'banheiro' && item.grupo === 'intestino'
    );
    const urinaria = [...OPCOES_POR_ID.values()].find(
        (item) => item.categoriaId === 'banheiro' && item.grupo === 'urina'
    );
    const banheiro = (opcoes) => ({
        categoriaId: 'banheiro',
        categoriaNome: 'Banheiro',
        opcoes
    });
    assert.equal(obterNomeMicrocategoria({ categoriaId: 'pele', categoriaNome: 'Pele' }), 'Pele');
    assert.equal(obterNomeMicrocategoria(banheiro([])), 'Banheiro');
    assert.equal(obterNomeMicrocategoria(banheiro([{ opcaoId: intestinal.id }])), 'Intestino');
    assert.equal(obterNomeMicrocategoria(banheiro([{ opcaoId: urinaria.id }])), 'Urina');
    assert.equal(
        obterNomeMicrocategoria(banheiro([{ opcaoId: intestinal.id }, { opcaoId: urinaria.id }])),
        'Banheiro'
    );
    assert.equal(obterNomeMicrocategoria(banheiro([{ opcaoId: 'inexistente' }])), 'Banheiro');
});

test('trecho da anotação cobre entradas inválidas, curtas e truncadas', () => {
    for (const [valor, limite] of [
        [null, 100],
        ['', 100],
        ['texto', 1],
        ['texto', 1.5]
    ]) {
        assert.equal(criarTrechoAnotacao(valor, limite), null);
    }
    assert.equal(criarTrechoAnotacao('texto', 5), 'texto');
    assert.equal(criarTrechoAnotacao('texto maior', 6), 'texto…');
});
