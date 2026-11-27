import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useDiaryRecordForDate } from '../../../../src/features/cycles/hooks/useDiaryRecordForDate';

const date = '2026-11-24';
const record = { id: 7, data: date, versao: 2, categorias: [] };

test('localiza e carrega o registro completo da data', async () => {
    const service = {
        listarHistorico: jest.fn().mockResolvedValue({
            itens: [{ id: 7, data: date }],
            proximoCursor: null
        }),
        buscarDetalhe: jest.fn().mockResolvedValue(record)
    };
    const hook = await renderHook(() => useDiaryRecordForDate({ date, service }));

    await waitFor(() => expect(hook.result.current.record).toBe(record));
    expect(service.listarHistorico).toHaveBeenCalledWith({
        limite: 1,
        filtros: { dataInicio: date, dataFim: date },
        signal: expect.any(AbortSignal)
    });
    expect(service.buscarDetalhe).toHaveBeenCalledWith(7, {
        signal: expect.any(AbortSignal)
    });
    expect(hook.result.current.loading).toBe(false);
});

test('mantém criação normal quando não existe registro e trata sessão expirada', async () => {
    const onSessionExpired = jest.fn();
    const service = {
        listarHistorico: jest
            .fn()
            .mockResolvedValueOnce({ itens: [], proximoCursor: null })
            .mockRejectedValueOnce({ status: 401 }),
        buscarDetalhe: jest.fn()
    };
    const hook = await renderHook(
        ({ currentDate }) =>
            useDiaryRecordForDate({ date: currentDate, service, onSessionExpired }),
        { initialProps: { currentDate: date } }
    );

    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    expect(hook.result.current.record).toBeNull();
    expect(service.buscarDetalhe).not.toHaveBeenCalled();

    await hook.rerender({ currentDate: '2026-11-23' });
    await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1));
    expect(hook.result.current.record).toBeNull();
});

test('ignora a resposta da data anterior quando a busca já foi cancelada', async () => {
    let resolverDetalhe;
    const dataNova = '2026-11-25';
    const service = {
        listarHistorico: jest
            .fn()
            .mockResolvedValueOnce({ itens: [{ id: 7, data: date }] })
            .mockResolvedValueOnce({ itens: [] }),
        buscarDetalhe: jest.fn(
            () =>
                new Promise((resolve) => {
                    resolverDetalhe = resolve;
                })
        )
    };
    const hook = await renderHook(
        ({ currentDate }) => useDiaryRecordForDate({ date: currentDate, service }),
        { initialProps: { currentDate: date } }
    );

    await waitFor(() => expect(service.buscarDetalhe).toHaveBeenCalledTimes(1));
    const [, { signal }] = service.buscarDetalhe.mock.calls[0];
    await hook.rerender({ currentDate: dataNova });
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    expect(signal.aborted).toBe(true);

    await act(() => resolverDetalhe(record));

    expect(hook.result.current).toEqual({ record: null, loading: false });
});

test.each([{ name: 'AbortError' }, { status: 500 }, undefined])(
    'encerra uma busca com erro sem sinalizar expiração (%#)',
    async (erro) => {
        const onSessionExpired = jest.fn();
        const service = { listarHistorico: jest.fn().mockRejectedValue(erro) };
        const hook = await renderHook(() =>
            useDiaryRecordForDate({ date, service, onSessionExpired })
        );

        await waitFor(() => expect(hook.result.current.loading).toBe(false));
        expect(hook.result.current.record).toBeNull();
        expect(onSessionExpired).not.toHaveBeenCalled();
    }
);

test('não consulta outra data nem busca detalhes sem serviço ou método disponível', async () => {
    const listarHistorico = jest.fn().mockResolvedValue({ itens: [{ id: 7, data: date }] });
    const hook = await renderHook(
        ({ data, service }) => useDiaryRecordForDate({ date: data, service }),
        { initialProps: { data: null, service: { listarHistorico } } }
    );

    expect(listarHistorico).not.toHaveBeenCalled();
    await hook.rerender({ data: date });
    expect(listarHistorico).not.toHaveBeenCalled();
    await hook.rerender({ data: date, service: { listarHistorico } });

    await waitFor(() => expect(listarHistorico).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    expect(hook.result.current.record).toBeNull();
});

test('começa sem registro quando usado sem parâmetros', async () => {
    const { result } = await renderHook(() => useDiaryRecordForDate());
    expect(result.current).toEqual({ record: null, loading: false });
});
