import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const mockArrowLeftIcon = jest.fn(() => null);

jest.mock('phosphor-react-native/src/icons/ArrowLeft', () => ({
    ArrowLeftIcon: (propriedades) => mockArrowLeftIcon(propriedades)
}));

import { Header } from '../../../../src/shared/components/navigation/Header/Header';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function criarMetricas(insetSuperior) {
    return {
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: insetSuperior, right: 0, bottom: 0, left: 0 }
    };
}

function renderizarHeader(propriedades = {}, preferencia = 'claro', insetSuperior = 0) {
    return render(
        <SafeAreaProvider initialMetrics={criarMetricas(insetSuperior)}>
            <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
                <Header titulo="Configurações" {...propriedades} />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

describe('Header', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renderiza o título como cabeçalho', async () => {
        await renderizarHeader();

        const titulo = screen.getByRole('header');

        expect(titulo).toHaveTextContent('Configurações');

        expect(titulo).toHaveStyle({
            flex: 1,
            flexShrink: 1,
            fontFamily: 'DMSans_700Bold',
            fontSize: 28,
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 36,
            letterSpacing: 0,
            textAlign: 'left'
        });
    });

    test.each([
        [0, 16],
        [24, 40],
        [44, 60],
        [59, 75]
    ])('soma 16 dp ao inset superior %i', async (insetSuperior, paddingEsperado) => {
        await renderizarHeader({}, 'claro', insetSuperior);

        expect(screen.getByTestId('header-container')).toHaveStyle({
            paddingTop: paddingEsperado
        });
    });

    test('não duplica o inset quando a Safe Area já foi aplicada pelo pai', async () => {
        await renderizarHeader({ aplicarSafeAreaSuperior: false }, 'claro', 59);

        expect(screen.getByTestId('header-container')).toHaveStyle({ paddingTop: 16 });
    });

    test('permite título longo e fonte ampliada sem altura rígida', async () => {
        const tituloLongo =
            'Configurações de acompanhamento e compartilhamento de informações do ciclo';

        await renderizarHeader({ titulo: tituloLongo });

        const titulo = screen.getByRole('header');
        const estiloConteudo = StyleSheet.flatten(screen.getByTestId('header-content').props.style);

        expect(titulo).toHaveTextContent(tituloLongo);
        expect(titulo.props.numberOfLines).toBeUndefined();
        expect(titulo.props.allowFontScaling).not.toBe(false);
        expect(estiloConteudo.height).toBeUndefined();
        expect(estiloConteudo.minHeight).toBeUndefined();
    });

    test('não mostra botão de voltar na variante padrão', async () => {
        await renderizarHeader();

        expect(
            screen.queryByRole('button', {
                name: 'Voltar'
            })
        ).toBeNull();

        expect(mockArrowLeftIcon).not.toHaveBeenCalled();
    });

    test('mostra botão de voltar na variante comVoltar', async () => {
        await renderizarHeader({
            titulo: 'Perfil',
            variante: 'comVoltar',
            onVoltar: jest.fn()
        });

        expect(
            screen.getByRole('button', {
                name: 'Voltar'
            })
        ).toBeEnabled();
    });

    test('executa a ação de voltar', async () => {
        const onVoltar = jest.fn();

        await renderizarHeader({
            titulo: 'Perfil',
            variante: 'comVoltar',
            onVoltar
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Voltar'
            })
        );

        expect(onVoltar).toHaveBeenCalledTimes(1);
    });

    test('desabilita voltar sem ação', async () => {
        await renderizarHeader({
            titulo: 'Perfil',
            variante: 'comVoltar'
        });

        const botao = screen.getByRole('button', {
            name: 'Voltar'
        });

        expect(botao).toBeDisabled();

        expect(botao.props.accessibilityState).toEqual({
            disabled: true
        });
    });

    test('usa o título compacto alinhado à esquerda na variante comVoltar', async () => {
        await renderizarHeader({
            titulo: 'Editar perfil',
            variante: 'comVoltar',
            onVoltar: jest.fn()
        });

        expect(screen.getByRole('header')).toHaveStyle({
            fontFamily: 'DMSans_700Bold',
            fontSize: 20,
            fontWeight: '700',
            lineHeight: 28,
            textAlign: 'left'
        });
    });

    test('renderiza o ícone de voltar no tema claro', async () => {
        await renderizarHeader({
            titulo: 'Perfil',
            variante: 'comVoltar',
            onVoltar: jest.fn()
        });

        expect(mockArrowLeftIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                size: 24,
                color: '#5C5C59',
                weight: 'regular'
            })
        );
    });

    test('renderiza o ícone de voltar no tema escuro', async () => {
        await renderizarHeader(
            {
                titulo: 'Perfil',
                variante: 'comVoltar',
                onVoltar: jest.fn()
            },
            'escuro'
        );

        expect(mockArrowLeftIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                size: 24,
                color: '#C4C8C5',
                weight: 'regular'
            })
        );
    });

    test('usa fundo e texto do tema claro', async () => {
        await renderizarHeader();

        expect(screen.getByTestId('header-container')).toHaveStyle({
            backgroundColor: '#F7F5F0'
        });

        expect(screen.getByRole('header')).toHaveStyle({
            color: '#222222'
        });
    });

    test('aceita fundo específico da screen', async () => {
        await renderizarHeader({ corFundo: '#ABCDEF' });
        expect(screen.getByTestId('header-container')).toHaveStyle({ backgroundColor: '#ABCDEF' });
    });

    test('usa fundo e texto do tema escuro', async () => {
        await renderizarHeader({}, 'escuro');

        expect(screen.getByTestId('header-container')).toHaveStyle({
            backgroundColor: '#181C1A'
        });

        expect(screen.getByRole('header')).toHaveStyle({
            color: '#F4F1EA'
        });
    });

    test('atualiza as cores quando o tema muda', async () => {
        const resultado = await renderizarHeader({}, 'claro');

        expect(screen.getByRole('header')).toHaveStyle({
            color: '#222222'
        });

        await resultado.rerender(
            <SafeAreaProvider initialMetrics={criarMetricas(0)}>
                <ThemeProvider preferencia="escuro" esquemaDoSistema="light">
                    <Header titulo="Configurações" />
                </ThemeProvider>
            </SafeAreaProvider>
        );

        expect(screen.getByRole('header')).toHaveStyle({
            color: '#F4F1EA'
        });
    });

    test('trata variante desconhecida como padrão', async () => {
        await renderizarHeader({
            titulo: 'Título padrão',
            variante: 'varianteInexistente',
            onVoltar: jest.fn()
        });

        expect(screen.getByRole('header')).toHaveTextContent('Título padrão');

        expect(
            screen.queryByRole('button', {
                name: 'Voltar'
            })
        ).toBeNull();
    });
});
