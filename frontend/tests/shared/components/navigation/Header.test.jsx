import { fireEvent, render, screen } from '@testing-library/react-native';

const mockArrowLeftIcon = jest.fn(() => null);

jest.mock('phosphor-react-native/src/icons/ArrowLeft', () => ({
    ArrowLeftIcon: (propriedades) => mockArrowLeftIcon(propriedades)
}));

import { Header } from '../../../../src/shared/components/navigation/Header/Header';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function renderizarHeader(propriedades = {}, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <Header titulo="Configurações" {...propriedades} />
        </ThemeProvider>
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
            flexShrink: 1
        });
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

    test('usa estilo centralizado na variante comVoltar', async () => {
        await renderizarHeader({
            titulo: 'Editar perfil',
            variante: 'comVoltar',
            onVoltar: jest.fn()
        });

        expect(screen.getByRole('header')).toHaveStyle({
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 27,
            textAlign: 'center'
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
            <ThemeProvider preferencia="escuro" esquemaDoSistema="light">
                <Header titulo="Configurações" />
            </ThemeProvider>
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
