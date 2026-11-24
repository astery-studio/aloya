import { AccessibilityInfo } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useReducedMotion } from '../../src/shared/hooks/useReducedMotion';

afterEach(() => jest.restoreAllMocks());

test('acompanha a preferência de redução de movimento e remove o listener', async () => {
    let atualizarPreferencia;
    const remover = jest.fn();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation((evento, callback) => {
        expect(evento).toBe('reduceMotionChanged');
        atualizarPreferencia = callback;
        return { remove: remover };
    });

    const { result, unmount } = await renderHook(() => useReducedMotion());

    await waitFor(() => expect(result.current).toBe(true));
    await act(() => atualizarPreferencia(false));
    expect(result.current).toBe(false);

    await unmount();
    expect(remover).toHaveBeenCalledTimes(1);
});
