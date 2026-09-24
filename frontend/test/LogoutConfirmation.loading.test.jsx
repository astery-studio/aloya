jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn()
}))

jest.mock('../components/icons/AppIcons', () => ({
    WarningCircleIcon: jest.fn(() => null)
}))

import {useState} from 'react'
import {LogoutConfirmation} from '../features/settings/account/LogoutConfirmation'

describe('LogoutConfirmation - bloqueio de fechamento', () => {
    beforeEach(() => {
        useState.mockReset()
    })

    test('ignora o fechamento enquanto encerra a sessão', () => {
        const setCarregando = jest.fn()
        const setErroVisivel = jest.fn()
        const onFechar = jest.fn()

        useState
            .mockReturnValueOnce([true, setCarregando])
            .mockReturnValueOnce([false, setErroVisivel])

        const componente = LogoutConfirmation({
            visivel: true,
            onFechar,
            encerrarSessao: jest.fn(),
            onSessaoEncerrada: jest.fn()
        })

        const [modalConfirmacao] = componente.props.children

        expect(modalConfirmacao.props.aoFechar).not.toBe(onFechar)

        expect(() => {
            modalConfirmacao.props.aoFechar()
        }).not.toThrow()

        expect(onFechar).not.toHaveBeenCalled()
    })

    test('fecha o aviso de erro pela ação do sistema', () => {
        const setCarregando = jest.fn()
        const setErroVisivel = jest.fn()

        useState
            .mockReturnValueOnce([false, setCarregando])
            .mockReturnValueOnce([true, setErroVisivel])

        const componente = LogoutConfirmation({
            visivel: true,
            onFechar: jest.fn(),
            encerrarSessao: jest.fn(),
            onSessaoEncerrada: jest.fn()
        })

        const [, modalErro] = componente.props.children

        modalErro.props.aoFechar()

        expect(setErroVisivel).toHaveBeenCalledTimes(1)
        expect(setErroVisivel).toHaveBeenCalledWith(false)
    })
})