import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { Header } from '../../../../src/shared/components/navigation/Header/Header';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function renderizarHeader(propriedades = {}) {
    return render(
        <ThemeProvider preferencia="claro" esquemaDoSistema="light">
            <Header titulo="Rede de Apoio" {...propriedades} />
        </ThemeProvider>
    );
}

describe('Header com ações', () => {
    test('apresenta as ações ao lado do título', async () => {
        const aoFiltrar = jest.fn();

        await renderizarHeader({
            acoes: (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Filtrar contatos"
                    onPress={aoFiltrar}
                >
                    <Text>Filtrar</Text>
                </Pressable>
            )
        });

        expect(screen.getByRole('header')).toHaveTextContent('Rede de Apoio');

        expect(screen.getByTestId('header-actions')).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Filtrar contatos'
            })
        );

        expect(aoFiltrar).toHaveBeenCalledTimes(1);
    });

    test('não mostra ações na variante com voltar', async () => {
        await renderizarHeader({
            variante: 'comVoltar',
            onVoltar: jest.fn(),
            acoes: (
                <Pressable>
                    <Text>Ação incompatível</Text>
                </Pressable>
            )
        });

        expect(screen.queryByTestId('header-actions')).toBeNull();

        expect(screen.queryByText('Ação incompatível')).toBeNull();
    });

    test('aplica o cabeçalho específico da Rede de Apoio', async () => {
        await renderizarHeader({
            variante: 'redeApoio',
            acoes: (
                <Pressable accessibilityRole="button" accessibilityLabel="Ação da Rede de Apoio">
                    <Text>Ação</Text>
                </Pressable>
            )
        });

        expect(screen.getByTestId('header-title-container')).toHaveStyle({
            flexDirection: 'column',
            alignItems: 'flex-start',
            alignSelf: 'stretch'
        });

        expect(screen.getByRole('header')).toHaveStyle({
            fontSize: 28,
            fontWeight: '700',
            lineHeight: 27.5
        });
    });
});
