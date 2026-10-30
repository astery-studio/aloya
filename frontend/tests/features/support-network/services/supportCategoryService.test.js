//Testa criação, listagem, validação de respostas e proteção contra requisições inválidas.
import { criarSupportCategoryService } from '../../../../src/features/support-network/services/supportCategoryService';
import { endpoints } from '../../../../src/shared/services/api/endpoints';

const dadosValidos = Object.freeze({
    nome: 'Família',
    dadosVisiveis: Object.freeze(['geral.fase_atual', 'ciclo.fluxo_menstrual'])
});

function criarCategoria(alteracoes = {}) {
    return {
        id: 10,
        nome: 'Família',
        dadosVisiveis: ['geral.fase_atual', 'ciclo.fluxo_menstrual'],
        quantidadeContatos: 0,
        criadoEm: '2026-09-25T10:00:00.000Z',
        atualizadoEm: '2026-09-25T10:00:00.000Z',
        ...alteracoes
    };
}

function criarResposta(alteracoes = {}) {
    return {
        mensagem: 'Categoria criada com sucesso.',
        categoria: criarCategoria(alteracoes)
    };
}

function criarRespostaListagem(categorias = [criarCategoria()]) {
    return { categorias };
}

describe('supportCategoryService', () => {
    test('libera envio travado antes da API e permite tentar novamente', async () => {
        jest.useFakeTimers();
        try {
            const requisicaoAutenticada = jest
                .fn()
                .mockReturnValueOnce(new Promise(() => {}))
                .mockResolvedValueOnce(criarResposta());
            const service = criarSupportCategoryService({ requisicaoAutenticada });
            const resultado = expect(service.criarCategoria(dadosValidos)).rejects.toMatchObject({
                codigo: 'TEMPO_SALVAMENTO_ESGOTADO'
            });
            await jest.advanceTimersByTimeAsync(15000);
            await resultado;
            expect(requisicaoAutenticada.mock.calls[0][0].signal.aborted).toBe(true);
            await expect(service.criarCategoria(dadosValidos)).resolves.toMatchObject({
                nome: 'Família'
            });
            expect(jest.getTimerCount()).toBe(0);
        } finally {
            jest.useRealTimers();
        }
    });
    test('rejeita dependência ausente ou inválida', () => {
        expect(() => criarSupportCategoryService({})).toThrow(
            'Não foi possível configurar o serviço de categorias.'
        );

        expect(() =>
            criarSupportCategoryService({
                requisicaoAutenticada: 'não é uma função'
            })
        ).toThrow('Não foi possível configurar o serviço de categorias.');
    });

    test('lista as categorias usando a sessão autenticada', async () => {
        const resposta = criarRespostaListagem([
            criarCategoria({
                id: 1,
                nome: 'Família'
            }),
            criarCategoria({
                id: 2,
                nome: 'Parceiro(a)',
                quantidadeContatos: 1
            })
        ]);

        const requisicaoAutenticada = jest.fn().mockResolvedValue(resposta);

        const service = criarSupportCategoryService({
            requisicaoAutenticada
        });

        const categorias = await service.listarCategorias();

        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: endpoints.categoriasPermissao
        });

        expect(categorias).toEqual(resposta.categorias);

        expect(Object.isFrozen(categorias)).toBe(true);

        expect(Object.isFrozen(categorias[0])).toBe(true);

        expect(Object.isFrozen(categorias[0].dadosVisiveis)).toBe(true);
    });

    test('encaminha o sinal de cancelamento para a listagem', async () => {
        const controlador = new AbortController();

        const requisicaoAutenticada = jest.fn().mockResolvedValue(criarRespostaListagem([]));

        const service = criarSupportCategoryService({
            requisicaoAutenticada
        });

        await service.listarCategorias({
            signal: controlador.signal
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: endpoints.categoriasPermissao,
            signal: controlador.signal
        });
    });

    test('aceita uma listagem vazia', async () => {
        const service = criarSupportCategoryService({
            requisicaoAutenticada: jest.fn().mockResolvedValue({
                categorias: []
            })
        });

        const categorias = await service.listarCategorias();

        expect(categorias).toEqual([]);
        expect(Object.isFrozen(categorias)).toBe(true);
    });

    test('remove campos privados das categorias listadas', async () => {
        const service = criarSupportCategoryService({
            requisicaoAutenticada: jest.fn().mockResolvedValue(
                criarRespostaListagem([
                    criarCategoria({
                        titularId: 999,
                        nomeNormalizado: 'família',
                        token: 'token privado'
                    })
                ])
            )
        });

        const [categoria] = await service.listarCategorias();

        expect(categoria).not.toHaveProperty('titularId');

        expect(categoria).not.toHaveProperty('nomeNormalizado');

        expect(categoria).not.toHaveProperty('token');
    });

    test.each([
        null,
        undefined,
        {},
        [],
        {
            categorias: null
        },
        {
            categorias: {}
        },
        {
            categorias: [null]
        },
        {
            categorias: [
                criarCategoria({
                    id: -1
                })
            ]
        },
        {
            categorias: [
                criarCategoria({
                    dadosVisiveis: ['administrador.acesso_total']
                })
            ]
        },
        {
            categorias: [
                criarCategoria({
                    quantidadeContatos: -1
                })
            ]
        }
    ])('rejeita resposta inválida da listagem: %p', async (resposta) => {
        const service = criarSupportCategoryService({
            requisicaoAutenticada: jest.fn().mockResolvedValue(resposta)
        });

        await expect(service.listarCategorias()).rejects.toMatchObject({
            message: 'Não foi possível carregar suas categorias no momento. Tente novamente.',
            codigo: 'RESPOSTA_CATEGORIAS_INVALIDA'
        });
    });

    test('repassa o erro da API ao listar categorias', async () => {
        const erro = new Error('Não foi possível conectar ao servidor.');

        erro.mensagemUsuario = 'Não foi possível conectar ao servidor.';

        const service = criarSupportCategoryService({
            requisicaoAutenticada: jest.fn().mockRejectedValue(erro)
        });

        await expect(service.listarCategorias()).rejects.toBe(erro);
    });

    test('cria uma categoria usando a sessão autenticada', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue(criarResposta());

        const service = criarSupportCategoryService({
            requisicaoAutenticada
        });

        const categoria = await service.criarCategoria(dadosValidos);

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'POST',
            signal: expect.any(AbortSignal),
            caminho: endpoints.categoriasPermissao,
            corpo: {
                nome: 'Família',
                dadosVisiveis: ['geral.fase_atual', 'ciclo.fluxo_menstrual']
            }
        });

        expect(categoria).toEqual(criarResposta().categoria);

        expect(Object.isFrozen(categoria)).toBe(true);

        expect(Object.isFrozen(categoria.dadosVisiveis)).toBe(true);
    });

    test('normaliza o nome e ordena as permissões', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue(criarResposta());

        const service = criarSupportCategoryService({
            requisicaoAutenticada
        });

        await service.criarCategoria({
            nome: '  Família   Próxima  ',
            dadosVisiveis: ['ciclo.fluxo_menstrual', 'geral.fase_atual', 'ciclo.fluxo_menstrual']
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'POST',
            signal: expect.any(AbortSignal),
            caminho: endpoints.categoriasPermissao,
            corpo: {
                nome: 'Família Próxima',
                dadosVisiveis: ['geral.fase_atual', 'ciclo.fluxo_menstrual']
            }
        });
    });

    test('remove campos privados presentes na resposta da criação', async () => {
        const resposta = criarResposta({
            titularId: 999,
            nomeNormalizado: 'família',
            token: 'token privado'
        });

        const service = criarSupportCategoryService({
            requisicaoAutenticada: jest.fn().mockResolvedValue(resposta)
        });

        const categoria = await service.criarCategoria(dadosValidos);

        expect(categoria).not.toHaveProperty('titularId');

        expect(categoria).not.toHaveProperty('nomeNormalizado');

        expect(categoria).not.toHaveProperty('token');
    });

    test.each([
        null,
        undefined,
        [],
        'categoria',
        {},
        {
            nome: 'Família'
        },
        {
            dadosVisiveis: ['geral.fase_atual']
        },
        {
            nome: '',
            dadosVisiveis: ['geral.fase_atual']
        },
        {
            nome: '<Família>',
            dadosVisiveis: ['geral.fase_atual']
        },
        {
            nome: 'Família',
            dadosVisiveis: []
        },
        {
            nome: 'Família',
            dadosVisiveis: ['administrador.acesso_total']
        },
        {
            nome: 'Família',
            dadosVisiveis: ['geral.fase_atual'],
            titularId: 999
        }
    ])('rejeita dados inválidos antes da requisição: %p', async (dados) => {
        const requisicaoAutenticada = jest.fn();

        const service = criarSupportCategoryService({
            requisicaoAutenticada
        });

        await expect(
            Promise.resolve().then(() => service.criarCategoria(dados))
        ).rejects.toMatchObject({
            message: 'Os dados da categoria são inválidos.',
            codigo: 'DADOS_CATEGORIA_INVALIDOS'
        });

        expect(requisicaoAutenticada).not.toHaveBeenCalled();
    });

    test('rejeita resposta inválida da criação', async () => {
        const service = criarSupportCategoryService({
            requisicaoAutenticada: jest.fn().mockResolvedValue({
                mensagem: 'Categoria criada.',
                categoria: {
                    id: 10,
                    nome: 'Família',
                    dadosVisiveis: ['administrador.acesso_total'],
                    quantidadeContatos: 0,
                    criadoEm: '2026-09-25T10:00:00.000Z',
                    atualizadoEm: '2026-09-25T10:00:00.000Z'
                }
            })
        });

        await expect(service.criarCategoria(dadosValidos)).rejects.toThrow(
            'Não foi possível carregar a categoria de permissão.'
        );
    });

    test('repassa erros controlados da API', async () => {
        const erro = new Error('Você já tem uma categoria com esse nome.');

        erro.codigo = 'CATEGORIA_NOME_DUPLICADO';

        erro.status = 409;

        const service = criarSupportCategoryService({
            requisicaoAutenticada: jest.fn().mockRejectedValue(erro)
        });

        await expect(service.criarCategoria(dadosValidos)).rejects.toBe(erro);
    });

    test('reutiliza a mesma criação enquanto ela está em andamento', async () => {
        let concluirRequisicao;

        const requisicaoAutenticada = jest.fn(
            () =>
                new Promise((resolve) => {
                    concluirRequisicao = resolve;
                })
        );

        const service = criarSupportCategoryService({
            requisicaoAutenticada
        });

        const primeiraCriacao = service.criarCategoria(dadosValidos);

        const segundaCriacao = service.criarCategoria(dadosValidos);

        expect(primeiraCriacao).toBe(segundaCriacao);

        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);

        concluirRequisicao(criarResposta());

        await primeiraCriacao;
    });

    test('não mistura duas categorias diferentes enviadas simultaneamente', async () => {
        let concluirRequisicao;

        const requisicaoAutenticada = jest.fn(
            () =>
                new Promise((resolve) => {
                    concluirRequisicao = resolve;
                })
        );

        const service = criarSupportCategoryService({
            requisicaoAutenticada
        });

        const primeiraCriacao = service.criarCategoria(dadosValidos);

        await expect(
            service.criarCategoria({
                nome: 'Profissionais',
                dadosVisiveis: ['saude.consultas']
            })
        ).rejects.toMatchObject({
            codigo: 'CRIACAO_CATEGORIA_EM_ANDAMENTO'
        });

        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);

        concluirRequisicao(criarResposta());

        await primeiraCriacao;
    });

    test('permite uma nova criação depois que a anterior termina', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue(criarResposta());

        const service = criarSupportCategoryService({
            requisicaoAutenticada
        });

        await service.criarCategoria(dadosValidos);

        await service.criarCategoria(dadosValidos);

        expect(requisicaoAutenticada).toHaveBeenCalledTimes(2);
    });
});
