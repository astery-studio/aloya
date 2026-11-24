import { fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

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
    function criarAcao(rotulo) {
        return (
            <Pressable accessibilityRole="button" accessibilityLabel={rotulo}>
                <Text>{rotulo}</Text>
            </Pressable>
        );
    }

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

    test.each([
        ['sem ações', 'padrao', null, 0],
        ['com uma ação', 'redeApoio', criarAcao('Filtrar'), 1],
        [
            'com duas ações',
            'diario',
            <>
                {criarAcao('Filtrar')}
                {criarAcao('Gerenciar')}
            </>,
            2
        ]
    ])('mantém o mesmo título principal %s', async (_, variante, acoes, quantidade) => {
        await renderizarHeader({ variante, acoes });

        const estilo = StyleSheet.flatten(screen.getByRole('header').props.style);

        expect(estilo).toMatchObject({
            fontFamily: 'DMSans_700Bold',
            fontSize: 28,
            fontWeight: '700',
            lineHeight: 36,
            textAlign: 'left'
        });

        if (quantidade === 0) {
            expect(screen.queryByTestId('header-actions')).toBeNull();
        } else {
            expect(screen.getByTestId('header-actions').children).toHaveLength(quantidade);
        }
    });
});
