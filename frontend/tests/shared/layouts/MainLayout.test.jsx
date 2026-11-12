import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

jest.mock('../../../src/shared/components/navigation/Header/Header', () => ({
    Header: jest.fn(() => null)
}));

jest.mock('../../../src/shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar', () => ({
    BottomTabBar: jest.fn(() => null)
}));

import { BottomTabBar } from '../../../src/shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar';
import { Header } from '../../../src/shared/components/navigation/Header/Header';
import { MainLayout } from '../../../src/shared/layouts/MainLayout/MainLayout';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

function renderizarLayout(propriedades = {}, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <MainLayout
                titulo="Configurações"
                abaAtiva="configuracoes"
                onSelecionarAba={jest.fn()}
                {...propriedades}
            >
                <Text>Conteúdo da screen</Text>
            </MainLayout>
        </ThemeProvider>
    );
}

describe('MainLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renderiza o conteúdo recebido', async () => {
        await renderizarLayout();

        expect(screen.getByText('Conteúdo da screen')).toBeOnTheScreen();
    });

    test('envia os dados corretos para o Header', async () => {
        const onVoltar = jest.fn();

        await renderizarLayout({
            titulo: 'Configurações de Perfil',
            varianteHeader: 'comVoltar',
            onVoltar
        });

        const propriedadesHeader = Header.mock.calls[0][0];

        expect(propriedadesHeader.titulo).toBe('Configurações de Perfil');

        expect(propriedadesHeader.variante).toBe('comVoltar');

        expect(propriedadesHeader.onVoltar).toBe(onVoltar);
    });

    test('envia os dados corretos para a navegação inferior', async () => {
        const onSelecionarAba = jest.fn();

        await renderizarLayout({
            abaAtiva: 'ciclos',
            onSelecionarAba
        });

        const propriedadesNavegacao = BottomTabBar.mock.calls[0][0];

        expect(propriedadesNavegacao.abaAtiva).toBe('ciclos');

        expect(propriedadesNavegacao.onSelecionar).toBe(onSelecionarAba);
    });

    test('mantém a estrutura flexível do layout', async () => {
        await renderizarLayout();

        expect(screen.getByTestId('main-layout')).toHaveStyle({
            flex: 1
        });

        expect(screen.getByTestId('conteudo-main-layout')).toHaveStyle({
            flex: 1,
            minHeight: 0
        });
    });

    test('usa o fundo do tema claro', async () => {
        await renderizarLayout({}, 'claro');

        expect(screen.getByTestId('main-layout')).toHaveStyle({
            backgroundColor: '#F7F5F0'
        });

        expect(screen.getByTestId('conteudo-main-layout')).toHaveStyle({
            backgroundColor: '#F7F5F0'
        });
    });

    test('usa o fundo do tema escuro', async () => {
        await renderizarLayout({}, 'escuro');

        expect(screen.getByTestId('main-layout')).toHaveStyle({
            backgroundColor: '#181C1A'
        });

        expect(screen.getByTestId('conteudo-main-layout')).toHaveStyle({
            backgroundColor: '#181C1A'
        });
    });

    test('atualiza o fundo quando o tema muda', async () => {
        const resultado = await renderizarLayout({}, 'claro');

        expect(screen.getByTestId('main-layout')).toHaveStyle({
            backgroundColor: '#F7F5F0'
        });

        await resultado.rerender(
            <ThemeProvider preferencia="escuro" esquemaDoSistema="light">
                <MainLayout
                    titulo="Configurações"
                    abaAtiva="configuracoes"
                    onSelecionarAba={jest.fn()}
                >
                    <Text>Conteúdo da screen</Text>
                </MainLayout>
            </ThemeProvider>
        );

        expect(screen.getByTestId('main-layout')).toHaveStyle({
            backgroundColor: '#181C1A'
        });
    });
});
