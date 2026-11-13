import { ehMenorDe16 } from '../../../../src/features/support-network/utils/age';

describe('ehMenorDe16', () => {
    const hoje = new Date(2026, 10, 10);

    test('identifica quem ainda não completou 16 anos', () => {
        expect(ehMenorDe16('2010-11-11', hoje)).toBe(true);
    });

    test('remove a restrição no aniversário de 16 anos', () => {
        expect(ehMenorDe16('2010-11-10', hoje)).toBe(false);
    });

    test('rejeita datas ausentes ou inválidas', () => {
        expect(ehMenorDe16('', hoje)).toBe(false);
        expect(ehMenorDe16('data-invalida', hoje)).toBe(false);
    });
});
