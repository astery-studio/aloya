//Cobre validações e proteções internas do formulário de categoria.
import {act, render} from '@testing-library/react-native'

let mockEntradaProps
let mockGeraisProps
let mockGruposProps
let mockBotaoProps

jest.mock('../../../../src/shared/components/forms/TextInput', () => {
    const React = require('react')
    const {View} = require('react-native')

    return function TextInputFalso(props) {
        mockEntradaProps = props
        return React.createElement(View, {testID: 'entrada-falsa'})
    }
})

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen', () => {
    const React = require('react')
    const {View} = require('react-native')

    return function BotaoFalso(props) {
        mockBotaoProps = props
        return React.createElement(View, {testID: 'botao-falso'})
    }
})

jest.mock('../../../../src/features/support-network/components/GeneralPermissions', () => {
    const React = require('react')
    const {View} = require('react-native')

    return {
        GeneralPermissions: props => {
            mockGeraisProps = props
            return React.createElement(View, {testID: 'gerais-falsas'})
        }
    }
})

jest.mock('../../../../src/features/support-network/components/PermissionGroups', () => {
    const React = require('react')
    const {View} = require('react-native')

    return {
        PermissionGroups: props => {
            mockGruposProps = props
            return React.createElement(View, {testID: 'grupos-falsos'})
        }
    }
})

import {SupportCategoryForm} from '../../../../src/features/support-network/components/SupportCategoryForm'

describe('SupportCategoryForm - proteções internas', () => {
    test('normaliza dados ausentes e bloqueia ações sem callbacks', async () => {
        await render(<SupportCategoryForm />)

        expect(mockEntradaProps.value).toBe('')
        expect(mockGeraisProps.permissoesSelecionadas).toEqual([])
        expect(mockGruposProps.permissoesSelecionadas).toEqual([])
        expect(mockBotaoProps.desativado).toBe(true)

        await act(async () => {
            mockEntradaProps.onChangeText('Ignorado')
            mockGeraisProps.aoAlterar('geral.fase_atual', true)
            mockGruposProps.aoAlterar(['ciclo.fluxo_menstrual'])
        })
    })

    test('permite ocultar a ação quando o botão é exibido no rodapé da tela', async () => {
        const {queryByTestId} = await render(
            <SupportCategoryForm
                dados={{nome: 'Família', dadosVisiveis: ['geral.fase_atual']}}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                exibirAcao={false}
            />
        )

        expect(queryByTestId('botao-falso')).toBeNull()
    })

    test('sanitiza nome e encaminha somente alterações permitidas', async () => {
        const aoAlterar = jest.fn()

        await render(
            <SupportCategoryForm
                dados={{
                    nome: 'Família',
                    dadosVisiveis: [
                        'geral.fase_atual',
                        'geral.fase_atual',
                        10
                    ]
                }}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
            />
        )

        expect(mockEntradaProps.sanitizar('<Nome>\n'.padEnd(100, 'a')))
            .toHaveLength(80)
        expect(mockEntradaProps.sanitizar('<Nome>')).toBe('Nome')

        await act(async () => {
            mockEntradaProps.onChangeText('Novo nome')
            mockGeraisProps.aoAlterar('geral.fase_atual', false)
            mockGeraisProps.aoAlterar('geral.dicas', true)
            mockGruposProps.aoAlterar([
                'ciclo.fluxo_menstrual',
                'ciclo.fluxo_menstrual',
                null
            ])
            mockGruposProps.aoAlterar(null)
        })

        expect(aoAlterar).toHaveBeenCalledWith({nome: 'Novo nome'})
        expect(aoAlterar).toHaveBeenCalledWith({dadosVisiveis: []})
        expect(aoAlterar).toHaveBeenCalledWith({
            dadosVisiveis: ['geral.fase_atual', 'geral.dicas']
        })
        expect(aoAlterar).toHaveBeenCalledWith({
            dadosVisiveis: ['ciclo.fluxo_menstrual']
        })
    })

    test('ignora mudanças enquanto está carregando ou bloqueado', async () => {
        const aoAlterar = jest.fn()
        const {rerender} = await render(
            <SupportCategoryForm
                dados={{nome: 'Família', dadosVisiveis: ['geral.fase_atual']}}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
                carregando
            />
        )

        await act(async () => {
            mockEntradaProps.onChangeText('Outro')
            mockGeraisProps.aoAlterar('geral.dicas', true)
            mockGruposProps.aoAlterar(['ciclo.fluxo_menstrual'])
        })
        expect(aoAlterar).not.toHaveBeenCalled()

        await rerender(
            <SupportCategoryForm
                dados={{nome: 'Família', dadosVisiveis: ['geral.fase_atual']}}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
                bloqueado
            />
        )
        expect(mockEntradaProps.desativado).toBe(true)
        expect(mockBotaoProps.desativado).toBe(true)
    })

    test('valida nome, permissões e envia dados normalizados', async () => {
        const aoErroValidacao = jest.fn()
        const aoSalvar = jest.fn()
        const {rerender} = await render(
            <SupportCategoryForm
                dados={{nome: '   ', dadosVisiveis: ['geral.fase_atual']}}
                aoAlterar={jest.fn()}
                aoSalvar={aoSalvar}
                aoErroValidacao={aoErroValidacao}
            />
        )

        await act(async () => mockBotaoProps.aoPressionar())
        expect(aoErroValidacao).toHaveBeenLastCalledWith(
            expect.objectContaining({codigo: 'NOME_CATEGORIA_OBRIGATORIO'})
        )

        await rerender(
            <SupportCategoryForm
                dados={{nome: 'Família', dadosVisiveis: []}}
                aoAlterar={jest.fn()}
                aoSalvar={aoSalvar}
                aoErroValidacao={aoErroValidacao}
            />
        )
        await act(async () => mockBotaoProps.aoPressionar())
        expect(aoErroValidacao).toHaveBeenLastCalledWith(
            expect.objectContaining({codigo: 'PERMISSAO_CATEGORIA_OBRIGATORIA'})
        )

        await rerender(
            <SupportCategoryForm
                dados={{
                    nome: '  Família   Próxima  ',
                    dadosVisiveis: ['geral.fase_atual']
                }}
                aoAlterar={jest.fn()}
                aoSalvar={aoSalvar}
            />
        )
        await act(async () => mockBotaoProps.aoPressionar())
        expect(aoSalvar).toHaveBeenCalledWith({
            nome: 'Família Próxima',
            dadosVisiveis: ['geral.fase_atual']
        })
    })
})
