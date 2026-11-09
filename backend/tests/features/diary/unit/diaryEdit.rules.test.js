import assert from 'node:assert/strict';
import test from 'node:test';

import { validarCategoriaPreenchida } from '../../../../src/features/diary/validators/diaryCategory.validator.js';
import { validarEdicaoCategorias } from '../../../../src/features/diary/services/diaryEdit.rules.js';

const nova = validarCategoriaPreenchida({ categoriaId: 'anotacao_livre', texto: 'Original' });
const atual = {
    categoriaId: 'anotacao_livre',
    valorEscalado: null,
    casasDecimais: null,
    valorDuracaoMinutos: null,
    valorTexto: 'Original',
    opcoes: []
};
const macroInativa = [{ macrocategoriaId: 'saude_acompanhamento', ativa: false }];

test('preserva categoria inativa quando permanece idêntica', () => {
    assert.doesNotThrow(() => validarEdicaoCategorias([nova], [atual], macroInativa, []));
});

test('rejeita alteração de categoria inativa', () => {
    const alterada = validarCategoriaPreenchida({
        categoriaId: 'anotacao_livre',
        texto: 'Alterada'
    });
    assert.throws(() => validarEdicaoCategorias([alterada], [atual], macroInativa, []), {
        codigo: 'CATEGORIA_DIARIO_INATIVA'
    });
});

test('rejeita omissão de categoria inativa', () => {
    assert.throws(() => validarEdicaoCategorias([], [atual], macroInativa, []), {
        codigo: 'CATEGORIA_INATIVA_OMITIDA'
    });
});
