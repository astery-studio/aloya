import {
    alternarOpcao,
    categoriaPreenchida,
    montarCategoriaPayload,
    validarValorCategoria
} from '../../../../src/features/diary/utils/diaryFormValue';

const opcoes = { id: 'sintomas', tipoValor: 'opcoes' };
const texto = { id: 'anotacao_livre', tipoValor: 'texto', limiteCaracteres: 5 };
const duracao = { id: 'tempo_sono', tipoValor: 'duracao_minutos' };
const temperatura = { id: 'temperatura_basal', tipoValor: 'decimal_escalado' };
const peso = { id: 'peso', tipoValor: 'decimal_escalado' };

describe('valores do formulário do Diário', () => {
    test('adiciona e remove opções sem alterar a entrada', () => {
        expect(alternarOpcao(null, 'a')).toEqual(['a']);
        expect(alternarOpcao(['a'], 'b')).toEqual(['a', 'b']);
        expect(alternarOpcao(['a', 'b'], 'a')).toEqual(['b']);
    });

    test('reconhece valores preenchidos por tipo', () => {
        expect(categoriaPreenchida(opcoes, ['a'])).toBe(true);
        expect(categoriaPreenchida(opcoes, [])).toBe(false);
        expect(categoriaPreenchida(texto, ' nota ')).toBe(true);
        expect(categoriaPreenchida(texto, ' ')).toBe(false);
        expect(categoriaPreenchida(duracao, 1)).toBe(true);
        expect(categoriaPreenchida(duracao, 0)).toBe(false);
        expect(categoriaPreenchida(peso, '72,5')).toBe(true);
        expect(categoriaPreenchida(peso, 72.5)).toBe(false);
    });

    test('valida temperatura, texto e valores opcionais', () => {
        expect(validarValorCategoria(temperatura, '32,0')).toBeNull();
        expect(validarValorCategoria(temperatura, '42.1')).toMatch('32,0 e 42,0');
        expect(validarValorCategoria(texto, '123456')).toMatch('no máximo 5');
        expect(validarValorCategoria(opcoes, [])).toBeNull();
        expect(validarValorCategoria(peso, '72,5')).toBeNull();
    });

    test('monta contratos específicos para a API', () => {
        expect(montarCategoriaPayload(opcoes, ['a'])).toEqual({
            categoriaId: 'sintomas',
            opcoes: ['a']
        });
        expect(montarCategoriaPayload(texto, 'nota')).toEqual({
            categoriaId: 'anotacao_livre',
            texto: 'nota'
        });
        expect(montarCategoriaPayload(duracao, 80)).toEqual({
            categoriaId: 'tempo_sono',
            duracaoMinutos: 80
        });
        expect(montarCategoriaPayload(temperatura, '36,5')).toEqual({
            categoriaId: 'temperatura_basal',
            valor: '36.5',
            perturbada: false
        });
        expect(montarCategoriaPayload(peso, '72,5')).toEqual({
            categoriaId: 'peso',
            valor: '72.5'
        });
        expect(montarCategoriaPayload(opcoes, [])).toBeNull();
    });
});
