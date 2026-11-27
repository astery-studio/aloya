import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { NotificationPreferencesFlow } from '../../../src/features/notifications/NotificationPreferencesFlow';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

jest.mock('../../../src/shared/components/feedback/SelectionSheet/SelectionSheet', () => {
    const { useEffect, useRef } = require('react');
    const { Pressable, Text } = require('react-native');
    return { SelectionSheet({ visivel, opcoes, valorSelecionado, onSelecionar, onOcultar }) {
        const estavaVisivel = useRef(false);
        useEffect(() => {
            if (!visivel && estavaVisivel.current) onOcultar?.();
            estavaVisivel.current = visivel;
        }, [visivel, onOcultar]);
        return visivel ? opcoes.map(({ id, label }) => (
            <Pressable key={id} accessibilityRole="button" accessibilityLabel={label}
                accessibilityState={{ selected: id === valorSelecionado }} onPress={() => onSelecionar(id)}>
                <Text>{label}</Text>
            </Pressable>
        )) : null;
    } };
});

test('edita os mesmos avisos por grupo ou individualmente e recarrega antecedência zero', async () => {
    let valores = { antecedenciaProximoCiclo: 2 };
    const service = {
        buscar: jest.fn(async () => valores),
        atualizar: jest.fn(async ({ chave, valor }) => {
            const alteracoes = chave === 'ciclo.menstrual'
                ? { 'ciclo.menstrual.proxima': valor, 'ciclo.menstrual.confirmacao': valor }
                : { [chave]: valor };
            valores = { ...valores, ...alteracoes };
            return valores;
        })
    };
    const montar = () => render(
        <SafeAreaInsetsContext.Provider value={{ top: 0, bottom: 0, left: 0, right: 0 }}>
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <NotificationPreferencesFlow service={service} onVoltar={jest.fn()} />
            </ThemeProvider>
        </SafeAreaInsetsContext.Provider>
    );
    const tocar = (nome) => fireEvent.press(screen.getByRole('button', { name: nome }));
    const alternar = (nome) => fireEvent.press(screen.getByRole('switch', { name: nome }));
    const primeiraTela = await montar();
    await tocar('Ciclo e Previsões');
    await tocar('Personalizar notificações');
    await alternar('Próxima menstruação');
    await tocar('Quando notificar o próximo ciclo');
    expect(['Somente no dia', '1 dia antes', '2 dias antes', '3 dias antes', '4 dias antes', '5 dias antes']
        .every((name) => screen.queryByRole('button', { name }))).toBe(true);
    expect(screen.getByRole('button', { name: '2 dias antes', selected: true })).toBeOnTheScreen();
    await tocar('Somente no dia');
    expect(valores.antecedenciaProximoCiclo).toBe(0);
    await tocar('Voltar');
    await alternar('Ciclo Menstrual');
    expect(screen.getByRole('switch', { name: 'Ciclo Menstrual', checked: false })).toBeOnTheScreen();
    await tocar('Personalizar notificações');
    expect(screen.queryByText(/Grupo pausado/)).toBeNull();
    expect(screen.getByRole('switch', {
        name: 'Próxima menstruação', checked: false, disabled: false
    })).toBeOnTheScreen();
    await alternar('Confirmação do início do ciclo');
    expect(valores['ciclo.menstrual.proxima']).toBe(false);
    await tocar('Voltar');
    expect(screen.getByRole('switch', { name: 'Ciclo Menstrual', checked: true })).toBeOnTheScreen();
    await alternar('Ciclo Menstrual');
    await alternar('Ciclo Menstrual');
    await tocar('Personalizar notificações');
    expect(screen.getByRole('switch', { name: 'Confirmação do início do ciclo', checked: true }))
        .toBeOnTheScreen();
    await alternar('Confirmação do início do ciclo');
    await primeiraTela.unmount();

    await montar();
    await tocar('Ciclo e Previsões');
    await tocar('Personalizar notificações');
    expect(screen.getByRole('switch', { name: 'Próxima menstruação', checked: true, disabled: false }))
        .toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Confirmação do início do ciclo', checked: false, disabled: false }))
        .toBeOnTheScreen();
    await tocar('Quando notificar o próximo ciclo');
    expect(screen.getByRole('button', { name: 'Somente no dia', selected: true })).toBeOnTheScreen();
    expect(service.buscar).toHaveBeenCalledTimes(2);
}, 60_000);
