import assert from 'node:assert/strict';
import test from 'node:test';

import { validarCategoriaPreenchida } from '../../../../src/features/diary/validators/diaryCategory.validator.js';

function anotacao(texto) {
    return validarCategoriaPreenchida({ categoriaId: 'anotacao_livre', texto });
}

for (const tamanho of [4999, 5000]) {
    test(`aceita anotação com ${tamanho} caracteres`, () => {
        const texto = 'á'.repeat(tamanho);
        assert.equal(anotacao(texto).valorTexto, texto);
    });
}

test('rejeita anotação vazia ou acima do limite', () => {
    assert.throws(() => anotacao(''), { codigo: 'ANOTACAO_INVALIDA' });
    assert.throws(() => anotacao('a'.repeat(5001)), { codigo: 'ANOTACAO_INVALIDA' });
});

test('conta Unicode por ponto de código e preserva o conteúdo', () => {
    const texto = 'Saúde 🌷\n<script>alert("x")</script>';
    const resultado = anotacao(texto);

    assert.equal(resultado.valorTexto, texto);
    assert.equal([...resultado.valorTexto].length, [...texto].length);
});

for (const texto of [undefined, null, 42, {}, []]) {
    test(`rejeita tipo inesperado: ${String(texto)}`, () => {
        assert.throws(() => anotacao(texto), { codigo: 'ANOTACAO_INVALIDA' });
    });
}
