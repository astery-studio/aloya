import {
    decomporData,
    deslocarDataDiario,
    formatarDataDiario,
    obterHojeDiario
} from '../../../../src/features/diary/utils/diaryDate';

describe('datas civis do Diário', () => {
    test('valida e formata data sem conversão de fuso', () => {
        expect(formatarDataDiario('2026-11-09')).toBe('09/11/2026');
        expect(formatarDataDiario('2026-02-30')).toBe('');
        expect(decomporData(null)).toBeNull();
    });

    test('desloca datas nos limites de mês e ano', () => {
        expect(deslocarDataDiario('2026-12-31', 1)).toBe('2027-01-01');
        expect(deslocarDataDiario('2026-03-01', -1)).toBe('2026-02-28');
        expect(deslocarDataDiario('inválida', 1)).toBeNull();
        expect(deslocarDataDiario('2026-01-01', 1.5)).toBeNull();
    });

    test('obtém hoje pelo calendário local do dispositivo', () => {
        expect(obterHojeDiario(new Date(2026, 10, 9, 23, 59))).toBe('2026-11-09');
        expect(obterHojeDiario()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
