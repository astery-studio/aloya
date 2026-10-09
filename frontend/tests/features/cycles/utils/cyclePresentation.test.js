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

test('gera a faixa inicial com três dias anteriores à data de referência', () => {
    const dias = criarDiasDaFaixa('2026-10-05', fases);
    expect(dias).toHaveLength(16);
    expect(dias[0].data).toBe('2026-10-02');
    expect(dias[15].data).toBe('2026-10-17');
    expect(dias[3].hoje).toBe(true);
    expect(formatarDataLonga('2026-10-14')).toBe('14 de outubro');
});

test('gera páginas adicionais em qualquer direção mantendo a referência identificada', () => {
    const anteriores = criarDiasDaFaixa('2026-10-05', fases, -17, 14);
    const posteriores = criarDiasDaFaixa('2026-10-05', fases, 13, 14);

    expect(anteriores[0].data).toBe('2026-09-18');
    expect(anteriores.at(-1).data).toBe('2026-10-01');
    expect(anteriores.some(({ hoje }) => hoje)).toBe(false);
    expect(posteriores[0].data).toBe('2026-10-18');
    expect(posteriores.at(-1).data).toBe('2026-10-31');
});
