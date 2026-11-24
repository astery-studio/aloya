import { fireEvent, render, screen } from '@testing-library/react-native';

const mockUsersIcon = jest.fn(() => null);
const mockCalendarCheckIcon = jest.fn(() => null);
const mockHouseIcon = jest.fn(() => null);
const mockNotebookIcon = jest.fn(() => null);
const mockGearIcon = jest.fn(() => null);

jest.mock('phosphor-react-native/src/icons/Users', () => ({
    UsersIcon: (propriedades) => mockUsersIcon(propriedades)
}));

jest.mock('phosphor-react-native/src/icons/CalendarCheck', () => ({
    CalendarCheckIcon: (propriedades) => mockCalendarCheckIcon(propriedades)
}));

jest.mock('phosphor-react-native/src/icons/House', () => ({
    HouseIcon: (propriedades) => mockHouseIcon(propriedades)
}));

jest.mock('phosphor-react-native/src/icons/Notebook', () => ({
    NotebookIcon: (propriedades) => mockNotebookIcon(propriedades)
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
        expect(itens[0]).toHaveAccessibleName('Contatos');
        expect(itens[1]).toHaveAccessibleName('Calendário');
        expect(itens[2]).toHaveAccessibleName('Início');
        expect(itens[3]).toHaveAccessibleName('Diário');
        expect(itens[4]).toHaveAccessibleName('Config.');
    });

    test('renderiza os novos ícones do menu', async () => {
        await renderizarBarra();

        expect(mockUsersIcon).toHaveBeenCalledTimes(1);
        expect(mockCalendarCheckIcon).toHaveBeenCalledTimes(1);
        expect(mockHouseIcon).toHaveBeenCalledTimes(1);
        expect(mockNotebookIcon).toHaveBeenCalledTimes(1);
        expect(mockGearIcon).toHaveBeenCalledTimes(1);
    });

    test('marca somente a aba informada como ativa', async () => {
        await renderizarBarra({
            abaAtiva: 'inicio'
        });

        expect(screen.getByRole('tab', { name: 'Início' })).toBeSelected();

        for (const nome of ['Contatos', 'Calendário', 'Diário', 'Config.']) {
            expect(screen.getByRole('tab', { name: nome })).not.toBeSelected();
        }
    });

    test('envia os identificadores das rotas de contatos e calendário', async () => {
        const onSelecionar = jest.fn();

        await renderizarBarra({
            onSelecionar
        });

        await fireEvent.press(screen.getByRole('tab', { name: 'Contatos' }));
        expect(onSelecionar).toHaveBeenLastCalledWith('membros');

        await fireEvent.press(screen.getByRole('tab', { name: 'Calendário' }));
        expect(onSelecionar).toHaveBeenLastCalledWith('calendario');
    });

    test.each([
        ['Início', 'inicio'],
        ['Diário', 'diario'],
        ['Config.', 'configuracoes']
    ])('envia %s ao selecionar a aba', async (label, idEsperado) => {
        const onSelecionar = jest.fn();

        await renderizarBarra({
            onSelecionar
        });

        await fireEvent.press(screen.getByRole('tab', { name: label }));

        expect(onSelecionar).toHaveBeenCalledWith(idEsperado);
    });

    test('não seleciona aba para identificador desconhecido', async () => {
        await renderizarBarra({
            abaAtiva: 'abaInexistente'
        });

        for (const item of screen.getAllByRole('tab')) {
            expect(item).not.toBeSelected();
        }
    });

    test('desabilita todas as abas sem callback', async () => {
        await renderizarBarra({
            onSelecionar: undefined
        });

        for (const item of screen.getAllByRole('tab')) {
            expect(item).toBeDisabled();
        }
    });

    test('altera a seleção quando abaAtiva muda', async () => {
        const resultado = await renderizarBarra({
            abaAtiva: 'inicio'
        });

        expect(screen.getByRole('tab', { name: 'Início' })).toBeSelected();

        await resultado.rerender(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <BottomTabBar abaAtiva="diario" onSelecionar={jest.fn()} />
            </ThemeProvider>
        );

        expect(screen.getByRole('tab', { name: 'Início' })).not.toBeSelected();
        expect(screen.getByRole('tab', { name: 'Diário' })).toBeSelected();
    });

    test('aplica as medidas e cores do menu claro', async () => {
        await renderizarBarra({}, 'claro');

        expect(screen.getByTestId('bottom-tab-bar')).toHaveStyle({
            width: '100%',
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0.667,
            borderTopColor: '#E6E2D8'
        });
    });

    test('usa superfície e borda escuras', async () => {
        await renderizarBarra({}, 'escuro');

        expect(screen.getByTestId('bottom-tab-bar')).toHaveStyle({
            backgroundColor: '#1E1E1E',
            borderTopWidth: 0.667,
            borderTopColor: 'rgba(255, 255, 255, 0.12)'
        });
    });
});
