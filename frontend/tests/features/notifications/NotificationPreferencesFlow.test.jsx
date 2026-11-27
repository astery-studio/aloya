import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { NotificationPreferencesFlow } from '../../../src/features/notifications/NotificationPreferencesFlow';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

const tocar = (nome) => fireEvent.press(screen.getByRole('button', { name: nome }));

async function montar(service) {
    const onVoltar = jest.fn();
    await render(
        <SafeAreaInsetsContext.Provider value={{ top: 0, bottom: 0, left: 0, right: 0 }}>
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <NotificationPreferencesFlow service={service} onVoltar={onVoltar} />
            </ThemeProvider>
        </SafeAreaInsetsContext.Provider>
    );
    return onVoltar;
}

test('mantém a preferência de contato pendente quando o limite é atingido', async () => {
    const chave = 'redeApoio.convites.recebido';
    const preferencias = { chavesDisponiveis: [chave], [chave]: true };
    const atualizar = jest
        .fn()
        .mockRejectedValueOnce({ status: 429 })
        .mockResolvedValue({ ...preferencias, [chave]: false });
    await montar({ buscar: jest.fn().mockResolvedValue(preferencias), atualizar });
    await tocar('Rede de Apoio');
    await tocar('Personalizar notificações');
    await fireEvent.press(screen.getByRole('switch', { name: 'Novo convite recebido' }));
    expect(await screen.findByText('Muitas alterações seguidas')).toBeOnTheScreen();
    await tocar('Tentar novamente');
    expect(atualizar.mock.calls).toEqual([[{ chave, valor: false }], [{ chave, valor: false }]]);
});

test('contato personaliza apenas os grupos e avisos autorizados', async () => {
    const dica = 'redeApoio.dicas.apoio';
    const preferencias = {
        chavesDisponiveis: [dica, 'redeApoio.diario.energia', 'redeApoio.convites.recebido'],
        [dica]: false
    };
    const atualizar = jest.fn().mockResolvedValue({ ...preferencias, [dica]: true });
    const onVoltar = await montar({ buscar: jest.fn().mockResolvedValue(preferencias), atualizar });

    expect(screen.queryByRole('button', { name: 'Ciclo e Previsões' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Anticoncepcional' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Teste de notificações' })).toBeNull();
    await tocar('Rede de Apoio');
    expect(screen.getByRole('switch', { name: 'Dicas de Apoio' })).toBeOnTheScreen();
    expect(screen.queryByRole('switch', { name: 'Ciclo Compartilhado' })).toBeNull();
    await tocar('Personalizar notificações');
    expect(screen.getByRole('switch', { name: 'Energia e Sono' })).toBeOnTheScreen();
    expect(screen.queryByRole('switch', { name: 'Vida Íntima e Social' })).toBeNull();
    expect(screen.queryByRole('switch', { name: 'Convite aceito ou recusado' })).toBeNull();
    await fireEvent.press(screen.getByRole('switch', { name: 'Receber dicas de como apoiar' }));
    expect(atualizar).toHaveBeenCalledWith({ chave: dica, valor: true });
    expect(screen.getByRole('switch', { name: 'Receber dicas de como apoiar', checked: true }))
        .toBeOnTheScreen();
    await tocar('Voltar');
    await tocar('Voltar');
    await tocar('Voltar');
    expect(onVoltar).toHaveBeenCalledTimes(1);
});

test('revalida as opções da Rede de Apoio ao abrir a configuração individual', async () => {
    const dica = 'redeApoio.dicas.apoio';
    const convite = 'redeApoio.convites.recebido';
    const liberadas = { chavesDisponiveis: [dica, convite], [dica]: true };
    const buscar = jest.fn().mockResolvedValue(liberadas);
    await montar({ buscar });
    await tocar('Rede de Apoio');
    expect(await screen.findByRole('switch', { name: 'Dicas de Apoio' })).toBeOnTheScreen();

    buscar.mockResolvedValue({ chavesDisponiveis: [convite] });
    await tocar('Personalizar notificações');
    expect(await screen.findByRole('switch', { name: 'Novo convite recebido' })).toBeOnTheScreen();
    expect(screen.queryByRole('switch', { name: 'Receber dicas de como apoiar' })).toBeNull();
});
