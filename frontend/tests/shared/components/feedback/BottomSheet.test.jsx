import { Animated, Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomSheet } from '../../../../src/shared/components/feedback/BottomSheet/BottomSheet';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function obterModal(container) {
    return container.queryAll(
        (elemento) =>
            elemento.props.transparent === true &&
            elemento.props.animationType === 'none' &&
            typeof elemento.props.onRequestClose === 'function'
    )[0];
}

function renderizarBottomSheet(propriedades = {}, preferencia = 'claro') {
    function AreaSeguraDeTeste({ children }) {
        return (
            <SafeAreaProvider
                initialMetrics={{
                    frame: { x: 0, y: 0, width: 390, height: 844 },
                    insets: { top: 0, right: 0, bottom: 32, left: 0 }
                }}
            >
                {children}
            </SafeAreaProvider>
        );
    }

    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <BottomSheet visivel onFechar={jest.fn()} {...propriedades}>
                <Text>Conteúdo do painel</Text>
            </BottomSheet>
        </ThemeProvider>,
        { wrapper: AreaSeguraDeTeste }
    );
}

describe('BottomSheet', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('renderiza o conteúdo quando está visível', async () => {
        await renderizarBottomSheet();

        expect(screen.getByText('Conteúdo do painel')).toBeOnTheScreen();
    });

    test('configura o modal transparente sem animação automática', async () => {
        const resultado = await renderizarBottomSheet();

        const modal = obterModal(resultado.container);

        expect(modal).toBeDefined();

        expect(modal).toHaveProp('transparent', true);

        expect(modal).toHaveProp('animationType', 'none');

        expect(modal).toHaveProp('visible', true);
    });

    test('executa onFechar quando o sistema solicita', async () => {
        const onFechar = jest.fn();

        const resultado = await renderizarBottomSheet({
            onFechar
        });

        const modal = obterModal(resultado.container);

        await act(async () => {
            modal.props.onRequestClose();
        });

        expect(onFechar).toHaveBeenCalledTimes(1);
    });

    test('não fecha quando está bloqueado', async () => {
        const onFechar = jest.fn();

        const resultado = await renderizarBottomSheet({
            onFechar,
            bloquearFechamento: true
        });

        const modal = obterModal(resultado.container);

        await act(async () => {
            modal.props.onRequestClose();
        });

        expect(onFechar).not.toHaveBeenCalled();
    });

    test('não apresenta erro sem onFechar', async () => {
        const resultado = await renderizarBottomSheet({
            onFechar: undefined
        });

        const modal = obterModal(resultado.container);

        await act(async () => {
            modal.props.onRequestClose();
        });

        expect(screen.getByText('Conteúdo do painel')).toBeOnTheScreen();
    });

    test('inicia a animação de entrada', async () => {
        const iniciar = jest.fn();

        const timing = jest.spyOn(Animated, 'timing').mockReturnValue({
            start: iniciar
        });

        const resultado = await renderizarBottomSheet();

        const modal = obterModal(resultado.container);

        await act(async () => {
            modal.props.onShow();
        });

        expect(timing.mock.calls[0][1]).toEqual(
            expect.objectContaining({
                toValue: 1,
                duration: 280,
                useNativeDriver: true,
                isInteraction: false
            })
        );

        expect(iniciar).toHaveBeenCalledTimes(1);
    });

    test('inicia a animação de saída', async () => {
        const iniciar = jest.fn();

        const timing = jest.spyOn(Animated, 'timing').mockReturnValue({
            start: iniciar
        });

        const resultado = await renderizarBottomSheet();

        await resultado.rerender(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <BottomSheet visivel={false} onFechar={jest.fn()}>
                    <Text>Conteúdo do painel</Text>
                </BottomSheet>
            </ThemeProvider>
        );

        expect(timing.mock.calls[0][1]).toEqual(
            expect.objectContaining({
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
                isInteraction: false
            })
        );

        expect(iniciar).toHaveBeenCalledTimes(1);
    });

    test('mantém o conteúdo durante a saída', async () => {
        jest.spyOn(Animated, 'timing').mockReturnValue({
            start: jest.fn()
        });

        const resultado = await renderizarBottomSheet();

        await resultado.rerender(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <BottomSheet visivel={false} onFechar={jest.fn()}>
                    <Text>Conteúdo do painel</Text>
                </BottomSheet>
            </ThemeProvider>
        );

        expect(screen.getByText('Conteúdo do painel')).toBeOnTheScreen();
    });

    test('desmonta depois que a saída termina', async () => {
        let concluirSaida;

        jest.spyOn(Animated, 'timing').mockImplementation((_, configuracao) => ({
            start: (callback) => {
                if (configuracao.toValue === 0) {
                    concluirSaida = callback;
                }
            }
        }));

        const resultado = await renderizarBottomSheet();

        await resultado.rerender(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <BottomSheet visivel={false} onFechar={jest.fn()}>
                    <Text>Conteúdo do painel</Text>
                </BottomSheet>
            </ThemeProvider>
        );

        expect(concluirSaida).toEqual(expect.any(Function));

        await act(async () => {
            concluirSaida({
                finished: true
            });
        });

        expect(screen.queryByText('Conteúdo do painel')).toBeNull();
    });

    test('preserva o conteúdo quando a animação é interrompida', async () => {
        let concluirSaida;

        jest.spyOn(Animated, 'timing').mockImplementation((_, configuracao) => ({
            start: (callback) => {
                if (configuracao.toValue === 0) {
                    concluirSaida = callback;
                }
            }
        }));

        const resultado = await renderizarBottomSheet();

        await resultado.rerender(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <BottomSheet visivel={false} onFechar={jest.fn()}>
                    <Text>Conteúdo do painel</Text>
                </BottomSheet>
            </ThemeProvider>
        );

        await act(async () => {
            concluirSaida({
                finished: false
            });
        });

        expect(screen.getByText('Conteúdo do painel')).toBeOnTheScreen();
    });

    test('usa sobreposição e superfície claras', async () => {
        await renderizarBottomSheet({}, 'claro');

        expect(screen.getByTestId('bottom-sheet-fundo')).toHaveStyle({
            backgroundColor: 'rgba(34, 34, 34, 0.48)'
        });

        expect(screen.getByTestId('bottom-sheet-painel')).toHaveStyle({
            backgroundColor: '#FFFFFF',
            overflow: 'hidden'
        });
    });

    test('usa sobreposição e superfície escuras', async () => {
        await renderizarBottomSheet({}, 'escuro');

        expect(screen.getByTestId('bottom-sheet-fundo')).toHaveStyle({
            backgroundColor: 'rgba(0, 0, 0, 0.68)'
        });

        expect(screen.getByTestId('bottom-sheet-painel')).toHaveStyle({
            backgroundColor: '#2B322E'
        });
    });

    test('notifica uma vez quando o modal termina de ser ocultado', async () => {
        const onOcultar = jest.fn();
        const resultado = await renderizarBottomSheet({ onOcultar });
        const modal = obterModal(resultado.container);

        await resultado.rerender(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <BottomSheet visivel={false} onOcultar={onOcultar}>
                    <Text>Conteúdo do painel</Text>
                </BottomSheet>
            </ThemeProvider>
        );

        await act(async () => {
            modal.props.onDismiss();
            modal.props.onDismiss();
        });

        expect(onOcultar).toHaveBeenCalledTimes(1);
    });
});
