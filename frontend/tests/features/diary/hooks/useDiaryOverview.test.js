import { renderHook, waitFor } from '@testing-library/react-native';

import { useDiaryOverview } from '../../../../src/features/diary/hooks/useDiaryOverview';

const resumo = {
    fase: 'folicular',
    diasRegistrados: 5,
    quantidadeRegistrosFase: 3,
    informacoesSuficientes: true,
    destaques: [{ categoriaId: 'pele', valor: 'Espinhas', ocorrencias: 2 }]
};

test('busca o resumo da fase e limpa quando a fase deixa de existir', async () => {
    const service = { buscarResumo: jest.fn().mockResolvedValue(resumo) };
    const hook = await renderHook(({ fase }) => useDiaryOverview({ fase, service }), {
        initialProps: { fase: 'folicular' }
    });
    await waitFor(() => expect(hook.result.current.resumo).toBe(resumo));
    await hook.rerender({ fase: null });
    expect(hook.result.current).toEqual({ resumo: null, carregando: false });
});

test('atualiza o resumo quando o histórico muda sem trocar de fase', async () => {
    const service = { buscarResumo: jest.fn().mockResolvedValue(resumo) };
    const hook = await renderHook(
        ({ chaveAtualizacao }) =>
            useDiaryOverview({ fase: 'folicular', chaveAtualizacao, service }),
        { initialProps: { chaveAtualizacao: '1:1' } }
    );
    await waitFor(() => expect(service.buscarResumo).toHaveBeenCalledTimes(1));
    await hook.rerender({ chaveAtualizacao: '1:1|2:1' });
    await waitFor(() => expect(service.buscarResumo).toHaveBeenCalledTimes(2));
});

test('usa fallback em falha e encerra sessão somente no 401', async () => {
    const onSessaoExpirada = jest.fn();
    const service = {
        buscarResumo: jest
            .fn()
            .mockRejectedValueOnce(new Error('rede'))
            .mockRejectedValueOnce({ status: 401 })
    };
    const hook = await renderHook(
        ({ fase }) => useDiaryOverview({ fase, service, onSessaoExpirada }),
        {
            initialProps: { fase: 'lutea' }
        }
    );
    await waitFor(() => expect(hook.result.current.carregando).toBe(false));
    expect(hook.result.current.resumo).toBeNull();
    await hook.rerender({ fase: 'folicular' });
    await waitFor(() => expect(onSessaoExpirada).toHaveBeenCalledTimes(1));
});

test('aceita configuração ausente e 401 sem callback', async () => {
    const vazio = await renderHook(() => useDiaryOverview());
    expect(vazio.result.current).toEqual({ resumo: null, carregando: false });

    const service = { buscarResumo: jest.fn().mockRejectedValue({ status: 401 }) };
    const hook = await renderHook(() => useDiaryOverview({ fase: 'lutea', service }));
    await waitFor(() => expect(hook.result.current.carregando).toBe(false));
    expect(hook.result.current.resumo).toBeNull();
});

test('ignora conclusão recebida depois do cancelamento', async () => {
    let resolver;
    const service = {
        buscarResumo: jest.fn(() => new Promise((resolve) => (resolver = resolve)))
    };
    const hook = await renderHook(() => useDiaryOverview({ fase: 'lutea', service }));
    await waitFor(() => expect(resolver).toBeDefined());
    await hook.unmount();
    resolver(resumo);
    await Promise.resolve();
});

test('ignora AbortError mesmo antes de o sinal refletir o cancelamento', async () => {
    const erro = Object.assign(new Error('cancelado'), { name: 'AbortError' });
    const service = { buscarResumo: jest.fn().mockRejectedValue(erro) };
    const hook = await renderHook(() => useDiaryOverview({ fase: 'lutea', service }));
    await waitFor(() => expect(hook.result.current.carregando).toBe(false));
    expect(hook.result.current.resumo).toBeNull();
});

test('cancela a consulta ao desmontar', async () => {
    let sinal;
    const service = {
        buscarResumo: jest.fn((_fase, { signal }) => {
            sinal = signal;
            return new Promise((_resolve, reject) => {
                signal.addEventListener('abort', () =>
                    reject(Object.assign(new Error('cancelado'), { name: 'AbortError' }))
                );
            });
        })
    };
    const hook = await renderHook(() => useDiaryOverview({ fase: 'lutea', service }));
    await waitFor(() => expect(sinal).toBeDefined());
    await hook.unmount();
    expect(sinal.aborted).toBe(true);
});
