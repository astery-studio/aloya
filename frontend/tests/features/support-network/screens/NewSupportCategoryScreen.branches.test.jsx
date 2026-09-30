//Cobre respostas defensivas e estados simultâneos da criação de categoria.
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native'

let mockFormularioProps
let mockModalErroProps

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    BellIcon: jest.fn(() => null),
    WarningCircleIcon: jest.fn(() => null)
}))

jest.mock('../../../../src/features/settings/layouts/SettingsLayout/SettingsLayout', () => {
    const React = require('react')
    const {Pressable, Text, View} = require('react-native')

    return {
        SettingsLayout: ({titulo, onVoltar, children}) => React.createElement(
            View,
            null,
            React.createElement(Text, null, titulo),
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Voltar',
                    onPress: onVoltar
                },
                React.createElement(Text, null, 'Voltar')
            ),
            children
        )
    }
})

jest.mock('../../../../src/features/support-network/components/SupportCategoryForm', () => {
    const React = require('react')
    const {View} = require('react-native')

    return {
        SupportCategoryForm: props => {
            mockFormularioProps = props
            return React.createElement(View, {testID: 'formulario-falso'})
        }
    }
})

jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => {
    const React = require('react')
    const {Pressable, Text, View} = require('react-native')

    return function ModalFalso(props) {
        if (props.titulo !== 'Categoria criada com sucesso') {
            mockModalErroProps = props
        }

        if (!props.visivel) {
            return null
        }

        return React.createElement(
            View,
            null,
            React.createElement(Text, null, props.titulo),
            props.mensagem
                ? React.createElement(Text, null, props.mensagem)
                : null,
            props.acaoPrincipal
                ? React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: props.acaoPrincipal.texto,
                        onPress: props.acaoPrincipal.aoPressionar,
                        disabled: props.acaoPrincipal.desativado
                    },
                    React.createElement(Text, null, props.acaoPrincipal.texto)
                )
                : null,
            props.acaoSecundaria
                ? React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: props.acaoSecundaria.texto,
                        onPress: props.acaoSecundaria.aoPressionar,
                        disabled: props.acaoSecundaria.desativado
                    },
                    React.createElement(Text, null, props.acaoSecundaria.texto)
                )
                : null
        )
    }
})

import {NewSupportCategoryScreen} from '../../../../src/features/support-network/screens/NewSupportCategoryScreen'

const dadosValidos = {
    nome: 'Família',
    dadosVisiveis: ['geral.fase_atual']
}

const categoriaValida = {
    id: 10,
    nome: 'Família',
    dadosVisiveis: ['geral.fase_atual'],
    quantidadeContatos: 0
}

async function enviar() {
    await act(async () => {
        await mockFormularioProps.aoSalvar(dadosValidos)
    })
}

describe('NewSupportCategoryScreen - ramos defensivos', () => {
    test.each([
        ['NOME_CATEGORIA_OBRIGATORIO', undefined, 'Salvar sem nome'],
        ['PERMISSAO_CATEGORIA_OBRIGATORIA', undefined, 'Categoria sem permissões'],
        ['ERRO_VALIDACAO', [{campo: 'nome'}], 'Salvar sem nome'],
        ['ERRO_VALIDACAO', [{campo: 'dadosVisiveis'}], 'Categoria sem permissões'],
        ['ERRO_VALIDACAO', null, 'Algo deu errado'],
        ['CODIGO_DESCONHECIDO', undefined, 'Algo deu errado']
    ])('mapeia erro da API %s para uma mensagem segura', async (codigo, detalhes, titulo) => {
        const erro = new Error('Detalhe privado')
        erro.codigo = codigo
        erro.detalhes = detalhes

        await render(
            <NewSupportCategoryScreen
                criarCategoria={jest.fn().mockRejectedValue(erro)}
            />
        )

        await enviar()
        expect(await screen.findByText(titulo)).toBeOnTheScreen()
        expect(screen.queryByText('Detalhe privado')).toBeNull()
    })

    test('usa alerta interno para validação local desconhecida', async () => {
        await render(
            <NewSupportCategoryScreen criarCategoria={jest.fn()} />
        )

        await act(async () => {
            mockFormularioProps.aoErroValidacao({codigo: 'DESCONHECIDO'})
        })

        expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen()
        await fireEvent.press(screen.getByRole('button', {name: 'Tentar novamente'}))
    })

    test.each([
        null,
        [],
        {},
        {...categoriaValida, id: null},
        {...categoriaValida, nome: null},
        {...categoriaValida, dadosVisiveis: null},
        {...categoriaValida, quantidadeContatos: 0.5}
    ])('rejeita resposta de categoria inválida: %p', async resposta => {
        await render(
            <NewSupportCategoryScreen
                criarCategoria={jest.fn().mockResolvedValue(resposta)}
            />
        )

        await enviar()
        expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen()
    })

    test('aceita identificador textual e protege criação simultânea e retorno', async () => {
        let resolver
        const criarCategoria = jest.fn(() => new Promise(resolve => {
            resolver = resolve
        }))
        const onVoltar = jest.fn()
        const onConcluido = jest.fn()
        const onCategoriaCriada = jest.fn(() => {
            throw new Error('Falha externa')
        })

        await render(
            <NewSupportCategoryScreen
                criarCategoria={criarCategoria}
                onVoltar={onVoltar}
                onConcluido={onConcluido}
                onCategoriaCriada={onCategoriaCriada}
            />
        )

        await act(async () => {
            mockFormularioProps.aoAlterar(null)
            mockFormularioProps.aoAlterar([])
            mockFormularioProps.aoAlterar({
                nome: 20,
                dadosVisiveis: ['geral.fase_atual', 10, 'geral.fase_atual']
            })
        })
        expect(mockFormularioProps.dados).toEqual({
            nome: '',
            dadosVisiveis: ['geral.fase_atual']
        })

        let primeiraCriacao
        await act(async () => {
            primeiraCriacao = mockFormularioProps.aoSalvar(dadosValidos)
            await Promise.resolve()
        })

        await act(async () => {
            await mockFormularioProps.aoSalvar(dadosValidos)
            mockModalErroProps.aoFechar()
        })
        await fireEvent.press(screen.getByRole('button', {name: 'Voltar'}))

        expect(criarCategoria).toHaveBeenCalledTimes(1)
        expect(onVoltar).not.toHaveBeenCalled()

        await act(async () => {
            resolver({...categoriaValida, id: 'categoria-10'})
            await primeiraCriacao
        })

        expect(onCategoriaCriada).toHaveBeenCalledTimes(1)
        expect(await screen.findByText('Categoria criada com sucesso')).toBeOnTheScreen()

        await fireEvent.press(screen.getByRole('button', {name: 'OK'}))
        expect(onConcluido).toHaveBeenCalledWith(
            expect.objectContaining({id: 'categoria-10'})
        )
    })

    test('não atualiza a tela desmontada após sucesso tardio', async () => {
        let resolver
        const criarCategoria = jest.fn(() => new Promise(resolve => {
            resolver = resolve
        }))
        const onCategoriaCriada = jest.fn()
        const {unmount} = await render(
            <NewSupportCategoryScreen
                criarCategoria={criarCategoria}
                onCategoriaCriada={onCategoriaCriada}
            />
        )

        let criacao
        await act(async () => {
            criacao = mockFormularioProps.aoSalvar(dadosValidos)
            await Promise.resolve()
        })
        await unmount()

        await act(async () => {
            resolver(categoriaValida)
            await criacao
        })
        expect(onCategoriaCriada).not.toHaveBeenCalled()
    })

    test('não atualiza a tela desmontada após erro tardio', async () => {
        let rejeitar
        const criarCategoria = jest.fn(() => new Promise((resolve, reject) => {
            rejeitar = reject
        }))
        const {unmount} = await render(
            <NewSupportCategoryScreen criarCategoria={criarCategoria} />
        )

        let criacao
        await act(async () => {
            criacao = mockFormularioProps.aoSalvar(dadosValidos)
            await Promise.resolve()
        })
        await unmount()

        await act(async () => {
            rejeitar(new Error('Falha tardia'))
            await criacao
        })
    })

    test('ignora salvamento direto quando o serviço está ausente', async () => {
        await render(<NewSupportCategoryScreen />)

        await act(async () => {
            await mockFormularioProps.aoSalvar(dadosValidos)
        })
        expect(mockFormularioProps.bloqueado).toBe(true)
    })
})
