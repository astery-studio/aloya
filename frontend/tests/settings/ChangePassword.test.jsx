//Testa campos, preenchimento, carregamento e acionamento do formulário de senha.
import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'

import { ChangePassword } from '../../features/settings/security/ChangePassword'

function FormularioTeste({onSalvar = jest.fn(), carregando = false}) {
    const [senhaAtual, setSenhaAtual] = useState('')
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('')

    return (
        <ChangePassword
            senhaAtual={senhaAtual}
            novaSenha={novaSenha}
            confirmacaoNovaSenha={confirmacaoNovaSenha}
            onAlterarSenhaAtual={setSenhaAtual}
            onAlterarNovaSenha={setNovaSenha}
            onAlterarConfirmacao={setConfirmacaoNovaSenha}
            onSalvar={onSalvar}
            carregando={carregando}
        />
    )
}

//Preenche os três campos aguardando cada atualização do React terminar.
async function preencherFormulario() {
    await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'Senha atual segura!')
    await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'Nova frase segura 2026!')
    await fireEvent.changeText(screen.getByLabelText('Confirmar nova senha'), 'Nova frase segura 2026!')
}

describe('ChangePassword', () => {
    test('mostra os três campos de senha', async () => {
        await render(<FormularioTeste />)

        expect(screen.getByLabelText('Senha atual')).toBeOnTheScreen()
        expect(screen.getByLabelText('Nova senha')).toBeOnTheScreen()
        expect(screen.getByLabelText('Confirmar nova senha')).toBeOnTheScreen()
    })

    test('começa com o botão desativado', async () => {
        await render(<FormularioTeste />)

        expect(screen.getByRole('button', {name: 'Salvar senha'})).toBeDisabled()
    })

    test('continua desativado enquanto falta algum campo', async () => {
        await render(<FormularioTeste />)

        await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'Senha atual segura!')
        await fireEvent.changeText(screen.getByLabelText('Nova senha'), 'Nova frase segura 2026!')

        expect(screen.getByRole('button', {name: 'Salvar senha'})).toBeDisabled()
    })

    test('ativa e executa o botão quando todos os campos estão preenchidos', async () => {
        const onSalvar = jest.fn()

        await render(<FormularioTeste onSalvar={onSalvar} />)
        await preencherFormulario()

        const botao = screen.getByRole('button', {name: 'Salvar senha'})

        expect(botao).toBeEnabled()

        await fireEvent.press(botao)

        expect(onSalvar).toHaveBeenCalledTimes(1)
    })

    test('envia pelo teclado quando todos os campos estão preenchidos', async () => {
        const onSalvar = jest.fn()

        await render(<FormularioTeste onSalvar={onSalvar} />)
        await preencherFormulario()
        await fireEvent(screen.getByLabelText('Confirmar nova senha'), 'submitEditing')

        expect(onSalvar).toHaveBeenCalledTimes(1)
    })

    test('bloqueia os campos e o botão durante o carregamento', async () => {
        await render(<FormularioTeste carregando />)

        expect(screen.getByLabelText('Senha atual')).toBeDisabled()
        expect(screen.getByLabelText('Nova senha')).toBeDisabled()
        expect(screen.getByLabelText('Confirmar nova senha')).toBeDisabled()
        expect(screen.getByRole('button', {name: 'Salvar senha'})).toBeDisabled()
    })

    test('não permite salvar quando a ação não foi fornecida', async () => {
        await render(
            <ChangePassword
                senhaAtual="Senha atual segura!"
                novaSenha="Nova frase segura 2026!"
                confirmacaoNovaSenha="Nova frase segura 2026!"
                onAlterarSenhaAtual={jest.fn()}
                onAlterarNovaSenha={jest.fn()}
                onAlterarConfirmacao={jest.fn()}
            />
        )

        expect(screen.getByRole('button', {name: 'Salvar senha'})).toBeDisabled()
    })
})