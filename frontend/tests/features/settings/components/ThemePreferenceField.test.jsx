import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');

    function MoonIcon(props) {
        return React.createElement(View, {
            testID: 'icone-aparencia',
            ...props
        });
    }

    return {
        MoonIcon
    };
});

import {
    ThemePreferenceField,
    obterRotuloPreferencia
} from '../../../../src/features/settings/components/ThemePreferenceField';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function renderizarCampo(propriedades = {}, preferenciaTema = 'claro') {
    return render(
        <ThemeProvider preferencia={preferenciaTema} esquemaDoSistema="light">
            <ThemePreferenceField {...propriedades} />
        </ThemeProvider>
    );
}

describe('ThemePreferenceField', () => {
    test.each([
        ['claro', 'Claro'],
        ['escuro', 'Escuro'],
        ['automatico', 'Automático']
    ])('mostra o rótulo da preferência %s', async (preferencia, rotulo) => {
        await renderizarCampo({
            preferencia,
            onPress: jest.fn()
        });

        expect(
            screen.getByRole('button', {
                name: `Modo de Cor: ${rotulo}`
            })
        ).toBeOnTheScreen();
    });

    test('usa automático para uma preferência inválida', () => {
        expect(obterRotuloPreferencia('dark')).toBe('Automático');
    });

    test('encaminha a abertura do seletor', async () => {
        const onPress = jest.fn();

        await renderizarCampo({
            preferencia: 'escuro',
            onPress
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Modo de Cor: Escuro'
            })
        );

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    test('fica desabilitado sem ação', async () => {
        await renderizarCampo({
            preferencia: 'claro'
        });

        expect(
            screen.getByRole('button', {
                name: 'Modo de Cor: Claro'
            })
        ).toBeDisabled();
    });

    test('bloqueia a interação durante o salvamento', async () => {
        const onPress = jest.fn();

        await renderizarCampo({
            preferencia: 'automatico',
            salvando: true,
            onPress
        });

        const campo = screen.getByRole('button', {
            name: 'Modo de Cor: Automático'
        });

        expect(campo).toBeDisabled();

        expect(campo.props.accessibilityState).toEqual({
            disabled: true,
            busy: true
        });

        await fireEvent.press(campo);

        expect(onPress).not.toHaveBeenCalled();
    });

    test('usa as cores claras do tema', async () => {
        await renderizarCampo({
            preferencia: 'claro',
            onPress: jest.fn()
        });

        expect(screen.getByText('Modo de Cor')).toHaveStyle({
            color: '#222222'
        });
    });

    test('usa as cores escuras do tema', async () => {
        await renderizarCampo(
            {
                preferencia: 'escuro',
                onPress: jest.fn()
            },
            'escuro'
        );

        expect(screen.getByText('Modo de Cor')).toHaveStyle({
            color: '#F4F1EA'
        });
    });

    test('usa o ícone centralizado do projeto', async () => {
        await renderizarCampo({
            preferencia: 'claro',
            onPress: jest.fn()
        });

        expect(screen.getByTestId('icone-aparencia')).toHaveProp('weight', 'regular');
    });
});
