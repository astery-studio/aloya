import assert from 'node:assert/strict';
import test from 'node:test';

import { CATEGORIAS_POR_ID } from '../../../../src/features/diary/catalog/diaryCatalog.lookup.js';
import { validarCriacaoRegistro } from '../../../../src/features/diary/validators/diaryEntry.validator.js';

test('normaliza opções, decimal, duração e texto do protótipo', () => {
    const opcao = CATEGORIAS_POR_ID.get('sintomas_fisicos').opcoes[0];
    const resultado = validarCriacaoRegistro({
        data: '2026-11-08',
        fusoHorario: 'America/Sao_Paulo',
        categorias: [
            { categoriaId: 'sintomas_fisicos', opcoes: [opcao.id] },
            { categoriaId: 'temperatura_basal', valor: '36,7' },
            { categoriaId: 'tempo_sono', duracaoMinutos: 480 },
            { categoriaId: 'anotacao_livre', texto: 'Sem alterações.' }
        ]
    });

    assert.equal(resultado.categorias[1].valorEscalado, 367);
    assert.equal(resultado.categorias[1].casasDecimais, 1);
    assert.deepEqual(resultado.categorias[1].medicaoTemperatura, {
        valorOriginal: '36,7',
        unidade: 'celsius',
        precisaoCasas: 1,
        perturbada: false,
        motivoPerturbacao: null,
        estadoUtilizacao: 'elegivel'
    });
    assert.equal(resultado.categorias[2].valorDuracaoMinutos, 480);
    assert.equal(resultado.categorias[3].valorTexto, 'Sem alterações.');
});

test('valida faixa técnica e perturbação da temperatura', () => {
    const base = { data: '2026-11-08', fusoHorario: 'UTC' };
    const resultado = validarCriacaoRegistro({
        ...base,
        categorias: [
            {
                categoriaId: 'temperatura_basal',
                valor: '36,4',
                perturbada: true,
                motivoPerturbacao: 'Sono interrompido'
            }
        ]
    });
    assert.equal(resultado.categorias[0].medicaoTemperatura.perturbada, true);
    assert.equal(
        resultado.categorias[0].medicaoTemperatura.estadoUtilizacao,
        'nao_utilizada_interferencia'
    );
    for (const valor of ['31,9', '42,1']) {
        assert.throws(
            () =>
                validarCriacaoRegistro({
                    ...base,
                    categorias: [{ categoriaId: 'temperatura_basal', valor }]
                }),
            { codigo: 'TEMPERATURA_FORA_INTERVALO_TECNICO' }
        );
    }
});

test('rejeita campos desconhecidos e categoria duplicada', () => {
    const base = {
        data: '2026-11-08',
        fusoHorario: 'UTC',
        categorias: [{ categoriaId: 'anotacao_livre', texto: 'a' }]
    };
    assert.throws(() => validarCriacaoRegistro({ ...base, usuarioId: 1 }), {
        codigo: 'CAMPO_DESCONHECIDO'
    });
    assert.throws(
        () =>
            validarCriacaoRegistro({
                ...base,
                categorias: [...base.categorias, ...base.categorias]
            }),
        { codigo: 'CATEGORIA_DIARIO_DUPLICADA' }
    );
});
