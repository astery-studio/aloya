import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useMenstruationSync } from '../../../../src/features/cycles/hooks/useMenstruationSync';

test('não acessa fila fora da sessão autenticada', async () => {
    const fila = { listar: jest.fn(), sincronizar: jest.fn(), adicionar: jest.fn() };
    const { result } = await renderHook(() => useMenstruationSync({ fila, ativo: false }));
    await act(() => result.current.registrarHoje());
    await act(() => result.current.sincronizar());
    expect(fila.listar).not.toHaveBeenCalled();
    expect(fila.adicionar).not.toHaveBeenCalled();
});

test('retoma pendências ao abrir o app, conserva falha e tenta novamente ao voltar ao primeiro plano', async () => {
    let evento;
    const remover = jest.fn();
    const spy = jest.spyOn(AppState, 'addEventListener').mockImplementation((tipo, callback) => {
        evento = callback;
        return { remove: remover };
    });
    const fila = {
        listar: jest.fn().mockResolvedValue([{ chave: 'pendente' }]),
        sincronizar: jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({})
    };
    try {
        const { result, unmount } = await renderHook(() =>
            useMenstruationSync({ fila, ativo: true })
        );
        await waitFor(() => expect(result.current.status).toBe('falha'));
        await act(async () => evento('active'));
        await waitFor(() => expect(result.current.status).toBe('sincronizado'));
        expect(result.current.revisao).toBe(1);
        expect(fila.sincronizar).toHaveBeenCalledTimes(2);
        await unmount();
        expect(remover).toHaveBeenCalled();
    } finally {
        spy.mockRestore();
    }
});

test('controle rápido persiste hoje antes do envio e provoca atualização das telas', async () => {
    const fila = {
        listar: jest.fn().mockResolvedValue([]),
        adicionar: jest.fn().mockImplementation(async () => {
            fila.listar.mockResolvedValue([{ chave: 'hoje' }]);
        }),
        sincronizar: jest.fn().mockResolvedValue({})
    };
    const { result } = await renderHook(() => useMenstruationSync({ fila, ativo: true }));
    await waitFor(() => expect(result.current.status).toBe('sincronizado'));
    await act(() => result.current.registrarHoje());
    const [inicio, fim] = fila.adicionar.mock.calls[0];
    expect(inicio).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(fim).toBe(inicio);
    expect(fila.adicionar.mock.invocationCallOrder[0]).toBeLessThan(
        fila.sincronizar.mock.invocationCallOrder[0]
    );
    expect(result.current.revisao).toBe(2);
});
