//Testa a edição e validação dos dados pessoais na tela de perfil.
import {
    fireEvent,
    render,
    screen,
    waitFor
} from '@testing-library/react-native'

jest.mock('../components/icons/AppIcons', () => ({
    LockKeyIcon: jest.fn(() => null),
    WarningCircleIcon: jest.fn(() => null)
}))

jest.mock(
    '../layouts/SettingsLayout/SettingsLayout',
    () => {
        const React = require('react')
        const { View } =
            require('react-native')

        function SettingsLayout({
            children,
            rodape
        }) {
            return React.createElement(
                View,
                null,
                children,
                rodape
            )
        }

        return {
            SettingsLayout
        }
    }
)

jest.mock(
    '../features/settings/profile/ProfileSettings',
    () => {
        const React = require('react')

        const {
            Pressable,
            Text,
            View
        } = require('react-native')

        function criarBotao(
            nome,
            texto,
            onPress,
            disabled = false
        ) {
            return React.createElement(
                Pressable,
                {
                    key: nome,
                    accessibilityRole:
                        'button',
                    accessibilityLabel:
                        nome,
                    disabled,
                    onPress
                },
                React.createElement(
                    Text,
                    null,
                    texto
                )
            )
        }

        function ProfileSettings({
            dados,
            onEditarCampo,
            onSalvar,
            podeSalvar
        }) {
            return React.createElement(
                View,
                null,
                React.createElement(
                    Text,
                    null,
                    `Nome atual: ${dados.nome}`
                ),
                React.createElement(
                    Text,
                    null,
                    `E-mail atual: ${dados.email}`
                ),
                React.createElement(
                    Text,
                    null,
                    `Nascimento atual: ${dados.dataNascimento}`
                ),
                criarBotao(
                    'Editar nome no teste',
                    'Editar nome',
                    () => onEditarCampo(
                        'nome'
                    )
                ),
                criarBotao(
                    'Editar e-mail no teste',
                    'Editar e-mail',
                    () => onEditarCampo(
                        'email'
                    )
                ),
                criarBotao(
                    'Editar nascimento no teste',
                    'Editar nascimento',
                    () => onEditarCampo(
                        'dataNascimento'
                    )
                ),
                criarBotao(
                    'Salvar perfil no teste',
                    'Salvar perfil',
                    onSalvar,
                    !podeSalvar
                )
            )
        }

        return {
            ProfileSettings
        }
    }
)

jest.mock(
    '../components/feedback/EditFieldSheet/EditFieldSheet',
    () => {
        const React = require('react')

        const {
            Pressable,
            Text,
            TextInput,
            View
        } = require('react-native')

        function EditFieldSheet({
            visivel,
            titulo,
            valor,
            onAlterar,
            onFechar,
            erro,
            botaoSalvar
        }) {
            if (!visivel) {
                return null
            }

            return React.createElement(
                View,
                null,
                React.createElement(
                    Text,
                    null,
                    titulo
                ),
                React.createElement(
                    TextInput,
                    {
                        accessibilityLabel:
                            'Valor do campo',
                        value: valor,
                        onChangeText:
                            onAlterar
                    }
                ),
                erro
                    ? React.createElement(
                        Text,
                        {
                            accessibilityRole:
                                'alert'
                        },
                        erro
                    )
                    : null,
                botaoSalvar,
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole:
                            'button',
                        accessibilityLabel:
                            'Fechar edição',
                        onPress: onFechar
                    },
                    React.createElement(
                        Text,
                        null,
                        'Fechar'
                    )
                )
            )
        }

        return {
            EditFieldSheet
        }
    }
)

jest.mock(
    '../features/settings/profile/GenderSelector',
    () => ({
        GenderSelector:
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

const perfil = {
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

async function abrirEdicao(
    nomeDoBotao
) {
    await fireEvent.press(
        screen.getByRole('button', {
            name: nomeDoBotao
        })
    )

    await waitFor(() => {
        expect(
            screen.getByLabelText(
                'Valor do campo'
            )
        ).toBeOnTheScreen()
    })
}

async function alterarValor(
    valor
) {
    await fireEvent.changeText(
        screen.getByLabelText(
            'Valor do campo'
        ),
        valor
    )
}

async function confirmarEdicao() {
    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Salvar'
        })
    )
}

async function salvarPerfil() {
    await fireEvent.press(
        screen.getByRole('button', {
            name:
                'Salvar perfil no teste'
        })
    )
}

describe('ProfileSettingsScreen - edição', () => {
    test('abre e fecha a edição do nome', async () => {
        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={jest.fn()}
            />
        )

        await abrirEdicao(
            'Editar nome no teste'
        )

        expect(
            screen.getByText(
                'Editar Nome'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByLabelText(
                'Valor do campo'
            )
        ).toHaveProp(
            'value',
            'Julia'
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Fechar edição'
            })
        )

        expect(
            screen.queryByLabelText(
                'Valor do campo'
            )
        ).toBeNull()
    })

    test('rejeita um nome inválido', async () => {
        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={jest.fn()}
            />
        )

        await abrirEdicao(
            'Editar nome no teste'
        )

        await alterarValor(
            'Ju1ia'
        )

        await confirmarEdicao()

        expect(
            screen.getByRole('alert')
        ).toHaveTextContent(
            'Informe um nome válido usando apenas letras, espaços ou hífens.'
        )

        expect(
            screen.getByLabelText(
                'Valor do campo'
            )
        ).toBeOnTheScreen()
    })

    test('normaliza e salva o nome', async () => {
        const onSalvar =
            jest.fn().mockResolvedValue({
                ...perfil,
                nome: 'Julia Silva'
            })

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={onSalvar}
            />
        )

        await abrirEdicao(
            'Editar nome no teste'
        )

        await alterarValor(
            '  Julia Silva  '
        )

        await confirmarEdicao()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Nome atual: Julia Silva'
                )
            ).toBeOnTheScreen()
        })

        await salvarPerfil()

        await waitFor(() => {
            expect(
                onSalvar
            ).toHaveBeenCalledWith({
                nome: 'Julia Silva'
            })
        })

        expect(
            Object.isFrozen(
                onSalvar.mock.calls[0][0]
            )
        ).toBe(true)
    })

    test('rejeita um e-mail inválido', async () => {
        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={jest.fn()}
            />
        )

        await abrirEdicao(
            'Editar e-mail no teste'
        )

        expect(
            screen.getByText(
                'Editar E-mail'
            )
        ).toBeOnTheScreen()

        await alterarValor(
            'email-invalido'
        )

        await confirmarEdicao()

        expect(
            screen.getByRole('alert')
        ).toHaveTextContent(
            'Informe um e-mail válido.'
        )
    })

    test('normaliza e salva o e-mail', async () => {
        const onSalvar =
            jest.fn().mockResolvedValue({
                ...perfil,
                email:
                    'novo@email.com'
            })

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={onSalvar}
            />
        )

        await abrirEdicao(
            'Editar e-mail no teste'
        )

        await alterarValor(
            '  NOVO@EMAIL.COM  '
        )

        await confirmarEdicao()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'E-mail atual: novo@email.com'
                )
            ).toBeOnTheScreen()
        })

        await salvarPerfil()

        await waitFor(() => {
            expect(
                onSalvar
            ).toHaveBeenCalledWith({
                email:
                    'novo@email.com'
            })
        })
    })

    test.each([
        'data inválida',
        '31/12/2999'
    ])(
        'rejeita nascimento inválido: %s',
        async (dataNascimento) => {
            await render(
                <ProfileSettingsScreen
                    perfil={perfil}
                    onSalvar={jest.fn()}
                />
            )

            await abrirEdicao(
                'Editar nascimento no teste'
            )

            await alterarValor(
                dataNascimento
            )

            await confirmarEdicao()

            expect(
                screen.getByRole('alert')
            ).toHaveTextContent(
                'Informe uma data de nascimento válida.'
            )
        }
    )

    test('formata, converte e salva o nascimento', async () => {
        const onSalvar =
            jest.fn().mockResolvedValue({
                ...perfil,
                dataNascimento:
                    '1999-04-09'
            })

        await render(
            <ProfileSettingsScreen
                perfil={perfil}
                onSalvar={onSalvar}
            />
        )

        await abrirEdicao(
            'Editar nascimento no teste'
        )

        expect(
            screen.getByText(
                'Editar Data de Nascimento'
            )
        ).toBeOnTheScreen()

        expect(
            screen.getByLabelText(
                'Valor do campo'
            )
        ).toHaveProp(
            'value',
            '08/04/1999'
        )

        await alterarValor(
            '09/04/1999'
        )

        await confirmarEdicao()

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Nascimento atual: 1999-04-09'
                )
            ).toBeOnTheScreen()
        })

        await salvarPerfil()

        await waitFor(() => {
            expect(
                onSalvar
            ).toHaveBeenCalledWith({
                dataNascimento:
                    '1999-04-09'
            })
        })
    })

    test('mantém salvar desativado sem função de persistência', async () => {
        await render(
            <ProfileSettingsScreen
                perfil={perfil}
            />
        )

        await abrirEdicao(
            'Editar nome no teste'
        )

        await alterarValor(
            'Julia Silva'
        )

        await confirmarEdicao()

        expect(
            screen.getByRole('button', {
                name:
                    'Salvar perfil no teste'
            })
        ).toBeDisabled()
    })
})