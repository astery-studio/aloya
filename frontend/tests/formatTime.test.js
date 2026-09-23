import { formatTime } from '../utils/formatting/formatTime';

test('formata horário durante a digitação', () => {
    expect(formatTime('20')).toBe('20');
    expect(formatTime('2030')).toBe('20:30');
    expect(formatTime('20:30')).toBe('20:30');
});

test('limita o horário a quatro dígitos e ignora valores não textuais', () => {
    expect(formatTime('203012')).toBe('20:30');
    expect(formatTime(null)).toBe('');
});
/**
 * Testes da máscara progressiva aplicada às entradas de horário.
 */
