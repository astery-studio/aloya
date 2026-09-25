//Testa validações, chamada da API e avisos da tela de alteração de senha.
import { fireEvent, render, screen } from '@testing-library/react-native'

jest.mock('../../components/icons/AppIcons', () => ({
    LockKeyIcon: jest.fn(() => null),
    WarningCircleIcon: jest.fn(() => null)
}))

jest.mock('../../layouts/SettingsLayout/SettingsLayout', () => {
    const React = require('react')
    const { Text, View } = require('react-native')

    return {
        SettingsLayout: ({titulo, children}) => React.createElement(
            View,
            null,
            React.createElement(Text, null, titulo),
            children
        )
    }
})

import { ChangePasswordScreen } from '../../screens/settings/ChangePasswordScreen'

//Preenche os campos aguardando cada atualização do React terminar.
async function preencherFormulario() {
    await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'Senha atual segura!')
    await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'Nova frase segura 2026!')
    await fireEvent.changeText(screen.getByLabelText('Confirmar nova senha'), 'Nova frase segura 2026!')
}

describe('ChangePasswordScreen', () => {
    test('mostra a tela e os três campos', async () => {
        await render(<ChangePasswordScreen alterarSenha={jest.fn()} />)

        expect(screen.getByText('Alterar Senha')).toBeOnTheScreen()
        expect(screen.getByLabelText('Senha atual')).toBeOnTheScreen()
        expect(screen.getByLabelText('Nova senha')).toBeOnTheScreen()
        expect(screen.getByLabelText('Confirmar nova senha')).toBeOnTheScreen()
    })

    test('envia somente os três campos permitidos', async () => {
        const alterarSenha = jest.fn().mockResolvedValue({
            mensagem: 'Senha atualizada com sucesso.'
        })

        await render(<ChangePasswordScreen alterarSenha={alterarSenha} />)
        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar senha'}))

        expect(alterarSenha).toHaveBeenCalledWith({
            senhaAtual: 'Senha atual segura!',
            novaSenha: 'Nova frase segura 2026!',
            confirmacaoNovaSenha: 'Nova frase segura 2026!'
        })

        expect(screen.getByText('Senha atualizada com sucesso')).toBeOnTheScreen()
    })

    test('rejeita confirmação diferente sem acessar a API', async () => {
        const alterarSenha = jest.fn()

        await render(<ChangePasswordScreen alterarSenha={alterarSenha} />)

        await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'Senha atual segura!')
        await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'Nova frase segura 2026!')
        await fireEvent.changeText(screen.getByLabelText('Confirmar nova senha'), 'Outra frase segura 2026!')
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar senha'}))

        expect(alterarSenha).not.toHaveBeenCalled()
        expect(screen.getByText('As senhas não coincidem.')).toBeOnTheScreen()
    })

    test('rejeita senha curta sem acessar a API', async () => {
        const alterarSenha = jest.fn()

        await render(<ChangePasswordScreen alterarSenha={alterarSenha} />)

        await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'Senha atual segura!')
        await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'curta7')
        await fireEvent.changeText(screen.getByLabelText('Confirmar nova senha'), 'curta7')
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar senha'}))

        expect(alterarSenha).not.toHaveBeenCalled()
        expect(screen.getByText('A nova senha deve ter pelo menos 8 caracteres.')).toBeOnTheScreen()
    })

    test('aceita senha com exatamente oito caracteres', async () => {
        const alterarSenha = jest.fn().mockResolvedValue({
            mensagem: 'Senha atualizada com sucesso.'
        })

        await render(<ChangePasswordScreen alterarSenha={alterarSenha} />)

        await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'Senha antiga segura!')
        await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'Nova@123')
        await fireEvent.changeText(screen.getByLabelText('Confirmar nova senha'), 'Nova@123')
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar senha'}))

        expect(alterarSenha).toHaveBeenCalledWith({
            senhaAtual: 'Senha antiga segura!',
            novaSenha: 'Nova@123',
            confirmacaoNovaSenha: 'Nova@123'
        })
    })

    test('mostra credenciais incorretas e limpa somente a senha atual', async () => {
        const erro = new Error('Detalhe interno')
        erro.codigo = 'SENHA_ATUAL_INCORRETA'

        const alterarSenha = jest.fn().mockRejectedValue(erro)

        await render(<ChangePasswordScreen alterarSenha={alterarSenha} />)
        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar senha'}))

        expect(screen.getByText('Senha incorreta. Verifique os dados e tente novamente.')).toBeOnTheScreen()
        expect(screen.getByLabelText('Senha atual')).toHaveProp('value', '')
        expect(screen.getByLabelText('Nova senha')).toHaveProp('value', 'Nova frase segura 2026!')
    })

    test('mostra erro seguro sem revelar detalhes internos', async () => {
        const alterarSenha = jest.fn().mockRejectedValue(
            new Error('Banco indisponível na porta interna')
        )

        await render(<ChangePasswordScreen alterarSenha={alterarSenha} />)
        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar senha'}))

        expect(screen.getByText('Ocorreu um erro ao alterar a senha. Verifique sua conexão e tente novamente.')).toBeOnTheScreen()
        expect(screen.queryByText('Banco indisponível na porta interna')).toBeNull()
    })

    test('conclui o fluxo ao confirmar o sucesso', async () => {
        const onConcluido = jest.fn()
        const alterarSenha = jest.fn().mockResolvedValue({
            mensagem: 'Senha atualizada com sucesso.'
        })

        await render(<ChangePasswordScreen alterarSenha={alterarSenha} onConcluido={onConcluido} />)
        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar senha'}))
        await fireEvent.press(screen.getByRole('button', {name: 'OK'}))

        expect(onConcluido).toHaveBeenCalledTimes(1)
    })

    test('encerra o fluxo quando a sessão está inválida', async () => {
        const erro = new Error('Sessão inválida')
        erro.codigo = 'SESSAO_INVALIDA'

        const onSessaoExpirada = jest.fn()
        const alterarSenha = jest.fn().mockRejectedValue(erro)

        await render(<ChangePasswordScreen alterarSenha={alterarSenha} onSessaoExpirada={onSessaoExpirada} />)
        await preencherFormulario()
        await fireEvent.press(screen.getByRole('button', {name: 'Salvar senha'}))

        expect(onSessaoExpirada).toHaveBeenCalledTimes(1)
        expect(screen.queryByText('Sessão inválida')).toBeNull()
    })
})