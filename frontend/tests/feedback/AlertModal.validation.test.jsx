import {fireEvent, render, screen} from '@testing-library/react-native'

jest.mock('../../components/icons/AppIcons', () => ({
    LockKeyIcon: jest.fn(() => null),
    WarningCircleIcon: jest.fn(() => null)
}))

import AlertModal from '../../components/feedback/Modal/AlertModal/AlertModal'

describe('AlertModal - validação e bloqueio', () => {
    test('ignora o fechamento do sistema enquanto a ação está carregando', async () => {
        const aoFechar = jest.fn()

        await render(
            <AlertModal
                visivel
                aoFechar={aoFechar}
                titulo="Salvando dados"
                mensagem="Aguarde enquanto os dados são salvos."
                acaoPrincipal={{
                    texto: 'Salvar',
                    aoPressionar: jest.fn(),
                    carregando: true
                }}
            />
        )

        expect(screen.getByRole('button', {
            name: 'Salvar'
        })).toBeDisabled()

        await fireEvent(screen.root, 'requestClose')

        expect(aoFechar).not.toHaveBeenCalled()
    })

    test('rejeita uma variante desconhecida', () => {
        expect(() => AlertModal({
            variante: 'desconhecida',
            visivel: true,
            aoFechar: jest.fn(),
            titulo: 'Modal inválido'
        })).toThrow('Variante de AlertModal inválida: desconhecida')
    })
})