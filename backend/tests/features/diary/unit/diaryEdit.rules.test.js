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

test('rejeita o envio de categoria inativa mesmo quando permanece idêntica', () => {
    assert.throws(() => validarEdicaoCategorias([nova], [atual], macroInativa, []), {
        codigo: 'CATEGORIA_DIARIO_INATIVA'
    });
});

test('rejeita alteração explícita de categoria inativa', () => {
    const alterada = validarCategoriaPreenchida({
        categoriaId: 'anotacao_livre',
        texto: 'Alterada'
    });
    assert.throws(() => validarEdicaoCategorias([alterada], [atual], macroInativa, []), {
        codigo: 'CATEGORIA_DIARIO_INATIVA'
    });
});

test('permite omitir categoria inativa para preservá-la no servidor', () => {
    assert.doesNotThrow(() => validarEdicaoCategorias([], [atual], macroInativa, []));
});
