//Testa a entrada, as permissões, a validação e o envio do formulário.
import {Animated, View} from 'react-native'
import {fireEvent, render, screen} from '@testing-library/react-native'

import {SupportCategoryForm} from '../../features/support-network/components/SupportCategoryForm'

describe('SupportCategoryForm', () => {
    beforeEach(() => {
        jest.spyOn(Animated, 'timing').mockReturnValue({
            start: jest.fn(),
            stop: jest.fn()
        })
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('começa vazio e com o botão desativado', async () => {
        await render(
            <SupportCategoryForm
                dados={{
                    nome: '',
                    dadosVisiveis: []
                }}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
            />
        )

        expect(screen.getByLabelText('Nome da categoria')).toBeOnTheScreen()
        expect(screen.getByPlaceholderText('Parceiro(a)')).toBeOnTheScreen()
        expect(screen.getByRole('button', {name: 'Salvar'})).toBeDisabled()
    })

    test('sanitiza o nome antes de enviá-lo ao estado do formulário', async () => {
        const aoAlterar = jest.fn()

        await render(
            <SupportCategoryForm
                dados={{
                    nome: '',
                    dadosVisiveis: []
                }}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
            />
        )

        await fireEvent.changeText(
            screen.getByLabelText('Nome da categoria'),
            '<Família>\n'
        )

        expect(aoAlterar).toHaveBeenCalledWith({
            nome: 'Família'
        })
    })

    test('mantém outras permissões ao ativar uma permissão geral', async () => {
        const aoAlterar = jest.fn()

        await render(
            <SupportCategoryForm
                dados={{
                    nome: 'Família',
                    dadosVisiveis: ['ciclo.fluxo_menstrual']
                }}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
            />
        )

        await fireEvent.press(
            screen.getByRole('switch', {
                name: 'Acesso à Fase Atual'
            })
        )

        expect(aoAlterar).toHaveBeenCalledWith({
            dadosVisiveis: [
                'ciclo.fluxo_menstrual',
                'geral.fase_atual'
            ]
        })
    })

    test('mostra erro de nome sem apagar as permissões selecionadas', async () => {
        const aoSalvar = jest.fn()
        const aoErroValidacao = jest.fn()

        await render(
            <SupportCategoryForm
                dados={{
                    nome: '   ',
                    dadosVisiveis: ['geral.fase_atual']
                }}
                aoAlterar={jest.fn()}
                aoSalvar={aoSalvar}
                aoErroValidacao={aoErroValidacao}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar'
            })
        )

        expect(aoSalvar).not.toHaveBeenCalled()

        expect(aoErroValidacao).toHaveBeenCalledWith({
            codigo: 'NOME_CATEGORIA_OBRIGATORIO',
            titulo: 'Salvar sem nome',
            mensagem: 'Dê um nome para a categoria.'
        })
    })

    test('mostra erro quando o nome existe mas nenhuma permissão foi selecionada', async () => {
        const aoSalvar = jest.fn()
        const aoErroValidacao = jest.fn()

        await render(
            <SupportCategoryForm
                dados={{
                    nome: 'Família',
                    dadosVisiveis: []
                }}
                aoAlterar={jest.fn()}
                aoSalvar={aoSalvar}
                aoErroValidacao={aoErroValidacao}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar'
            })
        )

        expect(aoSalvar).not.toHaveBeenCalled()

        expect(aoErroValidacao).toHaveBeenCalledWith({
            codigo: 'PERMISSAO_CATEGORIA_OBRIGATORIA',
            titulo: 'Categoria sem permissões',
            mensagem: 'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.'
        })
    })

    test('normaliza o nome e envia os dados válidos', async () => {
        const aoSalvar = jest.fn()

        await render(
            <SupportCategoryForm
                dados={{
                    nome: '  Família   Próxima  ',
                    dadosVisiveis: ['geral.fase_atual']
                }}
                aoAlterar={jest.fn()}
                aoSalvar={aoSalvar}
                aoErroValidacao={jest.fn()}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar'
            })
        )

        expect(aoSalvar).toHaveBeenCalledTimes(1)

        expect(aoSalvar).toHaveBeenCalledWith({
            nome: 'Família Próxima',
            dadosVisiveis: ['geral.fase_atual']
        })
    })

    test('bloqueia todos os campos durante o carregamento', async () => {
        await render(
            <SupportCategoryForm
                dados={{
                    nome: 'Família',
                    dadosVisiveis: ['geral.fase_atual']
                }}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                carregando
            />
        )

        expect(screen.getByLabelText('Nome da categoria')).toHaveProp('editable', false)
        expect(screen.getByRole('switch', {name: 'Acesso à Fase Atual'})).toBeDisabled()

        expect(screen.getByRole('button', {name: 'Salvar'})).toHaveProp(
            'accessibilityState',
            {
                disabled: true,
                busy: true
            }
        )
    })

    test('fornece os controles para as futuras permissões de acesso', async () => {
        const renderizarPermissoesAcesso = jest.fn(() => (
            <View testID="permissoes-de-acesso" />
        ))

        await render(
            <SupportCategoryForm
                dados={{
                    nome: '',
                    dadosVisiveis: []
                }}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                renderizarPermissoesAcesso={renderizarPermissoesAcesso}
            />
        )

        expect(screen.getByTestId('permissoes-de-acesso')).toBeOnTheScreen()

        expect(renderizarPermissoesAcesso).toHaveBeenCalledWith(
            expect.objectContaining({
                permissoesSelecionadas: [],
                aoAlterar: expect.any(Function),
                desabilitado: false
            })
        )
    })
})