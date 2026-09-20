import { formatDate } from '../utils/date/formatDate';

test('formata a digitação de uma data sem perder dígitos parciais', () => {
    expect(formatDate('08')).toBe('08');
    expect(formatDate('0804')).toBe('08/04');
    expect(formatDate('08041999')).toBe('08/04/1999');
    expect(formatDate('08/04/1999')).toBe('08/04/1999');
});

test('limita a data a oito dígitos e ignora entrada não textual', () => {
    expect(formatDate('0804199912')).toBe('08/04/1999');
    expect(formatDate(null)).toBe('');
});
