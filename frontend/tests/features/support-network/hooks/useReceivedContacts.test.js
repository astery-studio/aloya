import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useReceivedContacts } from '../../../../src/features/support-network/hooks/useReceivedContacts';

function criarContato({ id = 1, status = 'pendente' } = {}) {
    return {
        id,
        identificacao: 'Ana',
        status,
        aguardando: status === 'pendente' ? { dias: 1, rotulo: 'Aguardando há 1 dia' } : null,
        acoes: {
            podeAceitar: status === 'pendente',
            podeRecusar: status === 'pendente',
            podeAbrirResumo: true
        }
    };
}

function criarListagem(contatos = [criarContato()]) {
    return {
        contatos: Object.freeze(contatos),
        resumo: Object.freeze({
            total: contatos.length,
            pendentes: contatos.filter(({ status }) => status === 'pendente').length,
            ativos: contatos.filter(({ status }) => status === 'ativo').length
        })
    };
}

test('carrega os convites recebidos e encaminha o AbortSignal', async () => {
    const service = {
        listarRecebidos: jest.fn().mockResolvedValue(criarListagem()),
        responderConvite: jest.fn()
    };
    const { result } = await renderHook(() => useReceivedContacts({ service }));

    await waitFor(() => expect(result.current.carregando).toBe(false));

    expect(service.listarRecebidos).toHaveBeenCalledWith({
        signal: expect.any(AbortSignal)
    });
    expect(result.current.contatos).toHaveLength(1);
    expect(result.current.erro).toBeNull();
});

test('aceita e atualiza o vínculo localmente sem recarregar a lista', async () => {
    const service = {
        listarRecebidos: jest.fn().mockResolvedValue(criarListagem()),
        responderConvite: jest.fn().mockResolvedValue({
            status: 'ativo',
            mensagem: 'Convite aceito com sucesso.'
        })
    };
    const { result } = await renderHook(() => useReceivedContacts({ service }));
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(async () => {
        await result.current.responder(1, 'aceitar');
    });

    expect(result.current.contatos[0].status).toBe('ativo');
    expect(result.current.contatos[0].aguardando).toBeNull();
    expect(result.current.resumo).toEqual({ total: 1, pendentes: 0, ativos: 1 });
    expect(service.listarRecebidos).toHaveBeenCalledTimes(1);
});

test('remove imediatamente da lista o convite recusado', async () => {
    const service = {
        listarRecebidos: jest.fn().mockResolvedValue(criarListagem()),
        responderConvite: jest.fn().mockResolvedValue({
            status: 'recusado',
            mensagem: 'Convite recusado com sucesso.'
        })
    };
    const { result } = await renderHook(() => useReceivedContacts({ service }));
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(async () => {
        await result.current.responder(1, 'recusar');
    });

    expect(result.current.contatos).toEqual([]);
    expect(result.current.resumo).toEqual({ total: 0, pendentes: 0, ativos: 0 });
});

test('mantém o convite quando a resposta falha', async () => {
    const service = {
        listarRecebidos: jest.fn().mockResolvedValue(criarListagem()),
        responderConvite: jest.fn().mockRejectedValue(new Error('falha privada'))
    };
    const { result } = await renderHook(() => useReceivedContacts({ service }));
    await waitFor(() => expect(result.current.carregando).toBe(false));

    await act(async () => {
        await result.current.responder(1, 'aceitar');
    });

    expect(result.current.contatos[0].status).toBe('pendente');
    expect(result.current.erroAcao).toBe(
        'Não foi possível responder ao convite no momento. Tente novamente.'
    );
});

test('impede duas respostas simultâneas', async () => {
    let concluir;
    const service = {
        listarRecebidos: jest.fn().mockResolvedValue(criarListagem()),
        responderConvite: jest.fn(
            () =>
                new Promise((resolve) => {
                    concluir = resolve;
                })
        )
    };
    const { result } = await renderHook(() => useReceivedContacts({ service }));
    await waitFor(() => expect(result.current.carregando).toBe(false));

    let segunda;
    await act(async () => {
        const primeira = result.current.responder(1, 'aceitar');
        segunda = await result.current.responder(2, 'recusar');
        concluir({ status: 'ativo', mensagem: 'Convite aceito com sucesso.' });
        await primeira;
    });

    expect(segunda).toBe(false);
    expect(service.responderConvite).toHaveBeenCalledTimes(1);
});

test('cancela a listagem quando desmonta', async () => {
    let sinal;
    const service = {
        listarRecebidos: jest.fn(({ signal }) => {
            sinal = signal;
            return new Promise(() => {});
        }),
        responderConvite: jest.fn()
    };
    const { unmount } = await renderHook(() => useReceivedContacts({ service }));
    await waitFor(() => expect(sinal).toBeDefined());

    await act(async () => {
        unmount();
        await Promise.resolve();
    });
    expect(sinal.aborted).toBe(true);
});

test('encerra a sessão ao receber erro de autenticação', async () => {
    const falha = Object.assign(new Error('expirada'), {
        status: 401,
        codigo: 'TOKEN_INVALIDO'
    });
    const onSessaoExpirada = jest.fn();
    const service = {
        listarRecebidos: jest.fn().mockRejectedValue(falha),
        responderConvite: jest.fn()
    };
    const { result } = await renderHook(() => useReceivedContacts({ service, onSessaoExpirada }));

    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(onSessaoExpirada).toHaveBeenCalledWith({
        mensagem: 'Sua sessão expirou. Entre novamente.'
    });
    expect(result.current.erro).toBeNull();
});
