import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useDiaryRecordDetails } from '../../../../src/features/diary/hooks/useDiaryRecordDetails';

const resumo = { id: 3, data: '2026-11-04', versao: 1 };
const detalhe = { ...resumo, fase: 'menstrual', categorias: [] };

test('busca detalhe sob demanda e limpa dados sensíveis ao fechar', async () => {
    const service = { buscarDetalhe: jest.fn().mockResolvedValue(detalhe) };
    const { result } = await renderHook(() => useDiaryRecordDetails({ service }));
    await act(async () => result.current.abrir(resumo));
    expect(service.buscarDetalhe).toHaveBeenCalledWith(3, { signal: expect.any(AbortSignal) });
    expect(result.current.registro).toBe(detalhe);
    expect(result.current.visivel).toBe(true);
    await act(async () => result.current.fechar());
    expect(result.current.registro).toBeNull();
    expect(result.current.resumoSelecionado).toBeNull();
});

test('ignora seleção inválida e permite retry seguro', async () => {
    const service = {
        buscarDetalhe: jest
            .fn()
            .mockRejectedValueOnce(new Error('privado'))
            .mockResolvedValueOnce(detalhe)
    };
    const { result } = await renderHook(() => useDiaryRecordDetails({ service }));
    await expect(result.current.abrir({ id: 0 })).resolves.toBe(false);
    await act(async () => result.current.abrir(resumo));
    expect(result.current.erro).toBe('Não foi possível carregar este registro. Tente novamente.');
    await act(async () => result.current.tentarNovamente());
    expect(result.current.registro).toBe(detalhe);
});

test('encerra sessão e cancela resposta tardia', async () => {
    const onSessaoExpirada = jest.fn();
    const erro = Object.assign(new Error('sessão'), { codigo: 'SESSAO_AUSENTE' });
    const primeiro = await renderHook(() =>
        useDiaryRecordDetails({
            service: { buscarDetalhe: jest.fn().mockRejectedValue(erro) },
            onSessaoExpirada
        })
    );
    await act(async () => primeiro.result.current.abrir(resumo));
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
    await primeiro.unmount();

    let sinal;
    const segundo = await renderHook(() =>
        useDiaryRecordDetails({
            service: {
                buscarDetalhe: jest.fn((_id, { signal }) => {
                    sinal = signal;
                    return new Promise((_resolve, reject) => {
                        signal.addEventListener('abort', () =>
                            reject(Object.assign(new Error('cancelado'), { name: 'AbortError' }))
                        );
                    });
                })
            }
        })
    );
    let requisicao;
    await act(async () => {
        requisicao = segundo.result.current.abrir(resumo);
        await Promise.resolve();
    });
    await waitFor(() => expect(sinal).toBeDefined());
    await act(async () => segundo.result.current.fechar());
    await expect(requisicao).resolves.toBe(false);
    expect(sinal.aborted).toBe(true);
    await segundo.unmount();
});

test('cobre configuração ausente, retry vazio e resposta obsoleta', async () => {
    const ausente = await renderHook(() => useDiaryRecordDetails());
    await expect(ausente.result.current.abrir(resumo)).resolves.toBe(false);
    await expect(ausente.result.current.tentarNovamente()).resolves.toBe(false);
    await ausente.unmount();

    let resolverPrimeiro;
    const service = {
        buscarDetalhe: jest
            .fn()
            .mockImplementationOnce(() => new Promise((resolve) => (resolverPrimeiro = resolve)))
            .mockResolvedValueOnce({ ...detalhe, id: 4 })
    };
    const hook = await renderHook(() => useDiaryRecordDetails({ service }));
    let primeira;
    await act(async () => {
        primeira = hook.result.current.abrir(resumo);
        await Promise.resolve();
    });
    await act(async () => hook.result.current.abrir({ ...resumo, id: 4 }));
    await act(async () => {
        resolverPrimeiro(detalhe);
        await expect(primeira).resolves.toBe(false);
    });
    expect(hook.result.current.registro.id).toBe(4);
    await hook.unmount();
});

test('abre diretamente um detalhe já carregado e rejeita contratos incompletos', async () => {
    const hook = await renderHook(() => useDiaryRecordDetails());
    for (const invalido of [null, {}, { id: 1 }, { id: '1', categorias: [] }]) {
        expect(hook.result.current.abrirDetalhe(invalido)).toBe(false);
    }

    await act(() => expect(hook.result.current.abrirDetalhe(detalhe)).toBe(true));
    expect(hook.result.current.registro).toBe(detalhe);
    expect(hook.result.current.resumoSelecionado).toBe(detalhe);
    expect(hook.result.current.visivel).toBe(true);
    await hook.unmount();
});
