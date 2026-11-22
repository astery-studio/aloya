import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('../../../src/shared/components/navigation/Header/Header', () => ({
    Header: jest.fn(({ titulo, acoes }) => {
        const React = require('react');

        const { View, Text: RNText } = require('react-native');

        return React.createElement(
            View,
            {
                testID: 'header-mock'
            },
            React.createElement(RNText, null, titulo),
            acoes
        );
    })
}));

jest.mock('../../../src/shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar', () => ({
    BottomTabBar: jest.fn(() => null)
}));

import { Header } from '../../../src/shared/components/navigation/Header/Header';
import { MainLayout } from '../../../src/shared/layouts/MainLayout/MainLayout';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

describe('MainLayout com ações no cabeçalho', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('encaminha as ações para o Header', async () => {
        const acoesHeader = <Text>Ações da Rede</Text>;

        await render(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <MainLayout titulo="Rede de Apoio" abaAtiva="membros" acoesHeader={acoesHeader}>
                    <Text>Lista</Text>
                </MainLayout>
            </ThemeProvider>
        );

        expect(Header).toHaveBeenCalledWith(
            expect.objectContaining({
                titulo: 'Rede de Apoio',
                acoes: acoesHeader
            }),
            undefined
        );

        expect(screen.getByText('Ações da Rede')).toBeOnTheScreen();
    });
});
