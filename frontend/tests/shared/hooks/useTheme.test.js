import { renderHook } from '@testing-library/react-native';

import { useTheme } from '../../../src/shared/hooks/useTheme';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';
import { temaClaro, temaEscuro } from '../../../src/shared/theme/themePalettes';

function criarWrapper(preferencia, esquemaDoSistema = 'light') {
    return function Wrapper({ children }) {
        return (
            <ThemeProvider preferencia={preferencia} esquemaDoSistema={esquemaDoSistema}>
                {children}
            </ThemeProvider>
        );
    };
}

describe('useTheme', () => {
    test('retorna o tema claro fornecido pelo contexto', () => {
        const { result } = renderHook(() => useTheme(), {
            wrapper: criarWrapper('claro')
        });

        expect(result.current).toBe(temaClaro);
    });

    test('retorna o tema escuro fornecido pelo contexto', () => {
        const { result } = renderHook(() => useTheme(), {
            wrapper: criarWrapper('escuro')
        });

        expect(result.current).toBe(temaEscuro);
    });

    test('resolve o modo automático pelo sistema', () => {
        const { result } = renderHook(() => useTheme(), {
            wrapper: criarWrapper('automatico', 'dark')
        });

        expect(result.current).toBe(temaEscuro);
    });

    test('mantém o objeto do tema protegido contra alterações', () => {
        const { result } = renderHook(() => useTheme(), {
            wrapper: criarWrapper('claro')
        });

        expect(Object.isFrozen(result.current)).toBe(true);
    });

    test('rejeita uso fora do ThemeProvider', () => {
        expect(() => renderHook(() => useTheme())).toThrow(
            'O tema precisa ser usado dentro de ThemeProvider.'
        );
    });
});
