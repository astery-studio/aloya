//Testa os estados de carregamento, erro e perfil inválido da tela.
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

jest.mock(
    'phosphor-react-native/src/icons/LockKey',
    () => ({
        LockKeyIcon:
            jest.fn(() => null)
    })
)

jest.mock(
    'phosphor-react-native/src/icons/WarningCircle',
    () => ({
        WarningCircleIcon:
            jest.fn(() => null)
    })
)

jest.mock(
    '../layouts/SettingsLayout/SettingsLayout',
    () => {
        const React = require('react')

        function SettingsLayout({
            children
        }) {
            return React.createElement(
                React.Fragment,
                null,
                children
            )
        }

        return {
            SettingsLayout
        }
    }
)

jest.mock(
    '../features/settings/profile/ProfileSettings',
    () => ({
        ProfileSettings:
            jest.fn(() => null)
    })
)

jest.mock(
    '../features/settings/profile/GenderSelector',
    () => ({
        GenderSelector:
            jest.fn(() => null)
    })
)

jest.mock(
    '../components/feedback/EditFieldSheet/EditFieldSheet',
    () => ({
        EditFieldSheet:
            jest.fn(() => null)
    })
)

jest.mock(
    '../features/settings/account/DeleteAccount',
    () => ({
        DeleteAccount:
            jest.fn(() => null)
    })
)

jest.mock(
    '../features/settings/account/LogoutConfirmation',
    () => ({
        LogoutConfirmation:
            jest.fn(() => null)
    })
)

jest.mock(
    '../components/feedback/Modal/SimpleModal',
    () => ({
        __esModule: true,
        default: jest.fn(() => null)
    })
)

import { ProfileSettingsScreen } from '../screens/settings/ProfileSettingsScreen'

const perfilValido = {
    id: 15,
    nome: 'Julia',
    email: 'julia@email.com',
    dataNascimento: '1999-04-08',
    identidadeGenero:
        'Mulher Cisgênero',
    atualizadoEm:
        '2026-09-23T10:00:00.000Z',
    consentimentoParentalNecessario:
        false
}

describe('ProfileSettingsScreen - estados da tela', () => {
    test('mostra o carregamento dos dados', async () => {
        await render(
            <ProfileSettingsScreen
                perfil={perfilValido}
                carregando
            />
        )

        expect(
            screen.getByText(
                'Carregando seus dados...'
            )
        ).toBeOnTheScreen()

        expect(
            screen.queryByText(
                'Ocorreu um erro'
            )
        ).toBeNull()
    })

    test('prioriza o carregamento quando também existe erro', async () => {
        await render(
            <ProfileSettingsScreen
                perfil={perfilValido}
                carregando
                erroCarregamento
            />
        )

        expect(
            screen.getByText(
                'Carregando seus dados...'
            )
        ).toBeOnTheScreen()

        expect(
            screen.queryByText(
                'Não foi possível carregar suas configurações de perfil. Tente novamente.'
            )
        ).toBeNull()
    })

    test('mostra o erro e permite recarregar', async () => {
        const onRecarregar = jest.fn()

        await render(
            <ProfileSettingsScreen
                perfil={perfilValido}
                erroCarregamento
                onRecarregar={
                    onRecarregar
                }
            />
        )

        expect(
            screen.getByRole('header', {
                name: 'Ocorreu um erro'
            })
        ).toBeOnTheScreen()

        expect(
            screen.getByRole('alert')
        ).toHaveTextContent(
            'Não foi possível carregar suas configurações de perfil. Tente novamente.'
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Tentar Novamente'
            })
        )

        expect(
            onRecarregar
        ).toHaveBeenCalledTimes(1)
    })

    test('não mostra recarregar sem receber a função', async () => {
        await render(
            <ProfileSettingsScreen
                perfil={perfilValido}
                erroCarregamento
            />
        )

        expect(
            screen.getByText(
                'Ocorreu um erro'
            )
        ).toBeOnTheScreen()

        expect(
            screen.queryByRole('button', {
                name: 'Tentar Novamente'
            })
        ).toBeNull()
    })

    test.each([
        [
            'perfil nulo',
            null
        ],
        [
            'valor que não é objeto',
            'perfil inválido'
        ],
        [
            'nome inválido',
            {
                ...perfilValido,
                nome: 123
            }
        ],
        [
            'e-mail inválido',
            {
                ...perfilValido,
                email: null
            }
        ],
        [
            'data de nascimento inválida',
            {
                ...perfilValido,
                dataNascimento: 19990408
            }
        ],
        [
            'identidade de gênero inválida',
            {
                ...perfilValido,
                identidadeGenero: 42
            }
        ]
    ])(
        'rejeita %s',
        async (
            descricao,
            perfil
        ) => {
            await render(
                <ProfileSettingsScreen
                    perfil={perfil}
                />
            )

            expect(
                screen.getByRole('header', {
                    name:
                        'Ocorreu um erro'
                })
            ).toBeOnTheScreen()

            expect(
                screen.getByRole('alert')
            ).toHaveTextContent(
                'Não foi possível carregar suas configurações de perfil. Tente novamente.'
            )
        }
    )
})