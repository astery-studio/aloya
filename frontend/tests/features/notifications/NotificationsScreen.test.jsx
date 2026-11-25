import { fireEvent, render, screen } from '@testing-library/react-native';
import { NotificationsScreen } from '../../../src/features/notifications/screens/NotificationsScreen';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

test('apresenta as três categorias na ordem do protótipo e permite voltar', async () => {
    const onAbrirCategoria = jest.fn();
    const onVoltar = jest.fn();
    await render(
        <ThemeProvider preferencia="claro" esquemaDoSistema="light">
            <NotificationsScreen onAbrirCategoria={onAbrirCategoria} onVoltar={onVoltar} />
        </ThemeProvider>
    );
    const botoes = screen.getAllByRole('button');
    expect(botoes.map((botao) => botao.props.accessibilityLabel)).toEqual([
        'Voltar', 'Ciclo e Previsões', 'Anticoncepcional', 'Rede de Apoio'
    ]);
    for (const botao of botoes) await fireEvent.press(botao);
    expect(onAbrirCategoria.mock.calls.flat()).toEqual(['ciclo', 'anticoncepcional', 'redeApoio']);
    expect(onVoltar).toHaveBeenCalledTimes(1);
});
