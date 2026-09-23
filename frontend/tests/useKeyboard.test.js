/**
 * Testes dos listeners, estado e cleanup do hook de teclado.
 */
import { act, renderHook } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import { useKeyboard } from '../hooks/useKeyboard';

afterEach(() => jest.restoreAllMocks());

test('acompanha visibilidade e altura do teclado e limpa os eventos', async () => {
    const eventos = {};
    const remover = jest.fn();
    jest.spyOn(Keyboard, 'addListener').mockImplementation((nome, callback) => {
        eventos[nome] = callback;
        return { remove: remover };
    });

    const { result, unmount } = await renderHook(() => useKeyboard());
    expect(result.current).toMatchObject({ visivel: false, altura: 0 });

    await act(() => eventos.keyboardDidShow({ endCoordinates: { height: 280 } }));
    expect(result.current).toMatchObject({ visivel: true, altura: 280 });

    await act(() => eventos.keyboardDidHide());
    expect(result.current).toMatchObject({ visivel: false, altura: 0 });

    await unmount();
    expect(remover).toHaveBeenCalledTimes(2);
});

test('oferece uma ação para fechar o teclado', async () => {
    const fechar = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
    const { result } = await renderHook(() => useKeyboard());
    result.current.fecharTeclado();
    expect(fechar).toHaveBeenCalledTimes(1);
});
