import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
    registroPodeSerExcluido,
    useDeleteDiaryEntry
} from '../../../../src/features/diary/hooks/useDeleteDiaryEntry';

const registro = { id: 4, data: '2026-11-04', versao: 2 };

test('confirma exclusão uma vez e comunica sucesso', async () => {
    const service = { excluirRegistro: jest.fn().mockResolvedValue(true) };
    const onExcluido = jest.fn();
    const { result } = await renderHook(() => useDeleteDiaryEntry({ service, onExcluido }));
    await act(async () => {
        result.current.solicitar(registro);
    });
    expect(result.current.confirmacaoVisivel).toBe(true);
    await act(async () => result.current.confirmar());
    expect(service.excluirRegistro).toHaveBeenCalledWith(4, 2, {
        signal: expect.any(AbortSignal)
    });
    expect(onExcluido).toHaveBeenCalledWith(registro);
    expect(result.current.sucesso).toBe(true);
    await act(async () => {
        result.current.concluirSucesso();
    });
    expect(result.current.sucesso).toBe(false);
});

test('bloqueia alvo inválido, cancelamento e envio duplicado', async () => {
    let resolver;
    const service = {
        excluirRegistro: jest.fn(() => new Promise((resolve) => (resolver = resolve)))
    };
    const { result } = await renderHook(() => useDeleteDiaryEntry({ service }));
    expect(result.current.solicitar({ id: 0, versao: -1 })).toBe(false);
    await act(async () => {
        result.current.solicitar(registro);
    });
    let primeira;
    let segunda;
    await act(async () => {
        primeira = result.current.confirmar();
        segunda = result.current.confirmar();
    });
    expect(segunda).toBe(primeira);
    expect(result.current.cancelar()).toBe(false);
    await act(async () => {
        resolver(true);
        await primeira;
    });
    expect(service.excluirRegistro).toHaveBeenCalledTimes(1);
});

test('mantém o alvo para retry após falha', async () => {
    const service = {
        excluirRegistro: jest
            .fn()
            .mockRejectedValueOnce(new Error('privado'))
            .mockResolvedValueOnce(true)
    };
    const { result } = await renderHook(() => useDeleteDiaryEntry({ service }));
    await act(async () => {
        result.current.solicitar(registro);
    });
    await act(async () => result.current.confirmar());
    expect(result.current.erro).toBe(true);
    await act(async () => result.current.tentarNovamente());
    expect(result.current.sucesso).toBe(true);
    expect(service.excluirRegistro).toHaveBeenCalledTimes(2);
});

test('encerra sessão e cancela exclusão no unmount', async () => {
    const onSessaoExpirada = jest.fn();
    const erro = Object.assign(new Error('sessão'), { status: 401 });
    const primeiro = await renderHook(() =>
        useDeleteDiaryEntry({
            service: { excluirRegistro: jest.fn().mockRejectedValue(erro) },
            onSessaoExpirada
        })
    );
    await act(async () => {
        primeiro.result.current.solicitar(registro);
    });
    await act(async () => primeiro.result.current.confirmar());
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
    await primeiro.unmount();

    let sinal;
    const segundo = await renderHook(() =>
        useDeleteDiaryEntry({
            service: {
                excluirRegistro: jest.fn((_id, _versao, { signal }) => {
                    sinal = signal;
                    return new Promise((_resolve, reject) => {
                        signal.addEventListener('abort', () => {
                            reject(Object.assign(new Error('cancelado'), { name: 'AbortError' }));
                        });
                    });
                })
            }
        })
    );
    await act(async () => {
        segundo.result.current.solicitar(registro);
    });
    await act(async () => {
        void segundo.result.current.confirmar();
    });
    await waitFor(() => expect(sinal).toBeDefined());
    await segundo.unmount();
    expect(sinal.aborted).toBe(true);
});

test('valida o contrato mínimo antes de excluir', () => {
    expect(registroPodeSerExcluido(registro)).toBe(true);
    expect(registroPodeSerExcluido(null)).toBeFalsy();
    expect(registroPodeSerExcluido({ id: 1, versao: -1 })).toBe(false);
});

test('cobre cancelamento, fechamento de erro e configuração ausente', async () => {
    const semService = await renderHook(() => useDeleteDiaryEntry());
    await expect(semService.result.current.confirmar()).resolves.toBe(false);
    await act(async () => {
        semService.result.current.solicitar(registro);
    });
    await expect(semService.result.current.confirmar()).resolves.toBe(false);
    await act(async () => {
        semService.result.current.cancelar();
        semService.result.current.fecharErro();
    });
    expect(semService.result.current.registro).toBeNull();
    await semService.unmount();
});

test('ignora sucesso tardio depois do unmount', async () => {
    let resolver;
    const hook = await renderHook(() =>
        useDeleteDiaryEntry({
            service: {
                excluirRegistro: jest.fn(() => new Promise((resolve) => (resolver = resolve)))
            }
        })
    );
    await act(async () => {
        hook.result.current.solicitar(registro);
    });
    const requisicao = hook.result.current.confirmar();
    await hook.unmount();
    resolver(true);
    await expect(requisicao).resolves.toBe(false);
});
