import { act, renderHook, waitFor } from '@testing-library/react-native';

import { MENSAGEM_ERRO, useDiaryCatalog } from '../../../../src/features/diary/hooks/useDiaryCatalog';

test('apresenta erro amigável e encerra sessão expirada', async () => {
    const onSessaoExpirada = jest.fn();
    const service = {
        buscarCatalogo: jest.fn().mockRejectedValue({
            status: 401,
            mensagemUsuario: 'Sessão encerrada.'
        })
    };
    const { result } = await renderHook(() =>
        useDiaryCatalog({ ativo: true, service, onSessaoExpirada })
    );

    await waitFor(() => expect(result.current.erro).toBe('Sessão encerrada.'));
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
    expect(result.current.carregando).toBe(false);
});

test('usa mensagem genérica para falha inesperada', async () => {
    const service = { buscarCatalogo: jest.fn().mockRejectedValue(new Error('interno')) };
    const { result } = await renderHook(() => useDiaryCatalog({ ativo: true, service }));
    await waitFor(() => expect(result.current.erro).toBe(MENSAGEM_ERRO));
});

test('ignora cancelamento e resposta obsoleta', async () => {
    let resolverPrimeira;
    const primeira = new Promise((resolve) => {
        resolverPrimeira = resolve;
    });
    const serviceInicial = { buscarCatalogo: jest.fn(() => primeira) };
    const catalogoAtual = { versao: 2, macrocategorias: [] };
    const serviceAtual = { buscarCatalogo: jest.fn().mockResolvedValue(catalogoAtual) };
    const { result, rerender } = await renderHook(
        ({ service }) => useDiaryCatalog({ ativo: true, service }),
        { initialProps: { service: serviceInicial } }
    );

    await rerender({ service: serviceAtual });
    await waitFor(() => expect(result.current.catalogo).toBe(catalogoAtual));
    await act(() => resolverPrimeira({ versao: 1, macrocategorias: [] }));
    expect(result.current.catalogo).toBe(catalogoAtual);
});

test('ignora erro de cancelamento', async () => {
    const service = {
        buscarCatalogo: jest.fn().mockRejectedValue({ name: 'AbortError' })
    };
    const { result } = await renderHook(() => useDiaryCatalog({ ativo: true, service }));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.erro).toBeNull();
});
