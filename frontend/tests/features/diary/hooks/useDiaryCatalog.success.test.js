import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useDiaryCatalog } from '../../../../src/features/diary/hooks/useDiaryCatalog';

describe('carregamento do catálogo do Diário', () => {
    test('carrega somente quando o modal está ativo e limpa ao fechar', async () => {
        const catalogo = { versao: 1, macrocategorias: [] };
        const service = { buscarCatalogo: jest.fn().mockResolvedValue(catalogo) };
        const { result, rerender } = await renderHook(
            ({ ativo }) => useDiaryCatalog({ ativo, service }),
            { initialProps: { ativo: false } }
        );

        expect(service.buscarCatalogo).not.toHaveBeenCalled();
        await rerender({ ativo: true });
        await waitFor(() => expect(result.current.catalogo).toBe(catalogo));
        expect(service.buscarCatalogo).toHaveBeenCalledWith({ signal: expect.any(AbortSignal) });
        expect(result.current.carregando).toBe(false);

        await rerender({ ativo: false });
        expect(result.current).toMatchObject({ catalogo: null, erro: null, carregando: false });
    });

    test('permite recarregar e cancela a requisição ao desmontar', async () => {
        let signal;
        const service = {
            buscarCatalogo: jest.fn(({ signal: recebido }) => {
                signal = recebido;
                return new Promise(() => {});
            })
        };
        const { result, unmount } = await renderHook(() =>
            useDiaryCatalog({ ativo: true, service })
        );

        expect(result.current.carregando).toBe(true);
        await act(() => result.current.recarregar());
        expect(service.buscarCatalogo).toHaveBeenCalledTimes(2);
        await unmount();
        expect(signal.aborted).toBe(true);
    });

    test('ignora carregamento sem serviço configurado', async () => {
        const { result } = await renderHook(() => useDiaryCatalog({ ativo: true }));
        expect(result.current).toMatchObject({ catalogo: null, carregando: false, erro: null });
        expect(result.current.recarregar()).toBeUndefined();
    });
});
