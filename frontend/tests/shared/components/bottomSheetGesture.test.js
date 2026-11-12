import {
    deveFecharPorArraste,
    deveIniciarArraste
} from '../../../src/shared/components/feedback/BottomSheet/bottomSheetGesture';

describe('gestos do BottomSheet', () => {
    test('inicia somente um arraste vertical para baixo quando permitido', () => {
        expect(deveIniciarArraste({ dx: 1, dy: 6 })).toBe(true);
        expect(deveIniciarArraste({ dx: 1, dy: 6 }, true)).toBe(false);
        expect(deveIniciarArraste({ dx: 1, dy: 5 })).toBe(false);
        expect(deveIniciarArraste({ dx: 12, dy: 9 })).toBe(false);
        expect(deveIniciarArraste()).toBe(false);
    });

    test('fecha por distância ou velocidade suficiente', () => {
        expect(deveFecharPorArraste({ dy: 48 })).toBe(true);
        expect(deveFecharPorArraste({ dy: 1, vy: 0.35 })).toBe(true);
        expect(deveFecharPorArraste({ dy: 47, vy: 0.34 })).toBe(false);
        expect(deveFecharPorArraste()).toBe(false);
    });
});
