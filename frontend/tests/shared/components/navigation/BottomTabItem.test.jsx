import { fireEvent, render, screen } from '@testing-library/react-native';

import { BottomTabItem } from '../../../../src/shared/components/navigation/BottomTab/BottomTabItem/BottomTabItem';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

const IconeTeste = jest.fn(() => null);

function renderizarItem(propriedades = {}, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <BottomTabItem label="Início" icone={IconeTeste} {...propriedades} />
        </ThemeProvider>
    );
}

describe('BottomTabItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renderiza o label como aba', async () => {
        await renderizarItem({
            onPress: jest.fn()
        });

        expect(screen.getByText('Início')).toBeOnTheScreen();
        expect(screen.getByRole('tab', { name: 'Início' })).toBeOnTheScreen();
    });

    test('executa a ação quando pressionado', async () => {
        const onPress = jest.fn();

        await renderizarItem({
            label: 'Diário',
            onPress
        });

        await fireEvent.press(screen.getByRole('tab', { name: 'Diário' }));

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    test('fica desabilitado sem ação', async () => {
        await renderizarItem({
            label: 'Configurações'
        });

        expect(screen.getByRole('tab', { name: 'Configurações' })).toBeDisabled();
    });

    test('informa quando está ativo sem renderizar bolinha', async () => {
        await renderizarItem({
            ativo: true,
            onPress: jest.fn()
        });

        const aba = screen.getByRole('tab', { name: 'Início' });

        expect(aba).toBeSelected();
        expect(aba).toBeEnabled();
        expect(screen.queryByTestId('indicador-aba-Início')).toBeNull();
    });

    test('usa ícone preenchido e texto destacado no estado ativo claro', async () => {
        await renderizarItem({
            ativo: true,
            onPress: jest.fn()
        });

        expect(IconeTeste.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                size: 26,
                color: '#2C4C3B',
                weight: 'fill'
            })
        );

        expect(screen.getByText('Início')).toHaveStyle({
            color: '#2C4C3B'
        });
    });

    test('usa destaque correspondente ao tema escuro', async () => {
        await renderizarItem(
            {
                label: 'Diário',
                ativo: true,
                onPress: jest.fn()
            },
            'escuro'
        );

        expect(IconeTeste.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                size: 26,
                color: '#A5D6A7',
                weight: 'fill'
            })
        );

        expect(screen.getByText('Diário')).toHaveStyle({
            color: '#A5D6A7'
        });
    });

    test('usa ícone regular no estado inativo', async () => {
        await renderizarItem({
            label: 'Calendário',
            onPress: jest.fn()
        });

        expect(IconeTeste.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                size: 26,
                color: '#5C5C59',
                weight: 'regular'
            })
        );

        expect(screen.getByText('Calendário')).toHaveStyle({
            color: '#5C5C59'
        });
    });

    test('aplica as medidas do item', async () => {
        await renderizarItem({
            onPress: jest.fn()
        });

        expect(screen.getByRole('tab', { name: 'Início' })).toHaveStyle({
            flex: 1,
            maxWidth: 73.198,
            minWidth: 0,
            height: 53.5,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4
        });
    });

    test('mantém o label em uma linha', async () => {
        await renderizarItem({
            label: 'Calendário',
            onPress: jest.fn()
        });

        expect(screen.getByText('Calendário')).toHaveProp('numberOfLines', 1);
    });
});
