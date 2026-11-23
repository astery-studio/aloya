import assert from 'node:assert/strict';
import test from 'node:test';

import { validarCategoriaPreenchida } from '../../../../src/features/diary/validators/diaryCategory.validator.js';
import { validarCategoriasAtivas } from '../../../../src/features/diary/services/diaryEntry.data.js';

const categoria = validarCategoriaPreenchida({
    categoriaId: 'anotacao_livre',
    texto: 'Preservar histórico.'
});

test('aceita ausência de preferências como estado ativo padrão', () => {
    assert.doesNotThrow(() => validarCategoriasAtivas([categoria], [], []));
});

test('rejeita categoria individualmente inativa', () => {
    assert.throws(
        () =>
            validarCategoriasAtivas(
                [categoria],
                [],
                [{ categoriaId: 'anotacao_livre', ativa: false }]
            ),
        { codigo: 'CATEGORIA_DIARIO_INATIVA' }
    );
});

test('rejeita categoria quando a macro está inativa sem mudar estado individual', () => {
    assert.throws(
        () =>
            validarCategoriasAtivas(
                [categoria],
                [{ macrocategoriaId: 'saude_acompanhamento', ativa: false }],
                [{ categoriaId: 'anotacao_livre', ativa: true }]
            ),
        { codigo: 'CATEGORIA_DIARIO_INATIVA' }
    );
});
