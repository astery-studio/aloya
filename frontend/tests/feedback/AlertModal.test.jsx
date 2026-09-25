//Testa o conteúdo, as ações e a confirmação por senha do AlertModal.
import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'

jest.mock('../../components/icons/AppIcons', () => ({
    LockKeyIcon: jest.fn(() => null),
    WarningCircleIcon: jest.fn(() => null)
}))

import AlertModal from '../../components/feedback/Modal/AlertModal/AlertModal'

function AlertModalComSenha({aoContinuar = jest.fn(), aoFechar = jest.fn(), carregando = false, erroSenha}) {
    const [senha, definirSenha] = useState('')

    return (
        <AlertModal
            variante="comSenha"
            visivel
            aoFechar={aoFechar}
            titulo="Confirme sua identidade"
            mensagem="Por segurança, insira sua senha atual para continuar com a exclusão da conta."
            senha={senha}
            aoAlterarSenha={definirSenha}
            erroSenha={erroSenha}
            acaoPrincipal={{ texto: 'Continuar', aoPressionar: aoContinuar, carregando }}
        />
    )
}

test('não mostra o conteúdo quando está oculto', async () => {
    await render(<AlertModal visivel={false} titulo="Erro" aoFechar={jest.fn()} />)

    expect(screen.queryByText('Erro')).toBeNull()
})

test('mostra título, mensagem e destaque', async () => {
    await render(
        <AlertModal visivel aoFechar={jest.fn()} titulo="Não foi possível salvar" mensagem="Confira os dados e tente novamente." destaque="Nenhuma alteração foi perdida." />
    )

    expect(screen.getByRole('header', { name: 'Não foi possível salvar' })).toBeOnTheScreen()
    expect(screen.getByText('Confira os dados e tente novamente.')).toBeOnTheScreen()
    expect(screen.getByText('Nenhuma alteração foi perdida.')).toBeOnTheScreen()
})

test('cria a ação Entendi quando recebe somente aoFechar', async () => {
    const aoFechar = jest.fn()

    await render(<AlertModal visivel aoFechar={aoFechar} titulo="Aviso" />)
    await fireEvent.press(screen.getByRole('button', { name: 'Entendi' }))

    expect(aoFechar).toHaveBeenCalledTimes(1)
})

test('executa as ações principal e secundária separadamente', async () => {
    const principal = jest.fn()
    const secundaria = jest.fn()

    await render(
        <AlertModal
            visivel
            aoFechar={jest.fn()}
            titulo="Excluir informação?"
            acaoPrincipal={{ texto: 'Excluir', aoPressionar: principal }}
            acaoSecundaria={{ texto: 'Cancelar', aoPressionar: secundaria }}
        />
    )

    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }))

    expect(principal).toHaveBeenCalledTimes(1)
    expect(secundaria).not.toHaveBeenCalled()

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }))

    expect(secundaria).toHaveBeenCalledTimes(1)
})

test('bloqueia ação que está carregando', async () => {
    const aoPressionar = jest.fn()

    await render(
        <AlertModal visivel aoFechar={jest.fn()} titulo="Aguarde" acaoPrincipal={{ texto: 'Confirmar', aoPressionar, carregando: true }} />
    )

    const botao = screen.getByRole('button', { name: 'Confirmar' })

    await fireEvent.press(botao)

    expect(aoPressionar).not.toHaveBeenCalled()
    expect(botao).toBeDisabled()
    expect(botao.props.accessibilityState.busy).toBe(true)
})

test('mostra o campo de senha e começa com Continuar desativado', async () => {
    await render(<AlertModalComSenha />)

    expect(screen.getByLabelText('Senha atual')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled()
})

test('ativa Continuar depois que a senha é preenchida', async () => {
    const aoContinuar = jest.fn()

    await render(<AlertModalComSenha aoContinuar={aoContinuar} />)

    await fireEvent.changeText(screen.getByLabelText('Senha atual'), 'Senha atual segura')
    const botaoContinuar = screen.getByRole('button', { name: 'Continuar' })

    expect(botaoContinuar).toBeEnabled()

    await fireEvent.press(botaoContinuar)

    expect(aoContinuar).toHaveBeenCalledTimes(1)
})

test('fecha a variante com senha pelo botão Cancelar', async () => {
    const aoFechar = jest.fn()

    await render(<AlertModalComSenha aoFechar={aoFechar} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }))

    expect(aoFechar).toHaveBeenCalledTimes(1)
})

test('mostra o erro devolvido pela API sem expor detalhes técnicos', async () => {
    await render(<AlertModalComSenha erroSenha="Senha atual incorreta." />)

    expect(screen.getByRole('alert')).toHaveTextContent('Senha atual incorreta.')
})

test('bloqueia o campo e os botões enquanto está carregando', async () => {
    await render(<AlertModalComSenha carregando />)

    expect(screen.getByLabelText('Senha atual')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
})

test('rejeita variante com senha sem ação principal', () => {
    expect(() => AlertModal({
        variante: 'comSenha',
        visivel: true,
        titulo: 'Confirme sua identidade',
        senha: '',
        aoAlterarSenha: jest.fn(),
        aoFechar: jest.fn()
    })).toThrow('AlertModal com senha precisa de uma ação principal')
})

test('rejeita variante com senha sem função para alterar a senha', () => {
    expect(() => AlertModal({
        variante: 'comSenha',
        visivel: true,
        titulo: 'Confirme sua identidade',
        senha: '',
        aoFechar: jest.fn(),
        acaoPrincipal: { texto: 'Continuar', aoPressionar: jest.fn() }
    })).toThrow('AlertModal com senha precisa da função aoAlterarSenha')
})

test('rejeita modal visível sem ação ou fechamento', () => {
    expect(() => AlertModal({
        visivel: true,
        titulo: 'Alerta inválido'
    })).toThrow('AlertModal precisa de pelo menos uma ação')
})