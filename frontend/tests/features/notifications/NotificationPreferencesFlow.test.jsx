import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { NotificationPreferencesFlow } from '../../../src/features/notifications/NotificationPreferencesFlow';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

const iniciais = { horarioLembreteDiario: '20:00', antecedenciaProximoCiclo: 2, lembreteDiarioAtivo: true };
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

test('abre as três categorias, percorre as seções e volta à origem', async () => {
    const onVoltar = await montar({ buscar: jest.fn().mockResolvedValue(iniciais) });
    for (const [categoria, ultimoGrupo, ultimoEvento] of [
        ['Ciclo e Previsões', 'Diário', 'Comparação de períodos'],
        ['Anticoncepcional', 'Validade', 'Validade atingida'],
        ['Rede de Apoio', 'Consentimento Parental', 'Aplicações e trocas']
    ]) {
        await tocar(categoria);
        expect(screen.getByRole('switch', { name: ultimoGrupo })).toBeOnTheScreen();
        await tocar('Personalizar notificações');
        expect(screen.getByRole('switch', { name: ultimoEvento })).toBeOnTheScreen();
        await tocar('Voltar');
        await tocar('Voltar');
    }
    await tocar('Voltar');
    expect(onVoltar).toHaveBeenCalledTimes(1);
});

test('abre a tela temporária no desenvolvimento e volta para Notificações', async () => {
    const onVoltar = await montar({ buscar: jest.fn().mockResolvedValue(iniciais) });
    await tocar('Teste de notificações');
    expect(screen.getByRole('header', { name: 'Teste de notificações' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Convite aceito' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Convite recusado' })).toBeOnTheScreen();
    await tocar('Voltar');
    expect(screen.getByRole('button', { name: 'Ciclo e Previsões' })).toBeOnTheScreen();
    expect(onVoltar).not.toHaveBeenCalled();
});

test('mantém a categoria aberta e recupera as preferências após uma falha de leitura', async () => {
    let concluirLeitura;
    const buscar = jest.fn()
        .mockRejectedValueOnce(new Error('falha de leitura'))
        .mockImplementationOnce(() => new Promise((resolver) => { concluirLeitura = resolver; }));

    await montar({ buscar });
    await tocar('Ciclo e Previsões');
    expect(screen.getByRole('header', { name: 'Ciclo e Previsões' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Algo deu errado' })).toBeOnTheScreen();
    expect(screen.getByText('Não foi possível carregar suas preferências de notificação.'))
        .toBeOnTheScreen();

    await tocar('Tentar novamente');
    expect(buscar).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText('Carregando preferências')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).toBeNull();

    await act(async () => concluirLeitura(iniciais));
    expect(screen.getByRole('switch', { name: 'Diário' })).toBeOnTheScreen();
}, 60_000);

test('confirma o horário, preserva a alteração com erro e bloqueia repetição durante o envio', async () => {
    let rejeitar;
    const atualizar = jest.fn()
        .mockImplementationOnce(() => new Promise((_resolver, falhar) => { rejeitar = falhar; }))
        .mockResolvedValue({ ...iniciais, horarioLembreteDiario: '21:30' });
    await montar({ buscar: jest.fn().mockResolvedValue(iniciais), atualizar });
    await tocar('Ciclo e Previsões');
    await tocar('Personalizar notificações');
    await tocar('Horário do lembrete diário');
    await fireEvent.changeText(screen.getByLabelText('Horário'), '2130');
    const confirmar = screen.getByRole('button', { name: 'Confirmar horários', disabled: false });
    await fireEvent.press(confirmar);
    await fireEvent.press(confirmar);
    expect(atualizar).toHaveBeenCalledTimes(1);
    await act(async () => rejeitar(new Error('falha')));
    expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();
    await tocar('Tentar novamente');
    expect(atualizar.mock.calls).toEqual([
        [{ chave: 'horarioLembreteDiario', valor: '21:30' }],
        [{ chave: 'horarioLembreteDiario', valor: '21:30' }]
    ]);
    await tocar('Horário do lembrete diário');
    expect(screen.getByLabelText('Horário')).toHaveDisplayValue('21:30');
}, 60_000);
