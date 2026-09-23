import {Text} from 'react-native'
import {fireEvent, render, screen} from '@testing-library/react-native'

jest.mock(
    '../components/feedback/Bottomsheet/BottomSheet',
    () => {
        const React = require('react')
        const {View} = require('react-native')

        function BottomSheet({
            children,
            visivel,
            onFechar,
            bloquearFechamento
        }) {
            return React.createElement(
                View,
                {
                    testID: 'bottom-sheet',
                    visivel,
                    onFechar,
                    bloquearFechamento
                },
                children
            )
        }

        return {
            BottomSheet
        }
    }
)

jest.mock(
    '../layouts/BottomSheet/BottomSheetLayout',
    () => {
        const React = require('react')
        const {
            Text: Texto,
            View
        } = require('react-native')

        function BottomSheetLayout({
            children,
            titulo,
            onFechar,
            bloquearFechamento
        }) {
            return React.createElement(
                View,
                {
                    testID: 'bottom-sheet-layout',
                    onFechar,
                    bloquearFechamento
                },
                React.createElement(
                    Texto,
                    null,
                    titulo
                ),
                children
            )
        }

        return {
            BottomSheetLayout
        }
    }
)

import {EditFieldSheet} from '../components/feedback/EditFieldSheet/EditFieldSheet'

describe('EditFieldSheet', () => {
    test('renderiza o título, o valor e o botão de salvar', async () => {
        const onFechar = jest.fn()

        await render(
            <EditFieldSheet
                visivel
                titulo="Editar nome"
                valor="Ana Silva"
                onAlterar={jest.fn()}
                onFechar={onFechar}
                botaoSalvar={
                    <Text>Salvar alterações</Text>
                }
            />
        )

        expect(
            screen.getByText('Editar nome')
        ).toBeOnTheScreen()

        expect(
            screen.getByLabelText('Nome')
        ).toHaveProp(
            'value',
            'Ana Silva'
        )

        expect(
            screen.getByText('Salvar alterações')
        ).toBeOnTheScreen()

        expect(
            screen.getByTestId('bottom-sheet')
        ).toHaveProp(
            'visivel',
            true
        )

        expect(
            screen.getByTestId('bottom-sheet')
        ).toHaveProp(
            'onFechar',
            onFechar
        )
    })

    test('configura corretamente o campo de nome', async () => {
        await render(
            <EditFieldSheet
                visivel
                titulo="Editar nome"
                tipo="nome"
                valor="Ana"
                onAlterar={jest.fn()}
            />
        )

        const campo =
            screen.getByLabelText('Nome')

        expect(campo).toHaveProp(
            'keyboardType',
            'default'
        )

        expect(campo).toHaveProp(
            'autoCapitalize',
            'words'
        )

        expect(campo).toHaveProp(
            'autoCorrect',
            true
        )

        expect(campo).toHaveProp(
            'maxLength',
            120
        )

        expect(campo).toHaveProp(
            'multiline',
            false
        )
    })

    test('remove caracteres de controle do texto', async () => {
        const onAlterar = jest.fn()

        await render(
            <EditFieldSheet
                visivel
                titulo="Editar nome"
                tipo="nome"
                valor=""
                onAlterar={onAlterar}
            />
        )

        await fireEvent.changeText(
            screen.getByLabelText('Nome'),
            'Ana\u0000\nSilva\u007F'
        )

        expect(onAlterar).toHaveBeenCalledTimes(1)

        expect(onAlterar).toHaveBeenCalledWith(
            'AnaSilva'
        )
    })

    test('configura corretamente o campo de e-mail', async () => {
        await render(
            <EditFieldSheet
                visivel
                titulo="Editar e-mail"
                tipo="email"
                valor="ana@email.com"
                onAlterar={jest.fn()}
            />
        )

        const campo =
            screen.getByLabelText('E-mail')

        expect(campo).toHaveProp(
            'value',
            'ana@email.com'
        )

        expect(campo).toHaveProp(
            'keyboardType',
            'email-address'
        )

        expect(campo).toHaveProp(
            'autoCapitalize',
            'none'
        )

        expect(campo).toHaveProp(
            'autoCorrect',
            false
        )

        expect(campo).toHaveProp(
            'maxLength',
            254
        )
    })

    test('converte a data da API para o formato visível', async () => {
        await render(
            <EditFieldSheet
                visivel
                titulo="Editar nascimento"
                tipo="data"
                valor="2000-09-21"
                onAlterar={jest.fn()}
            />
        )

        const campo =
            screen.getByLabelText(
                'Data de nascimento'
            )

        expect(campo).toHaveProp(
            'value',
            '21/09/2000'
        )

        expect(campo).toHaveProp(
            'keyboardType',
            'number-pad'
        )

        expect(campo).toHaveProp(
            'placeholder',
            'DD/MM/AAAA'
        )

        expect(campo).toHaveProp(
            'maxLength',
            10
        )

        expect(campo).toHaveProp(
            'autoCapitalize',
            'none'
        )

        expect(campo).toHaveProp(
            'autoCorrect',
            false
        )
    })

    test.each([
        [
            '1',
            '1'
        ],
        [
            '1234',
            '12/34'
        ],
        [
            '123',
            '12/3'
        ],
        [
            '1234',
            '12/34'
        ],
        [
            '123456789',
            '12/34/5678'
        ]
    ])(
        'formata a digitação de data %s como %s',
        async (textoDigitado, resultadoEsperado) => {
            const onAlterar = jest.fn()

            await render(
                <EditFieldSheet
                    visivel
                    titulo="Editar nascimento"
                    tipo="data"
                    valor=""
                    onAlterar={onAlterar}
                />
            )

            await fireEvent.changeText(
                screen.getByLabelText(
                    'Data de nascimento'
                ),
                textoDigitado
            )

            expect(onAlterar).toHaveBeenCalledTimes(1)

            expect(onAlterar).toHaveBeenCalledWith(
                resultadoEsperado
            )
        }
    )

    test('permite apagar a barra final da data', async () => {
        const onAlterar = jest.fn()

        await render(
            <EditFieldSheet
                visivel
                titulo="Editar nascimento"
                tipo="data"
                valor="12/"
                onAlterar={onAlterar}
            />
        )

        await fireEvent.changeText(
            screen.getByLabelText(
                'Data de nascimento'
            ),
            '12'
        )

        expect(onAlterar).toHaveBeenCalledWith(
            '12'
        )
    })

    test('exibe a mensagem de erro como região dinâmica', async () => {
        await render(
            <EditFieldSheet
                visivel
                titulo="Editar e-mail"
                tipo="email"
                valor="email-invalido"
                erro="Informe um e-mail válido."
                onAlterar={jest.fn()}
            />
        )

        const mensagem =
            screen.getByText(
                'Informe um e-mail válido.'
            )

        expect(mensagem).toBeOnTheScreen()

        expect(mensagem).toHaveProp(
            'accessibilityLiveRegion',
            'polite'
        )
    })

    test('bloqueia edição e fechamento durante o salvamento', async () => {
        await render(
            <EditFieldSheet
                visivel
                titulo="Salvando"
                valor="Ana"
                salvando
                onAlterar={jest.fn()}
            />
        )

        expect(
            screen.getByLabelText('Nome')
        ).toHaveProp(
            'editable',
            false
        )

        expect(
            screen.getByTestId('bottom-sheet')
        ).toHaveProp(
            'bloquearFechamento',
            true
        )

        expect(
            screen.getByTestId(
                'bottom-sheet-layout'
            )
        ).toHaveProp(
            'bloquearFechamento',
            true
        )
    })
})