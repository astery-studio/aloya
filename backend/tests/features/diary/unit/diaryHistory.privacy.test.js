import assert from 'node:assert/strict';
import test from 'node:test';

import { CATEGORIAS_POR_ID } from '../../../../src/features/diary/catalog/diaryCatalog.lookup.js';
import { apresentarResumoRegistro } from '../../../../src/features/diary/presenters/diaryHistory.presenter.js';

function categoriaComOpcoes(categoriaId, quantidade) {
    const categoria = CATEGORIAS_POR_ID.get(categoriaId);
    return {
        categoriaId,
        categoriaNome: categoria.nome,
        valorEscalado: null,
        casasDecimais: null,
        valorDuracaoMinutos: null,
        valorTexto: null,
        opcoes: categoria.opcoes.slice(0, quantidade).map((opcao) => ({
            opcaoId: opcao.id,
            opcaoNome: opcao.nome
        }))
    };
}

test('resumo não revela saúde sexual nem altera +N por sua existência', () => {
    const sexual = categoriaComOpcoes('atividade_sexual', 1);
    const fisicas = ['sintomas_fisicos', 'pele', 'cabelo', 'digestao'].map((id) =>
        categoriaComOpcoes(id, 1)
    );
    const registro = {
        id: 5,
        dataRegistro: new Date('2026-11-08T00:00:00Z'),
        faseCicloAssociada: 'menstrual',
        versao: 0,
        atualizadoEm: new Date('2026-11-08T12:00:00Z'),
        categorias: [sexual, ...fisicas]
    };
    const resultado = apresentarResumoRegistro(
        registro,
        new Set(['atividade_sexual', 'sintomas_fisicos', 'pele', 'cabelo', 'digestao'])
    );
    const serializado = JSON.stringify(resultado);

    assert.equal(resultado.principais.length, 3);
    assert.equal(resultado.maisQuantidade, 1);
    assert.equal(serializado.includes('atividade_sexual'), false);
    assert.equal(serializado.includes(sexual.opcoes[0].opcaoNome), false);
});

test('trecho da anotação contém no máximo 100 pontos de código', () => {
    const texto = '🌷'.repeat(101);
    const anotacao = {
        categoriaId: 'anotacao_livre',
        categoriaNome: 'Anotação livre',
        valorEscalado: null,
        casasDecimais: null,
        valorDuracaoMinutos: null,
        valorTexto: texto,
        opcoes: []
    };
    const resultado = apresentarResumoRegistro(
        {
            id: 6,
            dataRegistro: new Date('2026-11-08T00:00:00Z'),
            faseCicloAssociada: null,
            versao: 0,
            atualizadoEm: new Date('2026-11-08T12:00:00Z'),
            categorias: [anotacao]
        },
        new Set(['anotacao_livre'])
    );

    assert.equal([...resultado.trechoAnotacao].length, 100);
    assert.equal(resultado.trechoAnotacao.endsWith('…'), true);
});

test('oculta o trecho da anotação quando sua categoria está desativada', () => {
    const resultado = apresentarResumoRegistro(
        {
            id: 7,
            dataRegistro: new Date('2026-11-08T00:00:00Z'),
            faseCicloAssociada: null,
            versao: 0,
            atualizadoEm: new Date('2026-11-08T12:00:00Z'),
            categorias: [
                {
                    categoriaId: 'anotacao_livre',
                    categoriaNome: 'Anotação livre',
                    valorEscalado: null,
                    casasDecimais: null,
                    valorDuracaoMinutos: null,
                    valorTexto: 'Conteúdo oculto',
                    opcoes: []
                }
            ]
        },
        new Set()
    );

    assert.equal(resultado.trechoAnotacao, null);
});
