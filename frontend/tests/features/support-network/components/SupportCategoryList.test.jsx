//Testa ordenação, resumos e estados da lista de categorias.
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

jest.mock(
    '../../../../src/shared/components/icons/AppIcons',
    () => {
        const React = require('react')
        const {View} = require('react-native')

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
                criarIcone('TrashIcon'),
            UserIcon:
                criarIcone('UserIcon'),
            UsersIcon:
                criarIcone('UsersIcon')
        }
    }
)

import {
    criarResumoPermissoes,
    ordenarCategorias,
    SupportCategoryList
} from '../../../../src/features/support-network/components/SupportCategoryList'
import {
    gruposPermissoes,
    permissoesGerais
} from '../../../../src/features/support-network/constants/permissionOptions'

const todasAsPermissoes = [
    ...permissoesGerais.map(
        permissao => permissao.id
    ),
    ...gruposPermissoes.flatMap(
        grupo =>
            grupo.permissoes.map(
                permissao =>
                    permissao.id
            )
    )
]

const categorias = [
    {
        id: 3,
        nome: 'Rede próxima',
        dadosVisiveis: [
            'geral.fase_atual',
            'emocional.sintomas_emocionais'
        ],
        quantidadeContatos: 3
    },
    {
        id: 1,
        nome: 'Família',
        dadosVisiveis: [
            'geral.fase_atual',
            'geral.dicas',
            'ciclo.fluxo_menstrual'
        ],
        quantidadeContatos: 2
    },
    {
        id: 2,
        nome: 'Parceiro(a)',
        dadosVisiveis:
            todasAsPermissoes,
        quantidadeContatos: 1
    }
]

describe('SupportCategoryList', () => {
    test('ordena as categorias alfabeticamente', () => {
        render(
            <SupportCategoryList
                categorias={categorias}
                onCriar={jest.fn()}
                onEditar={jest.fn()}
                onExcluir={jest.fn()}
            />
        )

        const nomes = screen
            .getAllByTestId(
                'support-category-name'
            )
            .map(elemento =>
                elemento.props.children
            )

        expect(nomes).toEqual([
            'Família',
            'Parceiro(a)',
            'Rede próxima'
        ])
    })

    test('cria resumos amigáveis para as permissões', () => {
        expect(
            criarResumoPermissoes(
                todasAsPermissoes
            )
        ).toBe(
            'Todos os dados permitidos'
        )

        expect(
            criarResumoPermissoes([
                'emocional.sintomas_emocionais'
            ])
        ).toBe(
            'Apenas Humor permitido'
        )

        expect(
            criarResumoPermissoes([
                'geral.fase_atual',
                'emocional.sintomas_emocionais'
            ])
        ).toBe(
            'Fase atual e Humor permitidos'
        )

        expect(
            criarResumoPermissoes([
                'geral.fase_atual',
                'geral.dicas',
                'ciclo.fluxo_menstrual'
            ])
        ).toBe(
            '3 tipos de dado permitidos'
        )
    })

    test('ignora permissões e categorias inválidas', () => {
        expect(
            criarResumoPermissoes([
                'inválida',
                null
            ])
        ).toBe('Nenhum dado permitido')

        expect(
            ordenarCategorias([
                null,
                {},
                ...categorias
            ])
        ).toHaveLength(3)
    })

    test('mostra o estado vazio e permite criar', () => {
        const onCriar = jest.fn()

        render(
            <SupportCategoryList
                categorias={[]}
                onCriar={onCriar}
            />
        )

        expect(
            screen.getByText(
                'Nenhuma categoria registrada'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                /Você ainda não criou nenhuma categoria/
            )
        ).toBeOnTheScreen()

        fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Criar nova categoria de permissão'
            })
        )

        expect(onCriar).toHaveBeenCalledTimes(
            1
        )
    })

    test('mostra o carregamento inicial sem apagar dados existentes', () => {
        const {rerender} = render(
            <SupportCategoryList
                categorias={[]}
                carregando
            />
        )

        expect(
            screen.getByLabelText(
                'Carregando categorias'
            )
        ).toBeOnTheScreen()

        rerender(
            <SupportCategoryList
                categorias={categorias}
                carregando
                onCriar={jest.fn()}
            />
        )

        expect(
            screen.getByText('Família')
        ).toBeOnTheScreen()

        expect(
            screen.queryByLabelText(
                'Carregando categorias'
            )
        ).toBeNull()
    })

    test('preserva a lista durante atualização secundária', () => {
        render(
            <SupportCategoryList
                categorias={categorias}
                atualizando
                onTentarNovamente={
                    jest.fn()
                }
                onCriar={jest.fn()}
            />
        )

        expect(
            screen.getByText('Família')
        ).toBeOnTheScreen()

        expect(
            screen.getByLabelText(
                'Atualizando categorias'
            )
        ).toBeOnTheScreen()
    })

    test('mostra erro inicial e executa nova tentativa', () => {
        const onTentarNovamente =
            jest.fn()

        render(
            <SupportCategoryList
                categorias={[]}
                erro="ERRO_REDE"
                onTentarNovamente={
                    onTentarNovamente
                }
            />
        )

        expect(
            screen.getByText(
                'Ocorreu um erro'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByText(
                'Não foi possível carregar suas categorias no momento. Tente novamente.'
            )
        ).toBeOnTheScreen()

        expect(
            screen.queryByText(
                'Criar nova categoria'
            )
        ).toBeNull()

        fireEvent.press(
            screen.getByRole('button', {
                name: 'Tentar Novamente'
            })
        )

        expect(
            onTentarNovamente
        ).toHaveBeenCalledTimes(1)
    })

    test('encaminha edição e exclusão da categoria selecionada', () => {
        const onEditar = jest.fn()
        const onExcluir = jest.fn()

        render(
            <SupportCategoryList
                categorias={categorias}
                onEditar={onEditar}
                onExcluir={onExcluir}
                onCriar={jest.fn()}
            />
        )

        fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Editar categoria Família'
            })
        )

        fireEvent.press(
            screen.getByRole('button', {
                name:
                    'Excluir categoria Família'
            })
        )

        expect(onEditar).toHaveBeenCalledWith(
            categorias[1]
        )

        expect(onExcluir).toHaveBeenCalledWith(
            categorias[1]
        )
    })

    test('encaminha o estado da operação para a categoria correta', () => {
        render(
            <SupportCategoryList
                categorias={categorias}
                categoriaEmAndamentoId={1}
                acaoEmAndamento="excluir"
                onEditar={jest.fn()}
                onExcluir={jest.fn()}
                onCriar={jest.fn()}
            />
        )

        expect(
            screen.getByLabelText(
                'Excluindo categoria Família'
            )
        ).toBeOnTheScreen()

        expect(
            screen.queryByLabelText(
                'Excluindo categoria Parceiro(a)'
            )
        ).toBeNull()
    })
})