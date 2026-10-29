import { fireEvent, render, screen } from '@testing-library/react-native';

const mockCheckCircle = jest.fn(() => null);

jest.mock('phosphor-react-native', () => ({
    CheckCircle: (propriedades) => mockCheckCircle(propriedades)
}));

import { ButtonSelection } from '../../../../src/shared/components/common/Button/ButtonSelection/ButtonSelection';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

const IconeTeste = jest.fn(() => null);

function renderizarBotao(propriedades = {}, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <ButtonSelection label="Opção mensal" {...propriedades} />
        </ThemeProvider>
    );
}

describe('ButtonSelection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renderiza label e descrição', async () => {
        await renderizarBotao({
            descricao: 'Uma vez por mês'
        });

        expect(screen.getByText('Opção mensal')).toBeOnTheScreen();

        expect(screen.getByText('Uma vez por mês')).toBeOnTheScreen();
    });

    test('não renderiza descrição ausente', async () => {
        await renderizarBotao();

        expect(screen.getByText('Opção mensal')).toBeOnTheScreen();

        expect(screen.queryByText('Uma vez por mês')).toBeNull();
    });

    test('executa a ação ao pressionar', async () => {
        const onPress = jest.fn();

        await renderizarBotao({
            onPress
        });

        await fireEvent.press(screen.getByRole('button'));

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    test('informa o estado selecionado', async () => {
        await renderizarBotao({
            selected: true
        });

        const botao = screen.getByRole('button');

        expect(botao).toBeSelected();

        expect(botao).toBeEnabled();
    });

    test('inicia sem seleção', async () => {
        await renderizarBotao();

        expect(screen.getByRole('button')).not.toBeSelected();
    });

    test('não executa ação desabilitada', async () => {
        const onPress = jest.fn();

        await renderizarBotao({
            desabilitado: true,
            onPress
        });

        const botao = screen.getByRole('button');

        expect(botao).toBeDisabled();

        await fireEvent.press(botao);

        expect(onPress).not.toHaveBeenCalled();
    });

    test('usa cor principal no ícone não selecionado', async () => {
        await renderizarBotao({
            icone: IconeTeste
        });

        expect(IconeTeste.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                size: 24,
                color: '#222222'
            })
        );
    });

    test('usa destaque claro no ícone selecionado', async () => {
        await renderizarBotao({
            icone: IconeTeste,
            selected: true
        });

        expect(IconeTeste.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                size: 24,
                color: '#2C4C3B'
            })
        );
    });

    test('usa destaque acessível no tema escuro', async () => {
        await renderizarBotao(
            {
                icone: IconeTeste,
                selected: true
            },
            'escuro'
        );

        expect(IconeTeste.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                size: 24,
                color: '#9FD6B6'
            })
        );

        expect(screen.getByText('Opção mensal')).toHaveStyle({
            color: '#9FD6B6'
        });

        expect(screen.getByRole('button')).toHaveStyle({
            backgroundColor: '#31463B'
        });
    });

    test('não renderiza ícone quando ausente', async () => {
        await renderizarBotao();

        expect(IconeTeste).not.toHaveBeenCalled();
    });

    test('mostra rádio vazio na intensidade não selecionada', async () => {
        await renderizarBotao({
            variante: 'intensidade'
        });

        expect(screen.getByTestId('radio-selecao-vazio')).toBeOnTheScreen();

        expect(mockCheckCircle).not.toHaveBeenCalled();
    });

    test('mostra confirmação na intensidade selecionada', async () => {
        await renderizarBotao({
            variante: 'intensidade',
            selected: true
        });

        expect(screen.queryByTestId('radio-selecao-vazio')).toBeNull();

        expect(mockCheckCircle).toHaveBeenCalledWith(
            expect.objectContaining({
                size: 26,
                weight: 'fill',
                color: '#2C4C3B'
            })
        );
    });

    test('usa superfície escura na variante intensidade', async () => {
        await renderizarBotao(
            {
                variante: 'intensidade'
            },
            'escuro'
        );

        expect(screen.getByRole('button')).toHaveStyle({
            backgroundColor: '#232926',
            borderColor: '#4A514D'
        });

        expect(screen.getByText('Opção mensal')).toHaveStyle({
            color: '#F4F1EA'
        });
    });

    test('usa texto secundário na descrição escura', async () => {
        await renderizarBotao(
            {
                descricao: 'Descrição da opção'
            },
            'escuro'
        );

        expect(screen.getByText('Descrição da opção')).toHaveStyle({
            color: '#C4C8C5'
        });
    });
});
