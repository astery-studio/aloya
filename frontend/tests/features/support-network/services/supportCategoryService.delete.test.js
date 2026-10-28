//Testa a consulta de impacto e a exclusão de categorias.
import { criarSupportCategoryService } from '../../../../src/features/support-network/services/supportCategoryService';

const impacto = Object.freeze({
    categoria: Object.freeze({
        id: 7,
        nome: 'Família',
        atualizadoEm: '2026-10-26T12:00:00.000Z'
    }),
    quantidadeContatos: 2,
    contatos: Object.freeze([
        Object.freeze({
            vinculoId: 20,
            nome: 'Ana Martins'
        }),
        Object.freeze({
            vinculoId: 21,
            nome: 'Carlos Martins'
        })
    ])
});

const decisoes = Object.freeze([
    Object.freeze({
        vinculoId: 20,
        acao: 'remover_acesso'
    }),
    Object.freeze({
        vinculoId: 21,
        acao: 'manter_acesso_individual'
    })
]);

function criarServico(requisicaoAutenticada) {
    return criarSupportCategoryService({
        requisicaoAutenticada
    });
}

describe('supportCategoryService exclusão', () => {
    test('consulta o impacto da exclusão', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue(impacto);

        const servico = criarServico(requisicaoAutenticada);

        const resultado = await servico.consultarImpactoExclusao(7);

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: '/support-network/permission-categories/7/deletion-impact'
        });

        expect(resultado).toEqual(impacto);

        expect(Object.isFrozen(resultado)).toBe(true);

        expect(Object.isFrozen(resultado.contatos)).toBe(true);
    });

    test('encaminha o sinal de cancelamento na consulta', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue(impacto);

        const servico = criarServico(requisicaoAutenticada);

        const controlador = new AbortController();

        await servico.consultarImpactoExclusao(7, {
            signal: controlador.signal
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: '/support-network/permission-categories/7/deletion-impact',
            signal: controlador.signal
        });
    });

    test('rejeita uma resposta de impacto inconsistente', async () => {
        const servico = criarServico(
            jest.fn().mockResolvedValue({
                ...impacto,
                quantidadeContatos: 3
            })
        );

        await expect(servico.consultarImpactoExclusao(7)).rejects.toMatchObject({
            codigo: 'RESPOSTA_IMPACTO_EXCLUSAO_INVALIDA'
        });
    });

    test('rejeita contatos duplicados no impacto', async () => {
        const servico = criarServico(
            jest.fn().mockResolvedValue({
                ...impacto,
                contatos: [impacto.contatos[0], impacto.contatos[0]]
            })
        );

        await expect(servico.consultarImpactoExclusao(7)).rejects.toMatchObject({
            codigo: 'RESPOSTA_IMPACTO_EXCLUSAO_INVALIDA'
        });
    });

    test('envia a exclusão com versão e decisões', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            mensagem: 'Categoria excluída com sucesso.',
            resultado: {
                categoriaId: 7,
                quantidadeAcessosRemovidos: 1,
                quantidadeAcessosMantidos: 1
            }
        });

        const servico = criarServico(requisicaoAutenticada);

        const resultado = await servico.excluirCategoria(7, {
            atualizadoEm: '2026-10-26T12:00:00.000Z',
            decisoes
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'DELETE',
            caminho: '/support-network/permission-categories/7',
            corpo: {
                atualizadoEm: '2026-10-26T12:00:00.000Z',
                decisoes: [
                    {
                        vinculoId: 20,
                        acao: 'remover_acesso'
                    },
                    {
                        vinculoId: 21,
                        acao: 'manter_acesso_individual'
                    }
                ]
            }
        });

        expect(resultado).toEqual({
            categoriaId: 7,
            quantidadeAcessosRemovidos: 1,
            quantidadeAcessosMantidos: 1
        });
    });

    test('permite excluir sem contatos usando decisões vazias', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            resultado: {
                categoriaId: 7,
                quantidadeAcessosRemovidos: 0,
                quantidadeAcessosMantidos: 0
            }
        });

        const servico = criarServico(requisicaoAutenticada);

        await servico.excluirCategoria(7, {
            atualizadoEm: '2026-10-26T12:00:00.000Z',
            decisoes: []
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith(
            expect.objectContaining({
                corpo: {
                    atualizadoEm: '2026-10-26T12:00:00.000Z',
                    decisoes: []
                }
            })
        );
    });

    test.each([undefined, null, 0, -1, 1.5, '7'])(
        'rejeita o identificador inválido %p',
        async (categoriaId) => {
            const servico = criarServico(jest.fn());

            await expect(servico.consultarImpactoExclusao(categoriaId)).rejects.toThrow(
                'O identificador da categoria é inválido.'
            );
        }
    );

    test('rejeita decisões repetidas', () => {
        const servico = criarServico(jest.fn());

        expect(() =>
            servico.excluirCategoria(7, {
                atualizadoEm: '2026-10-26T12:00:00.000Z',
                decisoes: [
                    {
                        vinculoId: 20,
                        acao: 'remover_acesso'
                    },
                    {
                        vinculoId: 20,
                        acao: 'manter_acesso_individual'
                    }
                ]
            })
        ).toThrow('As decisões dos contatos são inválidas.');
    });

    test('rejeita uma ação desconhecida', () => {
        const servico = criarServico(jest.fn());

        expect(() =>
            servico.excluirCategoria(7, {
                atualizadoEm: '2026-10-26T12:00:00.000Z',
                decisoes: [
                    {
                        vinculoId: 20,
                        acao: 'acao_invalida'
                    }
                ]
            })
        ).toThrow('As decisões dos contatos são inválidas.');
    });

    test('preserva erros devolvidos pelo backend', async () => {
        const erro = new Error('Impacto alterado');

        erro.status = 409;
        erro.codigo = 'IMPACTO_EXCLUSAO_ALTERADO';
        erro.detalhes = {
            quantidadeContatos: 3
        };

        const servico = criarServico(jest.fn().mockRejectedValue(erro));

        await expect(
            servico.excluirCategoria(7, {
                atualizadoEm: '2026-10-26T12:00:00.000Z',
                decisoes
            })
        ).rejects.toMatchObject({
            status: 409,
            codigo: 'IMPACTO_EXCLUSAO_ALTERADO',
            detalhes: {
                quantidadeContatos: 3
            }
        });
    });

    test('reutiliza a mesma promessa para exclusões idênticas', async () => {
        let resolver;

        const pendente = new Promise((resolve) => {
            resolver = resolve;
        });

        const requisicaoAutenticada = jest.fn().mockReturnValue(pendente);

        const servico = criarServico(requisicaoAutenticada);

        const primeira = servico.excluirCategoria(7, {
            atualizadoEm: '2026-10-26T12:00:00.000Z',
            decisoes
        });

        const segunda = servico.excluirCategoria(7, {
            atualizadoEm: '2026-10-26T12:00:00.000Z',
            decisoes
        });

        expect(segunda).toBe(primeira);

        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);

        resolver({
            resultado: {
                categoriaId: 7,
                quantidadeAcessosRemovidos: 1,
                quantidadeAcessosMantidos: 1
            }
        });

        await primeira;
    });

    test('rejeita outra exclusão simultânea da mesma categoria', async () => {
        let resolver;

        const pendente = new Promise((resolve) => {
            resolver = resolve;
        });

        const servico = criarServico(jest.fn().mockReturnValue(pendente));

        const primeira = servico.excluirCategoria(7, {
            atualizadoEm: '2026-10-26T12:00:00.000Z',
            decisoes
        });

        await expect(
            servico.excluirCategoria(7, {
                atualizadoEm: '2026-10-26T12:00:00.000Z',
                decisoes: []
            })
        ).rejects.toMatchObject({
            codigo: 'EXCLUSAO_CATEGORIA_EM_ANDAMENTO'
        });

        resolver({
            resultado: {
                categoriaId: 7,
                quantidadeAcessosRemovidos: 1,
                quantidadeAcessosMantidos: 1
            }
        });

        await primeira;
    });
});
