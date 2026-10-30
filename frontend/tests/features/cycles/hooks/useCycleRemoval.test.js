import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
    MENSAGEM_ATUALIZACAO,
    MENSAGEM_ERRO,
    obterMensagemErro,
    useCycleRemoval,
    validarService
} from '../../../../src/features/cycles/hooks/useCycleRemoval';

function criarService(overrides = {}) {
    const sucesso = async () => ({ mensagem: 'Registro de menstruação excluído com sucesso.' });
    return { removerDia: sucesso, excluirCiclo: sucesso, ...overrides };
}

test('remove dia, atualiza tela e expõe sucesso', async () => {
    const resultado = { mensagem: 'Registro de menstruação excluído com sucesso.' };
    const service = criarService({ removerDia: jest.fn().mockResolvedValue(resultado) });
    const aoAtualizar = jest.fn();
    const { result } = await renderHook(() => useCycleRemoval({ service, aoAtualizar }));
    await act(async () => {
        await result.current.removerDia({ cicloId: 2, data: '2026-10-02' });
    });
    expect(service.removerDia).toHaveBeenCalledWith({ cicloId: 2, data: '2026-10-02' });
    expect(aoAtualizar).toHaveBeenCalledWith({ tipo: 'removerDia', resultado });
    expect(result.current.sucesso).toEqual(resultado.mensagem);
    expect(result.current.operacao).toBeNull();
});

test('exclui ciclo inteiro e revela erro se a atualização falhar após sucesso da API', async () => {
    const service = criarService();
    const aoAtualizar = jest.fn().mockRejectedValue(new Error('refresh'));
    const { result } = await renderHook(() => useCycleRemoval({ service, aoAtualizar }));
    await act(async () => {
        await result.current.excluirCiclo({ cicloId: 7 });
    });
    expect(result.current.sucesso).toBe('Registro de menstruação excluído com sucesso.');
    expect(result.current.erroAtualizacao).toBe(MENSAGEM_ATUALIZACAO);
});

test('mostra mensagem amigável, trata sessão expirada e preserva falha do serviço', async () => {
    const onSessaoExpirada = jest.fn();
    const service = criarService({
        removerDia: jest.fn().mockRejectedValue({ status: 401, mensagemUsuario: 'Entre novamente' })
    });
    const { result } = await renderHook(() => useCycleRemoval({ service, onSessaoExpirada }));
    await act(async () => {
        await result.current.removerDia({});
    });
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
    expect(result.current.erro).toBe('Entre novamente');
    expect(result.current.sucesso).toBeNull();
});

test('usa fallback para erro sem mensagem e serviço sem o método selecionado', async () => {
    const { result } = await renderHook(() =>
        useCycleRemoval({
            service: {
                removerDia: async () => {
                    throw {};
                }
            }
        })
    );
    await act(async () => {
        await result.current.excluirCiclo({});
    });
    expect(result.current.erro).toBe(MENSAGEM_ERRO);
    expect(obterMensagemErro({ message: '  ' })).toBe(MENSAGEM_ERRO);
    expect(obterMensagemErro({ mensagemUsuario: 'custom' })).toBe('custom');
});

test('ignora uma segunda operação enquanto a primeira está em andamento', async () => {
    let concluir;
    const service = criarService({
        removerDia: () =>
            new Promise((resolve) => {
                concluir = resolve;
            })
    });
    const { result } = await renderHook(() => useCycleRemoval({ service }));
    let primeira;
    await act(async () => {
        primeira = result.current.removerDia({});
        await Promise.resolve();
    });
    await waitFor(() => expect(result.current.operacao).toBe('removerDia'));
    await act(async () => {
        await expect(result.current.excluirCiclo({})).resolves.toMatchObject({
            motivo: 'OPERACAO_EM_ANDAMENTO'
        });
    });
    await act(async () => {
        concluir({});
        await primeira;
    });
});

test('limpa feedback, rejeita dependências e tolera erro no callback de sessão', async () => {
    expect(() => validarService(null)).toThrow();
    expect(() => useCycleRemoval()).toThrow();
    const onSessaoExpirada = () => {
        throw new Error('navigation');
    };
    const { result } = await renderHook(() =>
        useCycleRemoval({
            service: criarService({
                removerDia: async () => {
                    throw { status: 401 };
                }
            }),
            onSessaoExpirada
        })
    );
    await act(async () => {
        await result.current.removerDia({});
    });
    await act(async () => {
        result.current.limparFeedback();
    });
    expect(result.current.erro).toBeNull();
    expect(result.current.erroAtualizacao).toBeNull();
    expect(result.current.sucesso).toBeNull();
});

test('retorna fallback para erro vazio e atualiza status por operação', async () => {
    const { result } = await renderHook(() =>
        useCycleRemoval({
            service: criarService({ excluirCiclo: async () => ({}) })
        })
    );
    await act(async () => {
        await result.current.excluirCiclo({});
    });
    expect(result.current.sucesso).toBe('Registro de menstruação excluído com sucesso.');
    expect(result.current.excluindoCiclo).toBe(false);
    expect(result.current.removendoDia).toBe(false);
    expect(obterMensagemErro(null)).toBe(MENSAGEM_ERRO);
});
