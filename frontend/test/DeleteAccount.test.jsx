//Testa a validação da senha antes da confirmação e da exclusão da conta.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'

jest.mock('phosphor-react-native/src/icons/WarningCircle', () => ({
    WarningCircleIcon: jest.fn(() => null)
}))

jest.mock('phosphor-react-native/src/icons/LockKey', () => ({
    LockKeyIcon: jest.fn(() => null)
}))

import { DeleteAccount } from '../features/settings/account/DeleteAccount'

test('senha incorreta permanece no primeiro modal', async () => {
    const erro = new Error('Senha incorreta')
    erro.codigo = 'SENHA_ATUAL_INCORRETA'

    const confirmarSenhaExclusao = jest.fn().mockRejectedValue(erro)
    const excluirConta = jest.fn()

    await render(
        <DeleteAccount
            visivel
            onFechar={jest.fn()}
            confirmarSenhaExclusao={confirmarSenhaExclusao}
            excluirConta={excluirConta}
            onContaExcluida={jest.fn()}
        />
    )

    await fireEvent.changeText(
        screen.getByLabelText('Senha atual'),
        'senha errada'
    )

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Continuar'
        })
    )

    await waitFor(() => {
        expect(
            screen.getByText('A senha atual está incorreta.')
        ).toBeOnTheScreen()
    })

    expect(
        screen.queryByText('Excluir conta permanentemente?')
    ).toBeNull()

    expect(excluirConta).not.toHaveBeenCalled()
})

test('senha correta abre a confirmação antes da exclusão', async () => {
    const confirmarSenhaExclusao = jest.fn().mockResolvedValue(true)
    const excluirConta = jest.fn().mockResolvedValue({
        mensagem: 'Conta excluída.'
    })

    await render(
        <DeleteAccount
            visivel
            onFechar={jest.fn()}
            confirmarSenhaExclusao={confirmarSenhaExclusao}
            excluirConta={excluirConta}
            onContaExcluida={jest.fn()}
        />
    )

    await fireEvent.changeText(
        screen.getByLabelText('Senha atual'),
        'senha correta'
    )

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Continuar'
        })
    )

    await waitFor(() => {
        expect(
            screen.getByText('Excluir conta permanentemente?')
        ).toBeOnTheScreen()
    })

    expect(excluirConta).not.toHaveBeenCalled()

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Excluir permanentemente'
        })
    )

    await waitFor(() => {
        expect(excluirConta).toHaveBeenCalledWith({
            senhaAtual: 'senha correta'
        })
    })
})