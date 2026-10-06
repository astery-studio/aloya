import { criarDiasDaFaixa, formatarDataLonga, obterDiaCiclo, obterFase } from '../../../../src/features/cycles/utils/cyclePresentation';

const fases = {
    menstrual: { inicio: '2026-10-01', fim: '2026-10-05' },
    folicularPosMenstrual: { inicio: '2026-10-06', fim: '2026-10-13' },
    ovulatoria: { data: '2026-10-14' },
    lutea: { inicio: '2026-10-15', fim: '2026-10-28' }
};

test('identifica as fases sem deslocar datas UTC', () => {
    expect(obterFase('2026-10-03', fases)).toBe('menstrual');
    expect(obterFase('2026-10-08', fases)).toBe('folicular');
    expect(obterFase('2026-10-14', fases)).toBe('ovulatoria');
    expect(obterFase('2026-10-20', fases)).toBe('lutea');
    expect(obterDiaCiclo('2026-10-08', fases)).toBe(8);
});

test('gera sete dias ao redor da data selecionada', () => {
    const dias = criarDiasDaFaixa('2026-10-05', fases);
    expect(dias).toHaveLength(7);
    expect(dias[0].data).toBe('2026-10-02');
    expect(dias[6].data).toBe('2026-10-08');
    expect(formatarDataLonga('2026-10-14')).toBe('14 de outubro');
});
