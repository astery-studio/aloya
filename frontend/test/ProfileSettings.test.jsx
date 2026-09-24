//Confere os campos, ações e estados do conteúdo das configurações de perfil.
import { fireEvent, render, screen } from '@testing-library/react-native'

jest.mock('../components/icons/AppIcons', () => ({
    LockKeyIcon: jest.fn(() => null)
}))

jest.mock('../features/settings/profile/ProfileField', () => {
    const React = require('react')
    const { Pressable, Text } = require('react-native')

    return {
        ProfileField: jest.fn(({label, valor, onPress, desabilitado}) => React.createElement(
            Pressable,
            {
                accessibilityRole: 'button',
                accessibilityLabel: label,
                onPress,
                disabled: desabilitado
            },
            React.createElement(Text, null, valor ?? 'Não informado')
        ))
    }
})

jest.mock('../components/common/NavigationField/NavigationField', () => {
    const React = require('react')
    const { Pressable, Text } = require('react-native')

    return {
        NavigationField: jest.fn(({label, onPress, desabilitado}) => React.createElement(
            Pressable,
            {
                accessibilityRole: 'button',
                accessibilityLabel: label,
                onPress,
                disabled: desabilitado
            },
            React.createElement(Text, null, label)
        ))
    }
})

jest.mock('../components/common/Button/ButtonScreen', () => {
    const React = require('react')
    const { Pressable, Text } = require('react-native')

    return {
        __esModule: true,
        default: jest.fn(({texto, aoPressionar, desativado, carregando}) => React.createElement(
            Pressable,
            {
                accessibilityRole: 'button',
                accessibilityLabel: texto,
                onPress: aoPressionar,
                disabled: desativado || carregando
            },
            React.createElement(Text, null, texto)
        ))
    }
})

import ButtonScreen from '../components/common/Button/ButtonScreen'
import { NavigationField } from '../components/common/NavigationField/NavigationField'
import { ProfileField } from '../features/settings/profile/ProfileField'
import { ProfileSettings } from '../features/settings/profile/ProfileSettings'

const dados = {
    nome: 'Julia',
    email: 'julia@email.com',
    dataNascimento: '1999-04-08',
    identidadeGenero: 'Mulher Cisgênero'
}

describe('ProfileSettings', () => {
    beforeEach(() => {
        ProfileField.mockClear()
        NavigationField.mockClear()
        ButtonScreen.mockClear()
    })

    test('mostra todos os dados pessoais', async () => {
        await render(<ProfileSettings dados={dados} onEditarCampo={jest.fn()} />)

        expect(screen.getByText('Dados Pessoais')).toBeOnTheScreen()
        expect(screen.getByText('Julia')).toBeOnTheScreen()
        expect(screen.getByText('julia@email.com')).toBeOnTheScreen()
        expect(screen.getByText('08/04/1999')).toBeOnTheScreen()
        expect(screen.getByText('Mulher Cisgênero')).toBeOnTheScreen()
    })

    test.each([
        ['Nome', 'nome'],
        ['E-mail', 'email'],
        ['Data de Nascimento', 'dataNascimento'],
        ['Identidade de Gênero', 'identidadeGenero']
    ])('informa o campo %s que deve ser editado', async (label, campo) => {
        const onEditarCampo = jest.fn()

        await render(<ProfileSettings dados={dados} onEditarCampo={onEditarCampo} />)
        fireEvent.press(screen.getByRole('button', { name: label }))

        expect(onEditarCampo).toHaveBeenCalledWith(campo)
    })

    test('abre a alteração de senha', async () => {
        const onAlterarSenha = jest.fn()

        await render(<ProfileSettings dados={dados} onAlterarSenha={onAlterarSenha} />)
        fireEvent.press(screen.getByRole('button', { name: 'Alterar Senha' }))

        expect(onAlterarSenha).toHaveBeenCalledTimes(1)
    })

    test('usa a variante verde no botão de salvar', async () => {
        await render(<ProfileSettings dados={dados} onSalvar={jest.fn()} podeSalvar />)

        expect(ButtonScreen.mock.calls[0][0].variante).toBe('verde')
    })

    test('desabilita o salvamento sem alterações', async () => {
        await render(<ProfileSettings dados={dados} onSalvar={jest.fn()} />)

        expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled()
    })

    test('permite salvar quando existem alterações', async () => {
        const onSalvar = jest.fn()

        await render(<ProfileSettings dados={dados} onSalvar={onSalvar} podeSalvar />)
        fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }))

        expect(onSalvar).toHaveBeenCalledTimes(1)
    })

    test('bloqueia todas as ações durante o salvamento', async () => {
        await render(
            <ProfileSettings
                dados={dados}
                onEditarCampo={jest.fn()}
                onAlterarSenha={jest.fn()}
                onSalvar={jest.fn()}
                podeSalvar
                salvando
            />
        )

        expect(screen.getByRole('button', { name: 'Nome' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Alterar Senha' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled()
    })

    test('trata data inválida como informação ausente', async () => {
        await render(<ProfileSettings dados={{...dados, dataNascimento: 'data-inválida'}} />)

        expect(screen.getByText('Não informado')).toBeOnTheScreen()
    })
})