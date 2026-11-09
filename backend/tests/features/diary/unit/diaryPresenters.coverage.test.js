import assert from 'node:assert/strict';
import test from 'node:test';

import { OPCOES_POR_ID } from '../../../../src/features/diary/catalog/diaryCatalog.lookup.js';
import {
    apresentarDecimal,
    apresentarDetalheRegistro
} from '../../../../src/features/diary/presenters/diaryEntry.presenter.js';
import { apresentarResumoRegistro } from '../../../../src/features/diary/presenters/diaryHistory.presenter.js';

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

    const detalhe = apresentarDetalheRegistro(registro);
    assert.equal(detalhe.categorias.find((item) => item.id === 'temperatura_basal').valor, '36.7');
    assert.equal(
        detalhe.categorias.find((item) => item.id === 'temperatura_basal').motivoPerturbacao,
        'Febre'
    );
    assert.equal(detalhe.categorias.find((item) => item.id === 'tempo_sono').duracaoMinutos, 480);
    assert.equal(detalhe.categorias.find((item) => item.texto).quantidadeCaracteres, 7);
});


