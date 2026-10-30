import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockXIcon = jest.fn(() => null);

jest.mock('phosphor-react-native/src/icons/X', () => ({
    XIcon: (propriedades) => mockXIcon(propriedades)
}));

import { BottomSheetLayout } from '../../../src/shared/layouts/BottomSheet/BottomSheetLayout';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

function renderizarLayout(propriedades = {}, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <BottomSheetLayout titulo="Selecionar opção" onFechar={jest.fn()} {...propriedades}>
                <Text>Conteúdo do painel</Text>
            </BottomSheetLayout>
        </ThemeProvider>
    );
}

describe('BottomSheetLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renderiza título e conteúdo', async () => {
        await renderizarLayout();

        expect(screen.getByRole('header')).toHaveTextContent('Selecionar opção');

        expect(screen.getByText('Conteúdo do painel')).toBeOnTheScreen();
    });

    test('renderiza o botão de fechar acessível', async () => {
        await renderizarLayout();

        const botao = screen.getByRole('button', {
            name: 'Fechar painel'
        });

        expect(botao).toBeEnabled();

        expect(botao.props.accessibilityState).toEqual({
            disabled: false
        });
    });

    test('executa a ação de fechar', async () => {
        const onFechar = jest.fn();

        await renderizarLayout({
            onFechar
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Fechar painel'
            })
        );

        expect(onFechar).toHaveBeenCalledTimes(1);
    });

    test('não falha sem callback de fechamento', async () => {
        await renderizarLayout({
            onFechar: undefined
        });

        const botao = screen.getByRole('button', {
            name: 'Fechar painel'
        });

        expect(botao).toBeEnabled();

        await fireEvent.press(botao);

        expect(screen.getByText('Conteúdo do painel')).toBeOnTheScreen();
    });

    test('bloqueia o fechamento durante operação', async () => {
        const onFechar = jest.fn();

        await renderizarLayout({
            onFechar,
            bloquearFechamento: true
        });

        const botao = screen.getByRole('button', {
            name: 'Fechar painel'
        });

        expect(botao).toBeDisabled();

        expect(botao.props.accessibilityState).toEqual({
            disabled: true
        });

        await fireEvent.press(botao);

        expect(onFechar).not.toHaveBeenCalled();
    });

    test('volta a permitir fechamento após desbloqueio', async () => {
        const onFechar = jest.fn();

        const resultado = await renderizarLayout({
            titulo: 'Salvando',
            onFechar,
            bloquearFechamento: true
        });

        expect(
            screen.getByRole('button', {
                name: 'Fechar painel'
            })
        ).toBeDisabled();

        await resultado.rerender(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <BottomSheetLayout
                    titulo="Concluído"
                    onFechar={onFechar}
                    bloquearFechamento={false}
                >
                    <Text>Conteúdo do painel</Text>
                </BottomSheetLayout>
            </ThemeProvider>
        );

        const botao = screen.getByRole('button', {
            name: 'Fechar painel'
        });

        expect(botao).toBeEnabled();

        await fireEvent.press(botao);

        expect(onFechar).toHaveBeenCalledTimes(1);
    });

    test('usa cores claras', async () => {
        await renderizarLayout({}, 'claro');

        expect(screen.getByTestId('bottom-sheet-layout')).toHaveStyle({
            backgroundColor: '#FFFFFF'
        });

        expect(screen.getByRole('header')).toHaveStyle({
            color: '#222222'
        });

        expect(mockXIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                size: 24,
                color: '#5C5C59',
                weight: 'regular'
            })
        );
    });

    test('usa cores escuras', async () => {
        await renderizarLayout({}, 'escuro');

        expect(screen.getByTestId('bottom-sheet-layout')).toHaveStyle({
            backgroundColor: '#2B322E'
        });

        expect(screen.getByRole('header')).toHaveStyle({
            color: '#F4F1EA'
        });

        expect(mockXIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                size: 24,
                color: '#C4C8C5',
                weight: 'regular'
            })
        );
    });

    test('mantém o conteúdo com a superfície do tema', async () => {
        await renderizarLayout({}, 'escuro');

        expect(screen.getByTestId('bottom-sheet-conteudo')).toHaveStyle({
            backgroundColor: '#2B322E'
        });
    });

    test('atualiza as cores quando o tema muda', async () => {
        const resultado = await renderizarLayout({}, 'claro');

        expect(screen.getByRole('header')).toHaveStyle({
            color: '#222222'
        });

        await resultado.rerender(
            <ThemeProvider preferencia="escuro" esquemaDoSistema="light">
                <BottomSheetLayout titulo="Selecionar opção" onFechar={jest.fn()}>
                    <Text>Conteúdo do painel</Text>
                </BottomSheetLayout>
            </ThemeProvider>
        );

        expect(screen.getByRole('header')).toHaveStyle({
            color: '#F4F1EA'
        });
    });
});
