import { fireEvent, render, screen } from '@testing-library/react-native';
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

test('guarda escolhas individuais ao alternar o grupo e recarrega antecedência zero', async () => {
    let valores = { antecedenciaProximoCiclo: 2 };
    const service = {
        buscar: jest.fn(async () => valores),
        atualizar: jest.fn(async ({ chave, valor }) => (valores = { ...valores, [chave]: valor }))
    };
    const montar = () => render(
        <ThemeProvider preferencia="claro" esquemaDoSistema="light">
            <NotificationPreferencesFlow service={service} onVoltar={jest.fn()} />
        </ThemeProvider>
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
    await alternar('Ciclo Menstrual');
    await primeiraTela.unmount();

    await montar();
    await tocar('Ciclo e Previsões');
    await tocar('Personalizar notificações');
    expect(screen.getByRole('switch', { name: 'Próxima menstruação', checked: true })).toBeOnTheScreen();
    await tocar('Quando notificar o próximo ciclo');
    expect(screen.getByRole('button', { name: 'Somente no dia', selected: true })).toBeOnTheScreen();
    expect(service.buscar).toHaveBeenCalledTimes(2);
}, 60_000);
