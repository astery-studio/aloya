// Confirma a posição do rodapé e as cores do layout.
import { render, screen, within } from '@testing-library/react-native';
import { Text } from 'react-native';

import { SettingsLayout } from '../../../../src/features/settings/layouts/SettingsLayout/SettingsLayout';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function renderizarLayout(propriedades = {}, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <SettingsLayout titulo="Configurações" {...propriedades}>
                <Text>Campos da tela</Text>
            </SettingsLayout>
        </ThemeProvider>
    );
}

describe('SettingsLayout com rodapé', () => {
    test('mantém o rodapé fixo fora da rolagem', async () => {
        await renderizarLayout({
            titulo: 'Nova Categoria',
            rodapeFixo: true,
            rodape: <Text>Salvar categoria</Text>
        });

        const rolagem = screen.getByTestId('rolagem-settings-layout');

        expect(within(rolagem).getByText('Campos da tela')).toBeOnTheScreen();

        expect(within(rolagem).queryByText('Salvar categoria')).toBeNull();

        expect(screen.getByTestId('rodape-fixo-settings-layout')).toBeOnTheScreen();

        expect(screen.getByText('Salvar categoria')).toBeOnTheScreen();
    });

    test('preserva o rodapé rolável', async () => {
        await renderizarLayout({
            rodape: <Text>Ação existente</Text>
        });

        expect(
            within(screen.getByTestId('rolagem-settings-layout')).getByText('Ação existente')
        ).toBeOnTheScreen();

        expect(screen.queryByTestId('rodape-fixo-settings-layout')).toBeNull();
    });

    test('não renderiza rodapé quando ausente', async () => {
        await renderizarLayout();

        expect(screen.queryByTestId('rodape-settings-layout')).toBeNull();

        expect(screen.queryByTestId('rodape-fixo-settings-layout')).toBeNull();
    });

    test('usa fundo claro', async () => {
        await renderizarLayout({}, 'claro');

        expect(screen.getByTestId('settings-layout')).toHaveStyle({
            backgroundColor: '#F7F5F0'
        });

        expect(screen.getByTestId('rolagem-settings-layout').props.contentContainerStyle).toEqual(
            expect.objectContaining({
                backgroundColor: '#F7F5F0'
            })
        );
    });

    test('usa fundo e rodapé escuros', async () => {
        await renderizarLayout(
            {
                rodapeFixo: true,
                rodape: <Text>Salvar</Text>
            },
            'escuro'
        );

        expect(screen.getByTestId('settings-layout')).toHaveStyle({
            backgroundColor: '#181C1A'
        });

        expect(screen.getByTestId('rodape-fixo-settings-layout')).toHaveStyle({
            backgroundColor: '#181C1A',
            borderTopColor: '#353C38'
        });
    });

    test('atualiza o fundo quando o tema muda', async () => {
        const resultado = await renderizarLayout({}, 'claro');

        expect(screen.getByTestId('settings-layout')).toHaveStyle({
            backgroundColor: '#F7F5F0'
        });

        await resultado.rerender(
            <ThemeProvider preferencia="escuro" esquemaDoSistema="light">
                <SettingsLayout titulo="Configurações">
                    <Text>Campos da tela</Text>
                </SettingsLayout>
            </ThemeProvider>
        );

        expect(screen.getByTestId('settings-layout')).toHaveStyle({
            backgroundColor: '#181C1A'
        });
    });
});
