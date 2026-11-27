const mockUseKeyboard = jest.fn();
const mockUseReducedMotion = jest.fn();

jest.mock('../../../../src/shared/hooks/useKeyboard', () => ({
    useKeyboard: () => mockUseKeyboard()
}));

jest.mock('../../../../src/shared/hooks/useReducedMotion', () => ({
    useReducedMotion: () => mockUseReducedMotion()
}));

import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
    FloatingActionButton,
    obterEstiloPressionado
} from '../../../../src/shared/components/common/FloatingActionButton/FloatingActionButton';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

async function renderizarFab(propriedades = {}, preferencia = 'claro', insets = {}) {
    function AreaSeguraDeTeste({ children }) {
        return (
            <SafeAreaProvider
                initialMetrics={{
                    frame: { x: 0, y: 0, width: 390, height: 844 },
                    insets: { top: 47, right: 0, bottom: 0, left: 0, ...insets }
                }}
            >
                {children}
            </SafeAreaProvider>
        );
    }

    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <FloatingActionButton
                rotuloAcessibilidade="Adicionar item"
                aoPressionar={jest.fn()}
                {...propriedades}
            />
        </ThemeProvider>,
        { wrapper: AreaSeguraDeTeste }
    );
}

describe('FloatingActionButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseKeyboard.mockReturnValue({ visivel: false, altura: 0 });
        mockUseReducedMotion.mockReturnValue(false);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('apresenta dimensões, cores, ícone e rótulo acessível padronizados', async () => {
        await renderizarFab();

        const botao = screen.getByRole('button', { name: 'Adicionar item' });

        expect(botao).toHaveStyle({
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#C85A44',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.22,
            shadowRadius: 10,
            elevation: 8
        });
        expect(screen.getByTestId('floating-action-button-icon')).toHaveProp('width', 24);
        expect(screen.getByTestId('floating-action-button-icon')).toHaveProp('height', 24);
    });

    test('executa a ação uma vez por toque', async () => {
        const aoPressionar = jest.fn();
        await renderizarFab({ aoPressionar });

        await fireEvent.press(screen.getByRole('button', { name: 'Adicionar item' }));

        expect(aoPressionar).toHaveBeenCalledTimes(1);
    });

    test('aplica o fundo coral e o ícone escuro no tema noturno', async () => {
        await renderizarFab({ carregando: true }, 'escuro');
        expect(screen.getByTestId('floating-action-button')).toHaveStyle({
            backgroundColor: '#C26E5F'
        });
        expect(screen.getByTestId('floating-action-button-loading')).toHaveProp('color', '#121212');
    });

    test('reduz suavemente a escala durante o pressionamento', async () => {
        const estiloPressionado = { transform: [{ scale: 0.95 }] };

        expect(
            obterEstiloPressionado({
                pressionado: true,
                bloqueado: false,
                reducaoMovimento: false,
                estiloPressionado
            })
        ).toBe(estiloPressionado);
    });

    test('apresenta indicação visual sem alterar dimensões ao receber foco', async () => {
        await renderizarFab();
        const botao = screen.getByTestId('floating-action-button');

        await fireEvent(botao, 'focus');

        expect(botao).toHaveStyle({
            width: 56,
            height: 56,
            borderColor: '#222222'
        });
    });

    test.each([
        [{ desativado: true }, false],
        [{ aoPressionar: undefined }, false],
        [{ carregando: true }, true]
    ])('bloqueia a interação nos estados indisponíveis', async (propriedades, busy) => {
        const aoPressionar = jest.fn();
        await renderizarFab({ aoPressionar, ...propriedades });

        const botao = screen.getByRole('button', { name: 'Adicionar item' });
        await fireEvent.press(botao);

        expect(botao).toBeDisabled();
        expect(botao).toHaveProp(
            'accessibilityState',
            expect.objectContaining({ disabled: true, busy })
        );
        expect(aoPressionar).not.toHaveBeenCalled();
    });

    test('mantém as dimensões e troca o ícone pelo indicador durante carregamento', async () => {
        await renderizarFab({ carregando: true });

        expect(screen.getByTestId('floating-action-button')).toHaveStyle({ width: 56, height: 56 });
        expect(screen.queryByTestId('floating-action-button-icon')).toBeNull();
        expect(screen.getByTestId('floating-action-button-loading')).toBeOnTheScreen();
    });

    test('aplica a Safe Area inferior apenas quando solicitado', async () => {
        const { unmount } = await renderizarFab({}, 'claro', { bottom: 34 });

        expect(screen.getByTestId('floating-action-button').parent).toHaveStyle({ bottom: 58 });
        await unmount();

        await renderizarFab({ considerarAreaSeguraInferior: false }, 'claro', { bottom: 34 });

        expect(screen.getByTestId('floating-action-button').parent).toHaveStyle({ bottom: 24 });
    });

    test('some enquanto o teclado está aberto e retorna ao fechar', async () => {
        mockUseKeyboard.mockReturnValue({ visivel: true, altura: 280 });
        const { unmount } = await renderizarFab();
        expect(screen.queryByTestId('floating-action-button')).toBeNull();
        await unmount();

        mockUseKeyboard.mockReturnValue({ visivel: false, altura: 0 });
        await renderizarFab();
        expect(screen.getByTestId('floating-action-button')).toBeOnTheScreen();
    });

    test('mantém a escala ao pressionar quando a redução de movimento está ativa', async () => {
        mockUseReducedMotion.mockReturnValue(true);
        await renderizarFab();

        expect(
            obterEstiloPressionado({
                pressionado: true,
                bloqueado: false,
                reducaoMovimento: mockUseReducedMotion(),
                estiloPressionado: { transform: [{ scale: 0.95 }] }
            })
        ).toBeNull();
    });

    test('exige rótulo de acessibilidade contextual', async () => {
        await expect(renderizarFab({ rotuloAcessibilidade: ' ' })).rejects.toThrow(
            'FloatingActionButton precisa de um rótulo de acessibilidade.'
        );
    });
});
