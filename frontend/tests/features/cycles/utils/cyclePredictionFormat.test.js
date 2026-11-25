import {
    formatarJanelaFertil,
    separarData
} from '../../../../src/features/cycles/utils/cyclePredictionFormat';

test('separa dia e mês para a composição visual da previsão', () => {
    expect(separarData('2026-09-18')).toEqual({ dia: '18', mes: 'setembro' });
});

test('compacta a janela fértil quando as datas estão no mesmo mês', () => {
    expect(formatarJanelaFertil({ inicio: '2026-09-06', fim: '2026-09-12' })).toBe(
        '6–12 de setembro'
    );
    expect(formatarJanelaFertil(null)).toBe('Indisponível');
});

test('mantém os dois meses em uma janela que atravessa a virada do mês', () => {
    expect(formatarJanelaFertil({ inicio: '2026-09-28', fim: '2026-10-03' })).toBe(
        '28 de setembro – 3 de outubro'
    );
});

test.each([
    { inicio: null, fim: '2026-10-03' },
    { inicio: '2026-09-28', fim: 'inválido' }
])('exibe indisponibilidade se uma das pontas da janela for inválida (%#)', (janela) => {
    expect(formatarJanelaFertil(janela)).toBe('Indisponível');
});
