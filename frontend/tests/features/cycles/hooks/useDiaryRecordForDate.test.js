import { renderHook, waitFor } from '@testing-library/react-native';
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
