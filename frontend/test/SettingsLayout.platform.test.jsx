import {Platform} from 'react-native'

jest.mock('../components/navigation/Header/Header', () => ({
    Header: jest.fn(() => null)
}))

import {SettingsLayout} from '../layouts/SettingsLayout/SettingsLayout'

const sistemaOriginal = Platform.OS

function obterElementosLayout(propriedades = {}) {
    const componente = SettingsLayout({
        titulo: 'Configurações de Perfil',
        onVoltar: jest.fn(),
        children: 'Conteúdo',
        ...propriedades
    })

    const [, areaInterativa] = componente.props.children
    const rolagem = areaInterativa.props.children

    return {
        areaInterativa,
        rolagem
    }
}

describe('SettingsLayout - plataformas', () => {
    afterEach(() => {
        Platform.OS = sistemaOriginal
    })

    test.each([
        {
            sistema: 'ios',
            comportamentoTeclado: 'padding',
            modoFechamento: 'interactive'
        },
        {
            sistema: 'android',
            comportamentoTeclado: 'height',
            modoFechamento: 'on-drag'
        }
    ])('configura teclado e rolagem no $sistema', ({
        sistema,
        comportamentoTeclado,
        modoFechamento
    }) => {
        Platform.OS = sistema

        const {
            areaInterativa,
            rolagem
        } = obterElementosLayout()

        expect(areaInterativa.props.behavior).toBe(
            comportamentoTeclado
        )

        expect(rolagem.props.keyboardDismissMode).toBe(
            modoFechamento
        )
    })

    test('não renderiza o rodapé quando recebe valor nulo', () => {
        const {
            rolagem
        } = obterElementosLayout({
            rodape: null
        })

        const [, rodape] = rolagem.props.children

        expect(rodape).toBeNull()
    })
})