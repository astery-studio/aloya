import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ThemeProvider, useThemeContext } from '../../../src/shared/theme/ThemeProvider';

function LeitorTema() {
    const { modo, preferencia, tema } = useThemeContext();

    return (
        <>
            <Text testID="preferencia-tema">{preferencia}</Text>

            <Text testID="modo-tema">{modo}</Text>

            <Text testID="fundo-tema">{tema.cores.interface.fundo}</Text>
        </>
    );
}

describe('ThemeProvider', () => {
    test('aplica o tema claro escolhido explicitamente', () => {
        render(
            <ThemeProvider preferencia="claro" esquemaDoSistema="dark">
                <LeitorTema />
            </ThemeProvider>
        );

        expect(screen.getByTestId('preferencia-tema')).toHaveTextContent('claro');

        expect(screen.getByTestId('modo-tema')).toHaveTextContent('claro');
    });

    test('aplica o tema escuro escolhido explicitamente', () => {
        render(
            <ThemeProvider preferencia="escuro" esquemaDoSistema="light">
                <LeitorTema />
            </ThemeProvider>
        );

        expect(screen.getByTestId('modo-tema')).toHaveTextContent('escuro');
    });

    test('segue o sistema escuro no modo automático', () => {
        render(
            <ThemeProvider preferencia="automatico" esquemaDoSistema="dark">
                <LeitorTema />
            </ThemeProvider>
        );

        expect(screen.getByTestId('preferencia-tema')).toHaveTextContent('automatico');

        expect(screen.getByTestId('modo-tema')).toHaveTextContent('escuro');
    });

    test('segue o sistema claro no modo automático', () => {
        render(
            <ThemeProvider preferencia="automatico" esquemaDoSistema="light">
                <LeitorTema />
            </ThemeProvider>
        );

        expect(screen.getByTestId('modo-tema')).toHaveTextContent('claro');
    });

    test('usa automático como preferência segura para valor inválido', () => {
        render(
            <ThemeProvider preferencia="invalido" esquemaDoSistema="dark">
                <LeitorTema />
            </ThemeProvider>
        );

        expect(screen.getByTestId('preferencia-tema')).toHaveTextContent('automatico');

        expect(screen.getByTestId('modo-tema')).toHaveTextContent('escuro');
    });

    test('atualiza o tema imediatamente quando a preferência muda', () => {
        const resultado = render(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <LeitorTema />
            </ThemeProvider>
        );

        expect(screen.getByTestId('modo-tema')).toHaveTextContent('claro');

        resultado.rerender(
            <ThemeProvider preferencia="escuro" esquemaDoSistema="light">
                <LeitorTema />
            </ThemeProvider>
        );

        expect(screen.getByTestId('modo-tema')).toHaveTextContent('escuro');
    });

    test('atualiza o modo automático quando o sistema muda', () => {
        const resultado = render(
            <ThemeProvider preferencia="automatico" esquemaDoSistema="light">
                <LeitorTema />
            </ThemeProvider>
        );

        expect(screen.getByTestId('modo-tema')).toHaveTextContent('claro');

        resultado.rerender(
            <ThemeProvider preferencia="automatico" esquemaDoSistema="dark">
                <LeitorTema />
            </ThemeProvider>
        );

        expect(screen.getByTestId('modo-tema')).toHaveTextContent('escuro');
    });

    test('fornece a cor de fundo correspondente ao modo', () => {
        render(
            <ThemeProvider preferencia="escuro" esquemaDoSistema="light">
                <LeitorTema />
            </ThemeProvider>
        );

        expect(screen.getByTestId('fundo-tema')).toHaveTextContent('#181C1A');
    });
});
