//Testa validações, integração, erros, sucesso e proteção contra envio repetido da nova categoria.
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native'

jest.mock('../../components/icons/AppIcons', () => {
    const React = require('react')
    const {View} = require('react-native')
    const criarIcone = nome => function IconeFalso({testID}) {
        return React.createElement(View, {testID, accessibilityLabel: nome})
    }

    return {
        ArrowLeftIcon: criarIcone('ArrowLeftIcon'),
        BellIcon: criarIcone('BellIcon'),
        CaretDownIcon: criarIcone('CaretDownIcon'),
        CaretUpIcon: criarIcone('CaretUpIcon'),
        DropIcon: criarIcone('DropIcon'),
        FirstAidKitIcon: criarIcone('FirstAidKitIcon'),
        HeartIcon: criarIcone('HeartIcon'),
        LightningIcon: criarIcone('LightningIcon'),
        PersonArmsSpreadIcon: criarIcone('PersonArmsSpreadIcon'),
        UsersIcon: criarIcone('UsersIcon'),
        WarningCircleIcon: criarIcone('WarningCircleIcon')
    }
})

jest.mock('../../layouts/SettingsLayout/SettingsLayout', () => {
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

import {NewSupportCategoryScreen} from '../../screens/support-network/NewSupportCategoryScreen'

const categoriaCriada = {
    id: 10,
    nome: 'Família',
    dadosVisiveis: ['geral.fase_atual'],
    quantidadeContatos: 0,
    criadoEm: '2026-09-25T10:00:00.000Z',
    atualizadoEm: '2026-09-25T10:00:00.000Z'
}

//Preenche um nome e seleciona uma permissão antes de salvar.
async function preencherFormulario() {
    await fireEvent.changeText(screen.getByLabelText('Nome da categoria'), 'Família')
    await fireEvent.press(screen.getByRole('switch', {name: 'Acesso à Fase Atual'}))
}

describe('NewSupportCategoryScreen', () => {
    test('mostra o formulário completo', async () => {
        await render(<NewSupportCategoryScreen criarCategoria={jest.fn()} />)

        expect(screen.getByText('Nova Categoria')).toBeOnTheScreen()
        expect(screen.getByLabelText('Nome da categoria')).toBeOnTheScreen()
        expect(screen.getByText('Permissões Gerais')).toBeOnTheScreen()
        expect(screen.getByText('Permissões de Acesso')).toBeOnTheScreen()
    })

    test('cria a categoria com os dados preenchidos', async () => {
        const criarCategoria = jest.fn().mockResolvedValue(categoriaCriada)

        await render(<NewSupportCategoryScreen criarCategoria={criarCategoria} />)
        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar'}))

        await waitFor(() => {
            expect(criarCategoria).toHaveBeenCalledWith({
                nome: 'Família',
                dadosVisiveis: ['geral.fase_atual']
            })
        })

        expect(await screen.findByText('Categoria criada com sucesso')).toBeOnTheScreen()
    })

    test('mostra o aviso quando o nome está vazio', async () => {
        const criarCategoria = jest.fn()

        await render(<NewSupportCategoryScreen criarCategoria={criarCategoria} />)
        await fireEvent.press(screen.getByRole('switch', {name: 'Acesso à Fase Atual'}))
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar'}))

        expect(await screen.findByText('Salvar sem nome')).toBeOnTheScreen()
        expect(screen.getByText('Dê um nome para a categoria.')).toBeOnTheScreen()
        expect(criarCategoria).not.toHaveBeenCalled()
    })

    test('mostra o aviso quando nenhuma permissão foi selecionada', async () => {
        const criarCategoria = jest.fn()

        await render(<NewSupportCategoryScreen criarCategoria={criarCategoria} />)
        await fireEvent.changeText(screen.getByLabelText('Nome da categoria'), 'Família')
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar'}))

        expect(await screen.findByText('Categoria sem permissões')).toBeOnTheScreen()
        expect(screen.getByText('Selecione ao menos um tipo de dado que esta categoria poderá visualizar.')).toBeOnTheScreen()
        expect(criarCategoria).not.toHaveBeenCalled()
    })

    test('mostra o aviso específico para nome repetido', async () => {
        const erro = new Error('Detalhe não exibido')
        erro.codigo = 'CATEGORIA_NOME_DUPLICADO'

        await render(
            <NewSupportCategoryScreen
                criarCategoria={jest.fn().mockRejectedValue(erro)}
            />
        )

        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar'}))

        expect(await screen.findByText('Categoria existente')).toBeOnTheScreen()
        expect(screen.getByText('Você já tem uma categoria com esse nome.')).toBeOnTheScreen()
        expect(screen.queryByText('Detalhe não exibido')).toBeNull()
    })

    test('mantém os dados e esconde detalhes internos quando ocorre erro', async () => {
        const erro = new Error('Falha privada do banco de dados')

        await render(
            <NewSupportCategoryScreen
                criarCategoria={jest.fn().mockRejectedValue(erro)}
            />
        )

        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar'}))

        expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen()
        expect(screen.getByText('Ocorreu um erro ao criar sua categoria. Verifique sua conexão e tente novamente.')).toBeOnTheScreen()
        expect(screen.getByLabelText('Nome da categoria')).toHaveProp('value', 'Família')
        expect(screen.queryByText('Falha privada do banco de dados')).toBeNull()
    })

    test('permite tentar novamente depois de um erro interno', async () => {
        const criarCategoria = jest.fn()
            .mockRejectedValueOnce(new Error('Falha temporária'))
            .mockResolvedValueOnce(categoriaCriada)

        await render(<NewSupportCategoryScreen criarCategoria={criarCategoria} />)

        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar'}))
        await screen.findByText('Algo deu errado')
        await fireEvent.press(screen.getByRole('button', {name: 'Tentar novamente'}))

        expect(await screen.findByText('Categoria criada com sucesso')).toBeOnTheScreen()
        expect(criarCategoria).toHaveBeenCalledTimes(2)
    })

    test('informa a criação e conclui o fluxo pelo botão OK', async () => {
        const onCategoriaCriada = jest.fn()
        const onConcluido = jest.fn()

        await render(
            <NewSupportCategoryScreen
                criarCategoria={jest.fn().mockResolvedValue(categoriaCriada)}
                onCategoriaCriada={onCategoriaCriada}
                onConcluido={onConcluido}
            />
        )

        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar'}))
        await screen.findByText('Categoria criada com sucesso')

        expect(onCategoriaCriada).toHaveBeenCalledWith(categoriaCriada)

        await fireEvent.press(screen.getByRole('button', {name: 'OK'}))

        expect(onConcluido).toHaveBeenCalledWith(categoriaCriada)
    })

    test('encerra o fluxo quando a sessão está inválida', async () => {
        const erro = new Error('Informação privada')
        erro.codigo = 'SESSAO_INVALIDA'
        const onSessaoExpirada = jest.fn()

        await render(
            <NewSupportCategoryScreen
                criarCategoria={jest.fn().mockRejectedValue(erro)}
                onSessaoExpirada={onSessaoExpirada}
            />
        )

        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar'}))

        await waitFor(() => {
            expect(onSessaoExpirada).toHaveBeenCalledTimes(1)
        })

        expect(screen.queryByText('Informação privada')).toBeNull()
        expect(screen.queryByText('Algo deu errado')).toBeNull()
    })

    test('bloqueia o formulário quando o serviço não foi fornecido', async () => {
        await render(<NewSupportCategoryScreen />)

        expect(screen.getByLabelText('Nome da categoria')).toHaveProp('editable', false)
        expect(screen.getByRole('button', {name: 'Salvar'})).toBeDisabled()
    })
})