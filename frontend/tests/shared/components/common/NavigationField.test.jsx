import { fireEvent, render, screen } from '@testing-library/react-native';

const mockCaretRightIcon = jest.fn(() => null);

jest.mock('phosphor-react-native/src/icons/CaretRight', () => ({
    CaretRightIcon: (propriedades) => mockCaretRightIcon(propriedades)
}));

import { NavigationField } from '../../../../src/shared/components/common/NavigationField/NavigationField';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';
import { tema } from '../../../../src/shared/theme';

const IconeTeste = jest.fn(() => null);

function renderizarCampo(propriedades, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <NavigationField {...propriedades} />
        </ThemeProvider>
    );
}

describe('NavigationField', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renderiza o label e as informações de acessibilidade', async () => {
        await renderizarCampo({
            label: 'Configurações de perfil',
            onPress: jest.fn()
        });

        const botao = screen.getByRole('button', {
            name: 'Configurações de perfil'
        });

        expect(screen.getByText('Configurações de perfil')).toBeOnTheScreen();

        expect(botao).toHaveProp('accessibilityHint', 'Abre outra tela ou painel');
    });

    test('executa a ação quando pressionado', async () => {
        const onPress = jest.fn();

        await renderizarCampo({
            label: 'Alterar senha',
            onPress
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Alterar senha'
            })
        );

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    test('fica desabilitado sem ação', async () => {
        await renderizarCampo({
            label: 'Sem ação'
        });

        expect(
            screen.getByRole('button', {
                name: 'Sem ação'
            })
        ).toBeDisabled();
    });

    test('não executa ação quando está desabilitado', async () => {
        const onPress = jest.fn();

        await renderizarCampo({
            label: 'Campo desabilitado',
            desabilitado: true,
            onPress
        });

        const botao = screen.getByRole('button', {
            name: 'Campo desabilitado'
        });

        expect(botao).toBeDisabled();

        await fireEvent.press(botao);

        expect(onPress).not.toHaveBeenCalled();
    });

    test('limita o label a duas linhas', async () => {
        const label = 'Texto comprido para verificar o limite de linhas';

        await renderizarCampo({
            label,
            onPress: jest.fn()
        });

        expect(screen.getByText(label)).toHaveProp('numberOfLines', 2);
    });

    test('usa a variante com borda por padrão', async () => {
        await renderizarCampo({
            label: 'Com borda',
            onPress: jest.fn()
        });

        expect(
            screen.getByRole('button', {
                name: 'Com borda'
            })
        ).toHaveStyle({
            minHeight: 57.4,
            borderWidth: 0.7,
            paddingHorizontal: 12,
            paddingVertical: 9
        });
    });

    test('usa a variante sem borda', async () => {
        await renderizarCampo({
            label: 'Sem borda',
            variante: 'semBorda',
            onPress: jest.fn()
        });

        expect(
            screen.getByRole('button', {
                name: 'Sem borda'
            })
        ).toHaveStyle({
            borderWidth: 0,
            minHeight: 56,
            paddingHorizontal: 13
        });
    });

    test('usa a variante botão', async () => {
        await renderizarCampo({
            label: 'Botão',
            variante: 'botao',
            onPress: jest.fn()
        });

        expect(
            screen.getByRole('button', {
                name: 'Botão'
            })
        ).toHaveStyle({
            minHeight: 56,
            paddingHorizontal: 14,
            paddingVertical: 11
        });
    });

    test('renderiza ícone menor na variante com borda', async () => {
        await renderizarCampo({
            label: 'Ícone normal',
            icone: IconeTeste,
            onPress: jest.fn()
        });

        expect(IconeTeste).toHaveBeenCalledWith(
            expect.objectContaining({
                size: 20,
                weight: 'regular'
            }),
            undefined
        );
    });

    test.each(['semBorda', 'botao'])('renderiza ícone maior na variante %s', async (variante) => {
        await renderizarCampo({
            label: `Variante ${variante}`,
            variante,
            icone: IconeTeste,
            onPress: jest.fn()
        });

        expect(IconeTeste).toHaveBeenCalledWith(
            expect.objectContaining({
                size: 24,
                weight: 'regular'
            }),
            undefined
        );
    });

    test.each([
        ['corVerde', tema.cores.icones.configuracoes.verde.icone],
        ['corAzul', tema.cores.icones.configuracoes.azul.icone],
        ['corLaranja', tema.cores.icones.configuracoes.laranja.icone],
        ['corVermelho', tema.cores.icones.anticoncepcionais.vermelho.icone],
        ['corVerde2', tema.cores.icones.anticoncepcionais.verde.icone]
    ])('usa a cor correta da paleta %s', async (paleta, corEsperada) => {
        await renderizarCampo({
            label: `Paleta ${paleta}`,
            paleta,
            icone: IconeTeste,
            onPress: jest.fn()
        });

        expect(IconeTeste).toHaveBeenCalledWith(
            expect.objectContaining({
                color: corEsperada
            }),
            undefined
        );
    });

    test('usa verde para paleta desconhecida', async () => {
        await renderizarCampo({
            label: 'Paleta desconhecida',
            paleta: 'paletaInexistente',
            icone: IconeTeste,
            onPress: jest.fn()
        });

        expect(IconeTeste).toHaveBeenCalledWith(
            expect.objectContaining({
                color: tema.cores.icones.configuracoes.verde.icone
            }),
            undefined
        );
    });

    test('usa as cores do tema claro', async () => {
        await renderizarCampo({
            label: 'Tema claro',
            onPress: jest.fn()
        });

        expect(
            screen.getByRole('button', {
                name: 'Tema claro'
            })
        ).toHaveStyle({
            backgroundColor: '#FFFFFF',
            borderColor: '#E6E2D8'
        });

        expect(screen.getByText('Tema claro')).toHaveStyle({
            color: '#222222'
        });
    });

    test('usa as cores do tema escuro', async () => {
        await renderizarCampo(
            {
                label: 'Tema escuro',
                onPress: jest.fn()
            },
            'escuro'
        );

        expect(
            screen.getByRole('button', {
                name: 'Tema escuro'
            })
        ).toHaveStyle({
            backgroundColor: '#232926',
            borderColor: '#4A514D'
        });

        expect(screen.getByText('Tema escuro')).toHaveStyle({
            color: '#F4F1EA'
        });
    });

    test('atualiza a cor da seta no tema escuro', async () => {
        await renderizarCampo(
            {
                label: 'Com seta',
                onPress: jest.fn()
            },
            'escuro'
        );

        expect(mockCaretRightIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                color: '#A3A8A5',
                weight: 'regular'
            })
        );
    });

    test('não tenta renderizar ícone quando ele não é informado', async () => {
        await renderizarCampo({
            label: 'Sem ícone',
            onPress: jest.fn()
        });

        expect(IconeTeste).not.toHaveBeenCalled();
    });
});
