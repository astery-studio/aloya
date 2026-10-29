import { fireEvent, render, screen } from '@testing-library/react-native';

const mockUsersIcon = jest.fn(() => null);

const mockArrowsClockwiseIcon = jest.fn(() => null);

const mockHouseIcon = jest.fn(() => null);

const mockCalendarBlankIcon = jest.fn(() => null);

const mockGearIcon = jest.fn(() => null);

jest.mock('phosphor-react-native/src/icons/Users', () => ({
    UsersIcon: (propriedades) => mockUsersIcon(propriedades)
}));

jest.mock('phosphor-react-native/src/icons/ArrowsClockwise', () => ({
    ArrowsClockwiseIcon: (propriedades) => mockArrowsClockwiseIcon(propriedades)
}));

jest.mock('phosphor-react-native/src/icons/House', () => ({
    HouseIcon: (propriedades) => mockHouseIcon(propriedades)
}));

jest.mock('phosphor-react-native/src/icons/CalendarBlank', () => ({
    CalendarBlankIcon: (propriedades) => mockCalendarBlankIcon(propriedades)
}));

jest.mock('phosphor-react-native/src/icons/Gear', () => ({
    GearIcon: (propriedades) => mockGearIcon(propriedades)
}));

import { BottomTabBar } from '../../../../src/shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function renderizarBarra(propriedades = {}, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <BottomTabBar abaAtiva="inicio" onSelecionar={jest.fn()} {...propriedades} />
        </ThemeProvider>
    );
}

describe('BottomTabBar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renderiza as cinco abas na ordem correta', async () => {
        await renderizarBarra();

        const itens = screen.getAllByRole('tab');

        expect(itens).toHaveLength(5);

        expect(itens[0]).toHaveAccessibleName('Membros');

        expect(itens[1]).toHaveAccessibleName('Ciclos');

        expect(itens[2]).toHaveAccessibleName('Início');

        expect(itens[3]).toHaveAccessibleName('Diário');

        expect(itens[4]).toHaveAccessibleName('Config.');
    });

    test('renderiza um ícone para cada aba', async () => {
        await renderizarBarra();

        expect(mockUsersIcon).toHaveBeenCalledTimes(1);

        expect(mockArrowsClockwiseIcon).toHaveBeenCalledTimes(1);

        expect(mockHouseIcon).toHaveBeenCalledTimes(1);

        expect(mockCalendarBlankIcon).toHaveBeenCalledTimes(1);

        expect(mockGearIcon).toHaveBeenCalledTimes(1);
    });

    test('marca somente a aba informada como ativa', async () => {
        await renderizarBarra({
            abaAtiva: 'inicio'
        });

        expect(
            screen.getByRole('tab', {
                name: 'Início'
            })
        ).toBeSelected();

        for (const nome of ['Membros', 'Ciclos', 'Diário', 'Config.']) {
            expect(
                screen.getByRole('tab', {
                    name: nome
                })
            ).not.toBeSelected();
        }
    });

    test('não seleciona aba para identificador desconhecido', async () => {
        await renderizarBarra({
            abaAtiva: 'abaInexistente'
        });

        for (const item of screen.getAllByRole('tab')) {
            expect(item).not.toBeSelected();
        }
    });

    test.each([
        ['Membros', 'membros'],
        ['Ciclos', 'ciclos'],
        ['Início', 'inicio'],
        ['Diário', 'diario'],
        ['Config.', 'configuracoes']
    ])('envia %s ao selecionar a aba', async (label, idEsperado) => {
        const onSelecionar = jest.fn();

        await renderizarBarra({
            onSelecionar
        });

        await fireEvent.press(
            screen.getByRole('tab', {
                name: label
            })
        );

        expect(onSelecionar).toHaveBeenCalledWith(idEsperado);
    });

    test('desabilita todas as abas sem callback', async () => {
        await renderizarBarra({
            onSelecionar: undefined
        });

        const itens = screen.getAllByRole('tab');

        expect(itens).toHaveLength(5);

        for (const item of itens) {
            expect(item).toBeDisabled();
        }
    });

    test('altera a seleção quando abaAtiva muda', async () => {
        const resultado = await renderizarBarra({
            abaAtiva: 'inicio'
        });

        expect(
            screen.getByRole('tab', {
                name: 'Início'
            })
        ).toBeSelected();

        await resultado.rerender(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <BottomTabBar abaAtiva="diario" onSelecionar={jest.fn()} />
            </ThemeProvider>
        );

        expect(
            screen.getByRole('tab', {
                name: 'Início'
            })
        ).not.toBeSelected();

        expect(
            screen.getByRole('tab', {
                name: 'Diário'
            })
        ).toBeSelected();
    });

    test('usa superfície e borda claras', async () => {
        await renderizarBarra({}, 'claro');

        expect(screen.getByTestId('bottom-tab-bar')).toHaveStyle({
            height: 91,
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E6E2D8'
        });
    });

    test('usa superfície e borda escuras', async () => {
        await renderizarBarra({}, 'escuro');

        expect(screen.getByTestId('bottom-tab-bar')).toHaveStyle({
            height: 91,
            backgroundColor: '#232926',
            borderTopColor: '#4A514D'
        });
    });

    test('atualiza a superfície quando o tema muda', async () => {
        const resultado = await renderizarBarra({}, 'claro');

        expect(screen.getByTestId('bottom-tab-bar')).toHaveStyle({
            backgroundColor: '#FFFFFF'
        });

        await resultado.rerender(
            <ThemeProvider preferencia="escuro" esquemaDoSistema="light">
                <BottomTabBar abaAtiva="inicio" onSelecionar={jest.fn()} />
            </ThemeProvider>
        );

        expect(screen.getByTestId('bottom-tab-bar')).toHaveStyle({
            backgroundColor: '#232926'
        });
    });
});
