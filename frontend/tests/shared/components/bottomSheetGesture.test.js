import {
    deveFecharPorArraste,
    deveIniciarArraste
} from '../../../src/shared/components/feedback/BottomSheet/bottomSheetGesture';

describe('gestos do BottomSheet', () => {
    test('inicia somente um arraste vertical para baixo quando permitido', () => {
        expect(deveIniciarArraste({ dx: 1, dy: 9 })).toBe(true);
        expect(deveIniciarArraste({ dx: 1, dy: 9 }, true)).toBe(false);
        expect(deveIniciarArraste({ dx: 1, dy: 8 })).toBe(false);
        expect(deveIniciarArraste({ dx: 12, dy: 9 })).toBe(false);
        expect(deveIniciarArraste()).toBe(false);
    });

    test('fecha por distância ou velocidade suficiente', () => {
        expect(deveFecharPorArraste({ dy: 80 })).toBe(true);
        expect(deveFecharPorArraste({ dy: 1, vy: 0.8 })).toBe(true);
        expect(deveFecharPorArraste({ dy: 79, vy: 0.79 })).toBe(false);
        expect(deveFecharPorArraste()).toBe(false);
    });
});
