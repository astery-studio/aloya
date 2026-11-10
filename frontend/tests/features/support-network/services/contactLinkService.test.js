import {
    MENSAGEM_ERRO_ATUALIZACAO,
    criarContactLinkService,
    normalizarAtualizacao,
    normalizarConfiguracao
} from '../../../../src/features/support-network/services/contactLinkService';

const configuracaoValida = {
    contato: {
        id: 20,
        nome: 'Ana',
        email: 'ana@example.com'
    },
    vinculoAtual: {
        tipo: 'categoria',
        categoria: {
            id: 10,
            nome: 'Família',
            permissoes: ['geral.fase_atual', 'saude.consultas']
        },
        permissoes: ['geral.fase_atual', 'saude.consultas']
    },
    proximoVinculo: {
        tipo: 'individual',
        permissoesPreenchidas: ['geral.fase_atual', 'saude.consultas'],
        categorias: []
    },
    versao: '2026-11-08T12:00:00.000Z'
};

describe('contactLinkService', () => {
    test('consulta a configuração do vínculo ativo', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue(configuracaoValida);
        const service = criarContactLinkService({ requisicaoAutenticada });
        const controle = new AbortController();

        const resultado = await service.consultar(20, { signal: controle.signal });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: '/support-network/contacts/20/link',
            signal: controle.signal
        });
        expect(resultado).toEqual(configuracaoValida);
        expect(Object.isFrozen(resultado)).toBe(true);
    });

    test('atualiza categoria para permissões individuais', async () => {
        const resposta = {
            mensagem: 'Vínculo atualizado com sucesso.',
            vinculo: {
                contatoId: 20,
                tipo: 'individual',
                categoria: null,
                permissoes: ['geral.fase_atual']
            }
        };
        const requisicaoAutenticada = jest.fn().mockResolvedValue(resposta);
        const service = criarContactLinkService({ requisicaoAutenticada });
        const alteracao = {
            tipo: 'individual',
            permissoesIndividuais: ['geral.fase_atual'],
            versao: '2026-11-08T12:00:00.000Z'
        };

        await expect(service.atualizar(20, alteracao)).resolves.toEqual(resposta);
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'PATCH',
            caminho: '/support-network/contacts/20/link',
            corpo: alteracao
        });
    });

    test('reutiliza a atualização em andamento para impedir envios duplicados', async () => {
        let resolver;
        const requisicaoAutenticada = jest.fn(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );
        const service = criarContactLinkService({ requisicaoAutenticada });
        const alteracao = {
            tipo: 'categoria',
            categoriaId: 10,
            versao: '2026-11-08T12:00:00.000Z'
        };

        const primeira = service.atualizar(21, alteracao);
        const segunda = service.atualizar(21, alteracao);

        await Promise.resolve();
        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);

        resolver({
            mensagem: 'Vínculo atualizado com sucesso.',
            vinculo: {
                contatoId: 21,
                tipo: 'categoria',
                categoria: { id: 10, nome: 'Família', permissoes: [] },
                permissoes: []
            }
        });

        await expect(Promise.all([primeira, segunda])).resolves.toHaveLength(2);
    });

    test.each([
        null,
        {},
        { ...configuracaoValida, versao: 'inválida' },
        {
            ...configuracaoValida,
            vinculoAtual: { ...configuracaoValida.vinculoAtual, categoria: null }
        }
    ])('rejeita configuração inválida sem expor dados', (resposta) => {
        expect(() => normalizarConfiguracao(resposta)).toThrow(MENSAGEM_ERRO_ATUALIZACAO);
    });

    test('rejeita resposta de atualização inválida', () => {
        expect(() => normalizarAtualizacao({ mensagem: 'sucesso privado' })).toThrow(
            MENSAGEM_ERRO_ATUALIZACAO
        );
    });

    test('rejeita identificador inválido antes da API', async () => {
        const requisicaoAutenticada = jest.fn();
        const service = criarContactLinkService({ requisicaoAutenticada });

        await expect(service.consultar('20')).rejects.toMatchObject({
            codigo: 'CONTATO_ID_INVALIDO'
        });
        expect(requisicaoAutenticada).not.toHaveBeenCalled();
    });

    test('rejeita configuração sem cliente autenticado', () => {
        expect(() => criarContactLinkService()).toThrow(
            'Não foi possível configurar o serviço de vínculo.'
        );
    });
});
