import {
    MENSAGEM_ERRO_LISTAGEM,
    criarReceivedContactsService
} from '../../../../src/features/support-network/services/receivedContactsService';

function criarContato({ id = 1, status = 'pendente' } = {}) {
    return {
        id,
        nome: 'Ana',
        email: 'ana@example.com',
        identificacao: 'Ana',
        iconeId: 'lotus',
        corId: 'verde',
        status,
        vinculo: {
            tipo: 'individual',
            rotulo: 'Permissão individual',
            categoria: null,
            permissoes: ['geral.fase_atual']
        },
        dataConvite: '2026-11-08T12:00:00.000Z',
        aguardando: null,
        acoes: {
            podeAceitar: status === 'pendente',
            podeRecusar: status === 'pendente',
            podeAbrirResumo: true
        }
    };
}

test('lista contatos recebidos usando a rota autenticada', async () => {
    const requisicaoAutenticada = jest.fn().mockResolvedValue({
        contatos: [criarContato()],
        resumo: { total: 1, pendentes: 1, ativos: 0 }
    });
    const service = criarReceivedContactsService({ requisicaoAutenticada });
    const controlador = new AbortController();

    const resultado = await service.listarRecebidos({ signal: controlador.signal });

    expect(requisicaoAutenticada).toHaveBeenCalledWith({
        metodo: 'GET',
        caminho: '/support-network/received-contacts',
        signal: controlador.signal
    });
    expect(resultado.contatos).toHaveLength(1);
    expect(Object.isFrozen(resultado.contatos)).toBe(true);
});

test('rejeita resposta de listagem inconsistente', async () => {
    const service = criarReceivedContactsService({
        requisicaoAutenticada: jest.fn().mockResolvedValue({
            contatos: [criarContato()],
            resumo: { total: 5, pendentes: 1, ativos: 0 }
        })
    });

    await expect(service.listarRecebidos()).rejects.toMatchObject({
        codigo: 'RESPOSTA_CONTATOS_RECEBIDOS_INVALIDA',
        mensagemUsuario: MENSAGEM_ERRO_LISTAGEM
    });
});

test.each([
    ['aceitar', 'ativo', 'Convite aceito com sucesso.'],
    ['recusar', 'recusado', 'Convite recusado com sucesso.']
])('responde ao convite com a ação %s', async (acao, status, mensagem) => {
    const requisicaoAutenticada = jest.fn().mockResolvedValue({ status, mensagem });
    const service = criarReceivedContactsService({ requisicaoAutenticada });

    await expect(service.responderConvite(31, acao)).resolves.toEqual({ status, mensagem });
    expect(requisicaoAutenticada).toHaveBeenCalledWith({
        metodo: 'POST',
        caminho: '/support-network/received-contacts/31/respond',
        corpo: { acao }
    });
});

test('reaproveita a requisição enquanto o mesmo convite está sendo processado', async () => {
    let concluir;
    const requisicaoAutenticada = jest.fn(
        () =>
            new Promise((resolve) => {
                concluir = resolve;
            })
    );
    const service = criarReceivedContactsService({ requisicaoAutenticada });

    const primeira = service.responderConvite(31, 'aceitar');
    const segunda = service.responderConvite(31, 'aceitar');

    await Promise.resolve();
    expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);
    concluir({ status: 'ativo', mensagem: 'Convite aceito com sucesso.' });
    await expect(Promise.all([primeira, segunda])).resolves.toHaveLength(2);
});

test('valida identificador e ação antes da chamada HTTP', async () => {
    const requisicaoAutenticada = jest.fn();
    const service = criarReceivedContactsService({ requisicaoAutenticada });

    await expect(service.responderConvite(0, 'aceitar')).rejects.toMatchObject({
        codigo: 'CONVITE_ID_INVALIDO'
    });
    await expect(service.responderConvite(1, 'ignorar')).rejects.toMatchObject({
        codigo: 'ACAO_CONVITE_INVALIDA'
    });
    expect(requisicaoAutenticada).not.toHaveBeenCalled();
});
