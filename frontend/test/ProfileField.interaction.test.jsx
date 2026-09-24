jest.mock('../components/icons/AppIcons', () => ({
    NotePencilIcon: jest.fn(() => null)
}))

import {ProfileField} from '../features/settings/profile/ProfileField'
import {estilos} from '../features/settings/profile/ProfileField.style'

describe('ProfileField - interação visual', () => {
    test('aplica o estilo pressionado durante o toque', () => {
        const componente = ProfileField({
            label: 'Nome',
            valor: 'Julia',
            onPress: jest.fn()
        })

        const calcularEstilo = componente.props.style
        const estiloPressionado = calcularEstilo({
            pressed: true
        })
        const estiloNormal = calcularEstilo({
            pressed: false
        })

        expect(estiloPressionado).toContain(estilos.pressionado)
        expect(estiloNormal).not.toContain(estilos.pressionado)
    })

    test('não aplica o estilo pressionado quando está desabilitado', () => {
        const componente = ProfileField({
            label: 'Nome',
            valor: 'Julia',
            onPress: jest.fn(),
            desabilitado: true
        })

        const estiloPressionado = componente.props.style({
            pressed: true
        })

        expect(estiloPressionado).not.toContain(estilos.pressionado)
        expect(estiloPressionado).toContain(estilos.desabilitado)
    })
})