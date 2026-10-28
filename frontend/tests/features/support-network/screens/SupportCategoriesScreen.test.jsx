//Testa a integração da tela com o hook e as ações da lista.
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

const mockUseSupportCategories =
    jest.fn()

jest.mock(
    '../../../../src/features/support-network/hooks/useSupportCategories',
    () => ({
        useSupportCategories:
            opcoes =>
                mockUseSupportCategories(
                    opcoes
                )
    })
)

jest.mock(
    '../../../../src/shared/components/navigation/Header/Header',
    () => {
        const React = require('react')
        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function Header({
            titulo,
            variante,
            onVoltar
        }) {
            const desabilitado =
                typeof onVoltar
                !== 'function'

            return React.createElement(
                View,
                {
                    testID:
                        'header-categorias'
                },
                React.createElement(
                    Text,
                    null,
                    titulo
                ),
                React.createElement(
                    Text,
                    null,
                    `Variante: ${variante}`
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Voltar',
                        accessibilityState: {
                            disabled:
                                desabilitado
                        },
                        disabled:
                            desabilitado,
                        onPress: onVoltar
                    },
                    React.createElement(
                        Text,
                        null,
                        'Voltar'
                    )
                )
            )
        }

        return {Header}
    }
)

jest.mock(
    '../../../../src/shared/components/icons/AppIcons',
    () => {
        const React = require('react')
        const {View} =
            require('react-native')

        function criarIcone(nome) {
            return function IconeFalso(
                propriedades
            ) {
                return React.createElement(
                    View,
                    {
                        ...propriedades,
                        testID: nome
                    }
                )
            }
        }

        return {
            PencilSimpleIcon:
                criarIcone(
                    'PencilSimpleIcon'
                ),
            TrashIcon:
                criarIcone(
                    'TrashIcon'
                ),
            UserCheckIcon:
                criarIcone(
                    'UserCheckIcon'
                ),
            UserIcon:
                criarIcone(
                    'UserIcon'
                ),
            UsersIcon:
                criarIcone(
                    'UsersIcon'
                )
        }
    }
)

import {
    SupportCategoriesScreen
} from '../../../../src/features/support-network/screens/SupportCategoriesScreen'

const categoria = Object.freeze({
    id: 1,
    nome: 'Família',
    dadosVisiveis: Object.freeze([
        'geral.fase_atual'
    ]),
    quantidadeContatos: 2,
    criadoEm:
        '2026-09-25T10:00:00.000Z',
    atualizadoEm:
        '2026-09-25T10:00:00.000Z'
})

function criarEstadoHook(
    alteracoes = {}
) {
    return {
        categorias: [categoria],
        carregando: false,
        atualizando: false,
        erro: null,
        tentarNovamente:
            jest.fn(),
        atualizarLista:
            jest.fn(),
        adicionarCategoria:
            jest.fn(),
        atualizarCategoria:
            jest.fn(),
        removerCategoria:
            jest.fn(),
        ...alteracoes
    }
}

describe(
    'SupportCategoriesScreen',
    () => {
        beforeEach(() => {
            mockUseSupportCategories
                .mockReset()

            mockUseSupportCategories
                .mockReturnValue(
                    criarEstadoHook()
                )
        })

        test(
            'conecta o serviço ao hook e mostra as categorias',
            async () => {
                const service = {
                    listarCategorias:
                        jest.fn()
                }

                const onSessaoExpirada =
                    jest.fn()

                await render(
                    <SupportCategoriesScreen
                        service={service}
                        onSessaoExpirada={
                            onSessaoExpirada
                        }
                        onCriar={jest.fn()}
                        onEditar={jest.fn()}
                        onExcluir={jest.fn()}
                    />
                )

                expect(
                    mockUseSupportCategories
                ).toHaveBeenCalledWith({
                    service,
                    onSessaoExpirada
                })

                expect(
                    screen.getByText(
                        'Categorias de Permissão'
                    )
                ).toBeOnTheScreen()

                expect(
                    screen.getByText(
                        'Variante: comVoltar'
                    )
                ).toBeOnTheScreen()

                expect(
                    screen.getByText(
                        'Família'
                    )
                ).toBeOnTheScreen()
            }
        )

        test(
            'encaminha a ação de voltar',
            async () => {
                const onVoltar =
                    jest.fn()

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn()
                        }}
                        onVoltar={onVoltar}
                        onCriar={jest.fn()}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name: 'Voltar'
                        }
                    )
                )

                expect(
                    onVoltar
                ).toHaveBeenCalledTimes(1)
            }
        )

        test(
            'encaminha a criação de categoria',
            async () => {
                const onCriar =
                    jest.fn()

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn()
                        }}
                        onCriar={onCriar}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Criar nova categoria de permissão'
                        }
                    )
                )

                expect(
                    onCriar
                ).toHaveBeenCalledTimes(1)
            }
        )

        test(
            'encaminha a categoria para edição',
            async () => {
                const onEditar =
                    jest.fn()

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn()
                        }}
                        onEditar={onEditar}
                        onCriar={jest.fn()}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Editar categoria Família'
                        }
                    )
                )

                expect(
                    onEditar
                ).toHaveBeenCalledWith(
                    categoria
                )
            }
        )

        test(
            'encaminha a categoria para exclusão',
            async () => {
                const onExcluir =
                    jest.fn()

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn()
                        }}
                        onExcluir={onExcluir}
                        onCriar={jest.fn()}
                    />
                )

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Excluir categoria Família'
                        }
                    )
                )

                expect(
                    onExcluir
                ).toHaveBeenCalledWith(
                    categoria
                )
            }
        )

        test(
            'mostra o carregamento inicial',
            async () => {
                mockUseSupportCategories
                    .mockReturnValue(
                        criarEstadoHook({
                            categorias: [],
                            carregando: true
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn()
                        }}
                    />
                )

                expect(
                    screen.getByLabelText(
                        'Carregando categorias'
                    )
                ).toBeOnTheScreen()
            }
        )

        test(
            'mantém as categorias durante atualização secundária',
            async () => {
                mockUseSupportCategories
                    .mockReturnValue(
                        criarEstadoHook({
                            atualizando: true
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn()
                        }}
                        onCriar={jest.fn()}
                    />
                )

                expect(
                    screen.getByText(
                        'Família'
                    )
                ).toBeOnTheScreen()

                expect(
                    screen.getByLabelText(
                        'Atualizando categorias'
                    )
                ).toBeOnTheScreen()
            }
        )

        test(
            'mostra o erro e encaminha nova tentativa',
            async () => {
                const tentarNovamente =
                    jest.fn()

                mockUseSupportCategories
                    .mockReturnValue(
                        criarEstadoHook({
                            categorias: [],
                            erro: 'ERRO_REDE',
                            tentarNovamente
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn()
                        }}
                    />
                )

                expect(
                    screen.getByText(
                        'Ocorreu um erro'
                    )
                ).toBeOnTheScreen()

                await fireEvent.press(
                    screen.getByRole(
                        'button',
                        {
                            name:
                                'Tentar Novamente'
                        }
                    )
                )

                expect(
                    tentarNovamente
                ).toHaveBeenCalledTimes(1)
            }
        )

        test(
            'mostra o estado vazio',
            async () => {
                mockUseSupportCategories
                    .mockReturnValue(
                        criarEstadoHook({
                            categorias: []
                        })
                    )

                await render(
                    <SupportCategoriesScreen
                        service={{
                            listarCategorias:
                                jest.fn()
                        }}
                        onCriar={jest.fn()}
                    />
                )

                expect(
                    screen.getByText(
                        'Nenhuma categoria registrada'
                    )
                ).toBeOnTheScreen()
            }
        )
    }
)