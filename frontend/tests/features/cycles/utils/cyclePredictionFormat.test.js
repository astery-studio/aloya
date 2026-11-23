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
