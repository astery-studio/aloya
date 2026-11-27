import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { NotificationsScreen } from '../../../src/features/notifications/screens/NotificationsScreen';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

test('apresenta a categoria Rede de Apoio e permite voltar', async () => {
    const onAbrirCategoria = jest.fn();
    const onVoltar = jest.fn();
    await render(
        <SafeAreaInsetsContext.Provider value={{ top: 0, bottom: 0, left: 0, right: 0 }}>
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <NotificationsScreen onAbrirCategoria={onAbrirCategoria} onVoltar={onVoltar} />
            </ThemeProvider>
        </SafeAreaInsetsContext.Provider>
    );
    const botoes = screen.getAllByRole('button');
    expect(botoes.map((botao) => botao.props.accessibilityLabel)).toEqual([
        'Voltar', 'Rede de Apoio'
    ]);
    for (const botao of botoes) await fireEvent.press(botao);
    expect(onAbrirCategoria).toHaveBeenCalledTimes(1);
    expect(onVoltar).toHaveBeenCalledTimes(1);
});
