import {
    converterEntradaNumerica,
    sanitizarEntradaNumerica
} from '../../../src/shared/components/forms/NumberInput/numberInputValue';

describe('valor do campo numérico', () => {
    test('mantém inteiros compatíveis com o componente existente', () => {
        expect(converterEntradaNumerica('35 dias')).toBe(35);
        expect(converterEntradaNumerica('')).toBeNull();
        expect(sanitizarEntradaNumerica(null)).toBe('');
    });

    test('preserva decimal digitado sem arredondamento', () => {
        expect(converterEntradaNumerica('36.58', 1, 2)).toBe('36,5');
        expect(converterEntradaNumerica(',5', 1, 2)).toBe('0,5');
        expect(converterEntradaNumerica('123,4', 1, 2)).toBe('12,4');
        expect(converterEntradaNumerica('36,5,9', 1, 2)).toBe('36,5');
    });

    test('aceita inteiro durante a digitação decimal', () => {
        expect(sanitizarEntradaNumerica('36', 1, 2)).toBe('36');
    });
});
