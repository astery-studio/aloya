import { dataValida, horarioValido } from '../utils/validation/validarCampos';
import { isRequired } from '../utils/validation/isRequired';
import { isValidEmail } from '../utils/validation/isValidEmail';

test('campo obrigatório rejeita texto vazio ou apenas espaços', () => {
    expect(isRequired(' Carla ')).toBe(true);
    expect(isRequired('  ')).toBe(false);
    expect(isRequired(null)).toBe(false);
});

test('e-mail exige formato básico e respeita o limite de tamanho', () => {
    expect(isValidEmail(' pessoa@exemplo.com ')).toBe(true);
    expect(isValidEmail('pessoa@')).toBe(false);
    expect(isValidEmail('a'.repeat(250) + '@exemplo.com')).toBe(false);
});

test('data respeita calendário, formato e ano mínimo', () => {
    expect(dataValida('29/02/2024')).toBe(true);
    expect(dataValida('29/02/2025')).toBe(false);
    expect(dataValida('31/04/2026')).toBe(false);
    expect(dataValida('01/01/1899')).toBe(false);
    expect(dataValida('2026-04-01')).toBe(false);
});

test('validação de horário continua disponível', () => {
    expect(horarioValido('23:59')).toBe(true);
    expect(horarioValido('24:00')).toBe(false);
});
