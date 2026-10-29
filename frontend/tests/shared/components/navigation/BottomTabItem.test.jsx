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

        expect(
            screen.getByRole('tab', {
                name: 'Início'
            })
        ).toBeOnTheScreen();
    });

    test('executa a ação quando pressionado', async () => {
        const onPress = jest.fn();

        await renderizarItem({
            label: 'Diário',
            onPress
        });

        await fireEvent.press(
            screen.getByRole('tab', {
                name: 'Diário'
            })
        );

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    test('fica desabilitado sem ação', async () => {
        await renderizarItem({
            label: 'Configurações'
        });

        expect(
            screen.getByRole('tab', {
                name: 'Configurações'
            })
        ).toBeDisabled();
    });

    test('informa quando está ativo', async () => {
        await renderizarItem({
            ativo: true,
            onPress: jest.fn()
        });

        const aba = screen.getByRole('tab', {
            name: 'Início'
        });

        expect(aba).toBeSelected();
        expect(aba).toBeEnabled();

        expect(screen.getByTestId('indicador-aba-Início')).toBeOnTheScreen();
    });

    test('não mostra indicador quando está inativo', async () => {
        await renderizarItem({
            label: 'Membros',
            onPress: jest.fn()
        });

        expect(
            screen.getByRole('tab', {
                name: 'Membros'
            })
        ).not.toBeSelected();

        expect(screen.queryByTestId('indicador-aba-Membros')).toBeNull();
    });

    test('usa destaque escuro no tema claro', async () => {
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

        expect(screen.getByTestId('indicador-aba-Início')).toHaveStyle({
            backgroundColor: '#2C4C3B'
        });
    });

    test('usa destaque claro no tema escuro', async () => {
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
                color: '#9FD6B6',
                weight: 'fill'
            })
        );

        expect(screen.getByText('Diário')).toHaveStyle({
            color: '#9FD6B6'
        });

        expect(screen.getByTestId('indicador-aba-Diário')).toHaveStyle({
            backgroundColor: '#9FD6B6'
        });
    });

    test('usa texto secundário no item inativo claro', async () => {
        await renderizarItem({
            label: 'Ciclos',
            onPress: jest.fn()
        });

        expect(IconeTeste.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                size: 26,
                color: '#5C5C59',
                weight: 'regular'
            })
        );

        expect(screen.getByText('Ciclos')).toHaveStyle({
            color: '#5C5C59'
        });
    });

    test('usa texto secundário no item inativo escuro', async () => {
        await renderizarItem(
            {
                label: 'Ciclos',
                onPress: jest.fn()
            },
            'escuro'
        );

        expect(IconeTeste.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                size: 26,
                color: '#C4C8C5',
                weight: 'regular'
            })
        );

        expect(screen.getByText('Ciclos')).toHaveStyle({
            color: '#C4C8C5'
        });
    });

    test('mantém o label em uma linha', async () => {
        await renderizarItem({
            label: 'Configurações',
            onPress: jest.fn()
        });

        expect(screen.getByText('Configurações')).toHaveProp('numberOfLines', 1);
    });

    test('atualiza a cor ativa quando o tema muda', async () => {
        const resultado = await renderizarItem(
            {
                label: 'Início',
                ativo: true,
                onPress: jest.fn()
            },
            'claro'
        );

        expect(screen.getByText('Início')).toHaveStyle({
            color: '#2C4C3B'
        });

        await resultado.rerender(
            <ThemeProvider preferencia="escuro" esquemaDoSistema="light">
                <BottomTabItem label="Início" icone={IconeTeste} ativo onPress={jest.fn()} />
            </ThemeProvider>
        );

        expect(screen.getByText('Início')).toHaveStyle({
            color: '#9FD6B6'
        });
    });
});
