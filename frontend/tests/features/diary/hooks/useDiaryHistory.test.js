import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
    mesclarRegistros,
    useDiaryHistory
} from '../../../../src/features/diary/hooks/useDiaryHistory';

const recente = { id: 2, data: '2026-11-04' };
const antigo = { id: 1, data: '2026-10-28' };

test('carrega, pagina, deduplica e remove sem recarregar tudo', async () => {
    const service = {
        listarHistorico: jest
            .fn()
            .mockResolvedValueOnce({ itens: [recente], proximoCursor: 'cursor_1' })
            .mockResolvedValueOnce({ itens: [recente, antigo], proximoCursor: null })
    };
    const { result } = await renderHook(() => useDiaryHistory({ service }));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.registros).toEqual([recente]);
    expect(result.current.temMais).toBe(true);

    await act(async () => result.current.carregarMais());
    expect(service.listarHistorico).toHaveBeenNthCalledWith(2, {
        cursor: 'cursor_1',
        signal: expect.any(AbortSignal)
    });
    expect(result.current.registros).toEqual([recente, antigo]);

    await act(async () => result.current.removerLocalmente(2));
    expect(result.current.registros).toEqual([antigo]);
    expect(mesclarRegistros([antigo], [{ ...antigo }, recente])).toEqual([recente, antigo]);
});

test('preserva a lista e oferece retry quando a paginação falha', async () => {
    const service = {
        listarHistorico: jest
            .fn()
            .mockResolvedValueOnce({ itens: [recente], proximoCursor: 'cursor_1' })
            .mockRejectedValueOnce(new Error('privado'))
            .mockResolvedValueOnce({ itens: [antigo], proximoCursor: null })
    };
    const { result } = await renderHook(() => useDiaryHistory({ service }));
    await waitFor(() => expect(result.current.temMais).toBe(true));
    await act(async () => result.current.carregarMais());
    expect(result.current.registros).toEqual([recente]);
    expect(result.current.erroCarregarMais).toBe('Não foi possível carregar mais registros.');
    await act(async () => result.current.tentarCarregarMais());
    expect(result.current.registros).toEqual([recente, antigo]);
});

test('mostra erro inicial seguro e permite recarregar preservando dados válidos', async () => {
    const service = {
        listarHistorico: jest
            .fn()
            .mockRejectedValueOnce(new Error('SQL'))
            .mockResolvedValueOnce({ itens: [recente], proximoCursor: null })
            .mockResolvedValueOnce({ itens: [antigo], proximoCursor: null })
    };
    const { result } = await renderHook(() => useDiaryHistory({ service }));
    await waitFor(() => expect(result.current.erro).not.toBeNull());
    expect(result.current.erro).not.toContain('SQL');
    await act(async () => result.current.recarregar());
    expect(result.current.registros).toEqual([recente]);
    await act(async () => result.current.recarregar());
    expect(result.current.registros).toEqual([antigo]);
});

test('encerra a sessão quando o histórico retorna 401', async () => {
    const erro = Object.assign(new Error('sessão'), { status: 401 });
    const onSessaoExpirada = jest.fn();
    const service = { listarHistorico: jest.fn().mockRejectedValue(erro) };
    const primeiro = await renderHook(() =>
        useDiaryHistory({
            service,
            onSessaoExpirada
        })
    );
    await waitFor(() => expect(primeiro.result.current.carregando).toBe(false));
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
    await primeiro.unmount();
});

test('cancela a requisição do histórico ao desmontar', async () => {
    let sinal;
    const segundo = await renderHook(() =>
        useDiaryHistory({
            service: {
                listarHistorico: jest.fn(({ signal }) => {
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
    await waitFor(() => expect(sinal).toBeDefined());
    await segundo.unmount();
    expect(sinal.aborted).toBe(true);
});

test('cobre configuração ausente e deduplicação de chamadas em andamento', async () => {
    const ausente = await renderHook(() => useDiaryHistory());
    await waitFor(() => expect(ausente.result.current.carregando).toBe(false));
    expect(ausente.result.current.erro).not.toBeNull();
    await expect(ausente.result.current.carregarMais()).resolves.toBe(false);
    await ausente.unmount();

    let resolver;
    const service = {
        listarHistorico: jest.fn(() => new Promise((resolve) => (resolver = resolve)))
    };
    const pendente = await renderHook(() => useDiaryHistory({ service }));
    const primeira = pendente.result.current.recarregar();
    expect(pendente.result.current.recarregar()).toBe(primeira);
    resolver({ itens: [], proximoCursor: null });
    await act(async () => primeira);
    await expect(pendente.result.current.carregarMais()).resolves.toBe(false);
    await pendente.unmount();
});

test('ignora resposta inicial tardia após desmontar', async () => {
    let resolver;
    const service = {
        listarHistorico: jest.fn(() => new Promise((resolve) => (resolver = resolve)))
    };
    const hook = await renderHook(() => useDiaryHistory({ service }));
    await waitFor(() => expect(resolver).toBeDefined());
    await hook.unmount();
    resolver({ itens: [recente], proximoCursor: null });
    await Promise.resolve();
});

test('deduplica, cancela e trata sessão expirada durante paginação', async () => {
    let rejeitarPagina;
    const onSessaoExpirada = jest.fn();
    const service = {
        listarHistorico: jest
            .fn()
            .mockResolvedValueOnce({ itens: [recente], proximoCursor: 'cursor_1' })
            .mockImplementationOnce(
                () => new Promise((_resolve, reject) => (rejeitarPagina = reject))
            )
    };
    const hook = await renderHook(() => useDiaryHistory({ service, onSessaoExpirada }));
    await waitFor(() => expect(hook.result.current.temMais).toBe(true));
    let primeira;
    await act(async () => {
        primeira = hook.result.current.carregarMais();
        await Promise.resolve();
    });
    expect(hook.result.current.carregarMais()).toBe(primeira);
    rejeitarPagina(Object.assign(new Error('sessão'), { codigo: 'SESSAO_AUSENTE' }));
    await act(async () => primeira);
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
    await hook.unmount();
});

test('usa o id como desempate quando registros têm a mesma data', () => {
    expect(
        mesclarRegistros([{ id: 1, data: '2026-11-04' }], [{ id: 2, data: '2026-11-04' }])
    ).toEqual([
        { id: 2, data: '2026-11-04' },
        { id: 1, data: '2026-11-04' }
    ]);
});

test('ignora página tardia e cancelamento de página após desmontar', async () => {
    let resolverPagina;
    const serviceTardio = {
        listarHistorico: jest
            .fn()
            .mockResolvedValueOnce({ itens: [recente], proximoCursor: 'cursor_1' })
            .mockImplementationOnce(() => new Promise((resolve) => (resolverPagina = resolve)))
    };
    const tardio = await renderHook(() => useDiaryHistory({ service: serviceTardio }));
    await waitFor(() => expect(tardio.result.current.temMais).toBe(true));
    let requisicaoTardia;
    await act(async () => {
        requisicaoTardia = tardio.result.current.carregarMais();
        await Promise.resolve();
    });
    await tardio.unmount();
    resolverPagina({ itens: [antigo], proximoCursor: null });
    await expect(requisicaoTardia).resolves.toBe(false);

    let sinalPagina;
    const serviceCancelado = {
        listarHistorico: jest
            .fn()
            .mockResolvedValueOnce({ itens: [recente], proximoCursor: 'cursor_1' })
            .mockImplementationOnce(
                ({ signal }) =>
                    new Promise((_resolve, reject) => {
                        sinalPagina = signal;
                        signal.addEventListener('abort', () =>
                            reject(Object.assign(new Error('cancelado'), { name: 'AbortError' }))
                        );
                    })
            )
    };
    const cancelado = await renderHook(() => useDiaryHistory({ service: serviceCancelado }));
    await waitFor(() => expect(cancelado.result.current.temMais).toBe(true));
    let requisicaoCancelada;
    await act(async () => {
        requisicaoCancelada = cancelado.result.current.carregarMais();
        await Promise.resolve();
    });
    await waitFor(() => expect(sinalPagina).toBeDefined());
    await cancelado.unmount();
    await expect(requisicaoCancelada).resolves.toBe(false);
    expect(sinalPagina.aborted).toBe(true);
});

test('não limpa uma requisição inicial mais nova ao trocar de serviço', async () => {
    let resolverAntigo;
    const antigoService = {
        listarHistorico: jest.fn(() => new Promise((resolve) => (resolverAntigo = resolve)))
    };
    const novoService = {
        listarHistorico: jest.fn().mockResolvedValue({ itens: [recente], proximoCursor: null })
    };
    const hook = await renderHook(({ service }) => useDiaryHistory({ service }), {
        initialProps: { service: antigoService }
    });
    await hook.rerender({ service: novoService });
    resolverAntigo({ itens: [antigo], proximoCursor: null });
    await waitFor(() => expect(hook.result.current.registros).toEqual([recente]));
    await hook.unmount();
});

test('aplica filtros, preserva a última lista válida no erro e permite tentar novamente', async () => {
    const service = {
        listarHistorico: jest
            .fn()
            .mockResolvedValueOnce({ itens: [recente], proximoCursor: null })
            .mockRejectedValueOnce(new Error('falha privada'))
            .mockResolvedValueOnce({ itens: [antigo], proximoCursor: null })
    };
    const hook = await renderHook(({ filtros }) => useDiaryHistory({ service, filtros }), {
        initialProps: { filtros: {} }
    });
    await waitFor(() => expect(hook.result.current.registros).toEqual([recente]));

    await hook.rerender({ filtros: { fases: ['lutea'] } });
    await waitFor(() => expect(hook.result.current.erroFiltro).not.toBeNull());
    expect(hook.result.current.erroFiltro).toBe(
        'Não foi possível aplicar os filtros no momento. Tente novamente.'
    );
    expect(hook.result.current.registros).toEqual([recente]);
    expect(service.listarHistorico).toHaveBeenNthCalledWith(2, {
        filtros: { dataInicio: null, dataFim: null, categorias: [], fases: ['lutea'] },
        signal: expect.any(AbortSignal)
    });

    await act(async () => hook.result.current.tentarAplicarFiltros());
    expect(hook.result.current.registros).toEqual([antigo]);
    expect(hook.result.current.erroFiltro).toBeNull();
});
