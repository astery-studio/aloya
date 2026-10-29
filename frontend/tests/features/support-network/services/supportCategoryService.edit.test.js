//Testa o contrato de edição das categorias de permissão.
import {
    criarSupportCategoryService
} from '../../../../src/features/support-network/services/supportCategoryService'

const categoriaAtualizada = Object.freeze({
    id: 7,
    nome: 'Família',
    dadosVisiveis: [
        'geral.fase_atual',
        'geral.anticoncepcionais'
    ],
    quantidadeContatos: 2,
    criadoEm:
        '2026-10-20T10:00:00.000Z',
    atualizadoEm:
        '2026-10-28T12:00:00.000Z'
})

function criarDadosEdicao(
    alteracoes = {}
) {
    return {
        nome: ' Família ',
        dadosVisiveis: [
            'geral.anticoncepcionais',
            'geral.fase_atual'
        ],
        atualizadoEm:
            '2026-10-26T12:00:00.000Z',
        ...alteracoes
    }
}

function criarServico(
    requisicaoAutenticada
) {
    return criarSupportCategoryService({
        requisicaoAutenticada
    })
}

describe(
    'supportCategoryService editarCategoria',
    () => {
        test(
            'envia uma substituição completa para a categoria',
            async () => {
                const requisicaoAutenticada =
                    jest.fn()
                        .mockResolvedValue({
                            categoria:
                                categoriaAtualizada
                        })

                const servico =
                    criarServico(
                        requisicaoAutenticada
                    )

                const resultado =
                    await servico.editarCategoria(
                        7,
                        criarDadosEdicao()
                    )

                expect(
                    requisicaoAutenticada
                ).toHaveBeenCalledWith({
                    metodo: 'PUT',
                    caminho:
                        '/support-network/permission-categories/7',
                    corpo: {
                        nome: 'Família',
                        dadosVisiveis: [
                            'geral.fase_atual',
                            'geral.anticoncepcionais'
                        ],
                        atualizadoEm:
                            '2026-10-26T12:00:00.000Z'
                    }
                })

                expect(resultado).toEqual(
                    categoriaAtualizada
                )

                expect(
                    Object.isFrozen(resultado)
                ).toBe(true)
            }
        )

        test(
            'envia a quantidade ao confirmar o impacto',
            async () => {
                const requisicaoAutenticada =
                    jest.fn()
                        .mockResolvedValue({
                            categoria:
                                categoriaAtualizada
                        })

                const servico =
                    criarServico(
                        requisicaoAutenticada
                    )

                await servico.editarCategoria(
                    7,
                    criarDadosEdicao({
                        quantidadeContatosConfirmada:
                            2
                    })
                )

                expect(
                    requisicaoAutenticada
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        corpo: {
                            nome: 'Família',
                            dadosVisiveis: [
                                'geral.fase_atual',
                                'geral.anticoncepcionais'
                            ],
                            atualizadoEm:
                                '2026-10-26T12:00:00.000Z',
                            quantidadeContatosConfirmada:
                                2
                        }
                    })
                )
            }
        )

        test.each([
            undefined,
            null,
            0,
            -1,
            1.5,
            '7'
        ])(
            'rejeita o identificador inválido %p',
            categoriaId => {
                const servico =
                    criarServico(jest.fn())

                expect(() =>
                    servico.editarCategoria(
                        categoriaId,
                        criarDadosEdicao()
                    )
                ).toThrow(
                    'O identificador da categoria é inválido.'
                )
            }
        )

        test.each([
            undefined,
            null,
            '',
            '2026-10-26',
            'data-invalida',
            '2026-10-26T12:00:00Z'
        ])(
            'rejeita a versão inválida %p',
            atualizadoEm => {
                const servico =
                    criarServico(jest.fn())

                expect(() =>
                    servico.editarCategoria(
                        7,
                        criarDadosEdicao({
                            atualizadoEm
                        })
                    )
                ).toThrow(
                    'A versão da categoria é inválida.'
                )
            }
        )

        test.each([
            -1,
            1.5,
            '2',
            null
        ])(
            'rejeita a confirmação inválida %p',
            quantidadeContatosConfirmada => {
                const servico =
                    criarServico(jest.fn())

                expect(() =>
                    servico.editarCategoria(
                        7,
                        criarDadosEdicao({
                            quantidadeContatosConfirmada
                        })
                    )
                ).toThrow(
                    'A confirmação de impacto é inválida.'
                )
            }
        )

        test(
            'rejeita campos desconhecidos',
            () => {
                const servico =
                    criarServico(jest.fn())

                expect(() =>
                    servico.editarCategoria(
                        7,
                        criarDadosEdicao({
                            titularId: 99
                        })
                    )
                ).toThrow(
                    'Os dados da categoria são inválidos.'
                )
            }
        )

        test(
            'preserva a confirmação exigida pelo backend',
            async () => {
                const erro =
                    new Error(
                        'Confirmação necessária.'
                    )

                erro.status = 409
                erro.codigo =
                    'CONFIRMACAO_IMPACTO_NECESSARIA'
                erro.detalhes = {
                    quantidadeContatos: 2
                }

                const requisicaoAutenticada =
                    jest.fn()
                        .mockRejectedValue(erro)

                const servico =
                    criarServico(
                        requisicaoAutenticada
                    )

                await expect(
                    servico.editarCategoria(
                        7,
                        criarDadosEdicao()
                    )
                ).rejects.toMatchObject({
                    status: 409,
                    codigo:
                        'CONFIRMACAO_IMPACTO_NECESSARIA',
                    detalhes: {
                        quantidadeContatos: 2
                    }
                })
            }
        )

        test(
            'reutiliza a mesma promessa para uma edição idêntica',
            async () => {
                let resolverRequisicao

                const respostaPendente =
                    new Promise(resolve => {
                        resolverRequisicao =
                            resolve
                    })

                const requisicaoAutenticada =
                    jest.fn()
                        .mockReturnValue(
                            respostaPendente
                        )

                const servico =
                    criarServico(
                        requisicaoAutenticada
                    )

                const primeira =
                    servico.editarCategoria(
                        7,
                        criarDadosEdicao()
                    )

                const segunda =
                    servico.editarCategoria(
                        7,
                        criarDadosEdicao()
                    )

                expect(segunda).toBe(primeira)

                expect(
                    requisicaoAutenticada
                ).toHaveBeenCalledTimes(1)

                resolverRequisicao({
                    categoria:
                        categoriaAtualizada
                })

                await expect(
                    primeira
                ).resolves.toEqual(
                    categoriaAtualizada
                )
            }
        )

        test(
            'bloqueia uma edição diferente enquanto a categoria está sendo atualizada',
            async () => {
                let resolverRequisicao

                const respostaPendente =
                    new Promise(resolve => {
                        resolverRequisicao =
                            resolve
                    })

                const requisicaoAutenticada =
                    jest.fn()
                        .mockReturnValue(
                            respostaPendente
                        )

                const servico =
                    criarServico(
                        requisicaoAutenticada
                    )

                const primeira =
                    servico.editarCategoria(
                        7,
                        criarDadosEdicao()
                    )

                await expect(
                    servico.editarCategoria(
                        7,
                        criarDadosEdicao({
                            nome: 'Parceiro'
                        })
                    )
                ).rejects.toMatchObject({
                    codigo:
                        'EDICAO_CATEGORIA_EM_ANDAMENTO'
                })

                resolverRequisicao({
                    categoria:
                        categoriaAtualizada
                })

                await primeira
            }
        )

        test(
            'permite editar categorias diferentes simultaneamente',
            async () => {
                const requisicaoAutenticada =
                    jest.fn()
                        .mockImplementation(
                            ({caminho}) =>
                                Promise.resolve({
                                    categoria: {
                                        ...categoriaAtualizada,
                                        id: Number(
                                            caminho
                                                .split('/')
                                                .at(-1)
                                        )
                                    }
                                })
                        )

                const servico =
                    criarServico(
                        requisicaoAutenticada
                    )

                const resultados =
                    await Promise.all([
                        servico.editarCategoria(
                            7,
                            criarDadosEdicao()
                        ),
                        servico.editarCategoria(
                            8,
                            criarDadosEdicao()
                        )
                    ])

                expect(
                    resultados.map(
                        categoria =>
                            categoria.id
                    )
                ).toEqual([7, 8])

                expect(
                    requisicaoAutenticada
                ).toHaveBeenCalledTimes(2)
            }
        )

        test(
            'rejeita uma categoria inválida devolvida pela API',
            async () => {
                const requisicaoAutenticada =
                    jest.fn()
                        .mockResolvedValue({
                            categoria: {
                                id: 7
                            }
                        })

                const servico =
                    criarServico(
                        requisicaoAutenticada
                    )

                await expect(
                    servico.editarCategoria(
                        7,
                        criarDadosEdicao()
                    )
                ).rejects.toThrow(
                    'Não foi possível carregar a categoria de permissão.'
                )
            }
        )
    }
)