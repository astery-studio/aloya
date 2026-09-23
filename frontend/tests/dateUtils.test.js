import { formatDate } from '../utils/date/formatDate';
import { isSameDay } from '../utils/date/isSameDay';

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

test('compara o dia local mesmo com horários diferentes', () => {
    expect(isSameDay(new Date(2026, 8, 20, 0), new Date(2026, 8, 20, 23))).toBe(true);
    expect(isSameDay(new Date(2026, 8, 20), new Date(2026, 8, 21))).toBe(false);
});

test('rejeita datas inválidas e valores que não são Date', () => {
    expect(isSameDay(new Date('invalida'), new Date())).toBe(false);
    expect(isSameDay('20/09/2026', new Date())).toBe(false);
});
/**
 * Testes de formatação, validação e comparação dos utilitários de data.
 */
