//Confere a apresentação, interação e acessibilidade do campo editável de perfil.
import {
    fireEvent,
    render,
    screen
} from '@testing-library/react-native'

jest.mock(
    '../components/icons/AppIcons',
    () => ({
        NotePencilIcon:
            jest.fn(() => null)
    })
)

import {
    NotePencilIcon
} from '../components/icons/AppIcons'

import {
    ProfileField
} from '../features/settings/profile/ProfileField'

import {
    corIconeEditar
} from '../features/settings/profile/ProfileField.style'

describe('ProfileField', () => {
    beforeEach(() => {
        NotePencilIcon.mockClear()
    })

    test('mostra o nome e o valor do campo', async () => {
        await render(
            <ProfileField
                label="Nome"
                valor="Julia"
                onPress={jest.fn()}
            />
        )

        expect(
            screen.getByText('Nome')
        ).toBeOnTheScreen()

        expect(
            screen.getByText('Julia')
        ).toBeOnTheScreen()
    })

    test('executa a edição ao pressionar o campo', async () => {
        const onPress = jest.fn()

        await render(
            <ProfileField
                label="E-mail"
                valor="julia@email.com"
                onPress={onPress}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Editar E-mail'
            })
        )

        expect(
            onPress
        ).toHaveBeenCalledTimes(1)
    })

    test('mostra valor alternativo quando a informação é nula', async () => {
        await render(
            <ProfileField
                label="Identidade de Gênero"
                valor={null}
                onPress={jest.fn()}
            />
        )

        expect(
            screen.getByText(
                'Não informado'
            )
        ).toBeOnTheScreen()
    })

    test('mostra valor alternativo quando recebe somente espaços', async () => {
        await render(
            <ProfileField
                label="Nome"
                valor="   "
                onPress={jest.fn()}
            />
        )

        expect(
            screen.getByText(
                'Não informado'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByRole('button', {
                name: 'Editar Nome'
            }).props.accessibilityValue
        ).toEqual({
            text: 'Não informado'
        })
    })

    test('aceita um número como valor visível', async () => {
        await render(
            <ProfileField
                label="Quantidade"
                valor={0}
                onPress={jest.fn()}
            />
        )

        expect(
            screen.getByText('0')
        ).toBeOnTheScreen()

        expect(
            screen.getByRole('button', {
                name: 'Editar Quantidade'
            }).props.accessibilityValue
        ).toEqual({
            text: '0'
        })
    })

    test('desabilita o campo quando não recebe uma ação', async () => {
        await render(
            <ProfileField
                label="Nome"
                valor="Julia"
            />
        )

        expect(
            screen.getByRole('button', {
                name: 'Editar Nome'
            })
        ).toBeDisabled()
    })

    test('respeita a desabilitação explícita', async () => {
        const onPress = jest.fn()

        await render(
            <ProfileField
                label="Nome"
                valor="Julia"
                onPress={onPress}
                desabilitado
            />
        )

        const campo =
            screen.getByRole('button', {
                name: 'Editar Nome'
            })

        expect(campo).toBeDisabled()

        await fireEvent.press(campo)

        expect(
            onPress
        ).not.toHaveBeenCalled()
    })

    test('limita valores longos a uma linha', async () => {
        const valor =
            'email-muito-longo@example.com'

        await render(
            <ProfileField
                label="E-mail"
                valor={valor}
                onPress={jest.fn()}
            />
        )

        expect(
            screen.getByText(valor)
        ).toHaveProp(
            'numberOfLines',
            1
        )

        expect(
            screen.getByText(valor)
        ).toHaveProp(
            'ellipsizeMode',
            'tail'
        )
    })

    test('usa o ícone de edição correto', async () => {
        await render(
            <ProfileField
                label="Nome"
                valor="Julia"
                onPress={jest.fn()}
            />
        )

        expect(
            NotePencilIcon
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                size: 20,
                color: corIconeEditar,
                weight: 'regular'
            }),
            undefined
        )
    })
})