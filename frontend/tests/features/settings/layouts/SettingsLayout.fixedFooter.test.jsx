//Confirma que o rodapé fixo permanece fora da área rolável do layout.
import {render, screen, within} from '@testing-library/react-native'
import {Text} from 'react-native'

import {SettingsLayout} from '../../../../src/features/settings/layouts/SettingsLayout/SettingsLayout'

describe('SettingsLayout com rodapé fixo', () => {
    test('mantém o rodapé fora da rolagem', async () => {
        await render(
            <SettingsLayout
                titulo="Nova Categoria"
                rodapeFixo
                rodape={<Text>Salvar categoria</Text>}
            >
                <Text>Campos da categoria</Text>
            </SettingsLayout>
        )

        const rolagem = screen.getByTestId('rolagem-settings-layout')

        expect(
            within(rolagem).getByText('Campos da categoria')
        ).toBeOnTheScreen()
        expect(
            within(rolagem).queryByText('Salvar categoria')
        ).toBeNull()
        expect(
            screen.getByTestId('rodape-fixo-settings-layout')
        ).toBeOnTheScreen()
        expect(screen.getByText('Salvar categoria')).toBeOnTheScreen()
    })

    test('preserva o rodapé rolável usado pelas telas existentes', async () => {
        await render(
            <SettingsLayout
                titulo="Configurações"
                rodape={<Text>Ação existente</Text>}
            >
                <Text>Conteúdo existente</Text>
            </SettingsLayout>
        )

        expect(
            within(screen.getByTestId('rolagem-settings-layout'))
                .getByText('Ação existente')
        ).toBeOnTheScreen()
        expect(
            screen.queryByTestId('rodape-fixo-settings-layout')
        ).toBeNull()
    })
})
