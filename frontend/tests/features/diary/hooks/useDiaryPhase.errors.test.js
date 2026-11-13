import { renderHook, waitFor } from '@testing-library/react-native';

import { useDiaryPhase } from '../../../../src/features/diary/hooks/useDiaryPhase';

test('ignora cancelamento da consulta', async () => {
    const service = {
        buscarMes: jest.fn().mockRejectedValue({ name: 'AbortError' })
    };
    const { result } = await renderHook(() =>
        useDiaryPhase({ ativo: true, data: '2026-11-03', service })
    );
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.fase).toBeNull();
});

test('trata falha comum sem encerrar a sessão', async () => {
    const onSessaoExpirada = jest.fn();
    const service = { buscarMes: jest.fn().mockRejectedValue(new Error('rede')) };
    const { result } = await renderHook(() =>
        useDiaryPhase({ ativo: true, data: '2026-11-03', service, onSessaoExpirada })
    );
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(onSessaoExpirada).not.toHaveBeenCalled();
});

test('cancela a consulta ao desmontar', async () => {
    const service = {
        buscarMes: jest.fn(({ signal: recebido }) => {
            return new Promise((resolve, reject) => {
                recebido.addEventListener('abort', () => {
                    reject({ name: 'AbortError' });
                });
            });
        })
    };
    const { unmount } = await renderHook(() =>
        useDiaryPhase({ ativo: true, data: '2026-11-03', service })
    );
    await unmount();
    await waitFor(() => expect(service.buscarMes).toHaveBeenCalledTimes(1));
});

test('ignora serviço ausente', async () => {
    const { result } = await renderHook(() => useDiaryPhase({ ativo: true, data: '2026-11-03' }));
    expect(result.current).toEqual({ fase: null, carregando: false });
});
