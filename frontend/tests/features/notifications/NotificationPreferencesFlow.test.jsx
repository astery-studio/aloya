import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { NotificationPreferencesFlow } from '../../../src/features/notifications/NotificationPreferencesFlow';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

const iniciais = { horarioLembreteDiario: '20:00', antecedenciaProximoCiclo: 2, lembreteDiarioAtivo: true };
const tocar = (nome) => fireEvent.press(screen.getByRole('button', { name: nome }));

const contraceptivosIniciais = {
    listar: async () => [{ id: '1', tipo: 'diu_hormonal', dataValidade: '2030-01-01' }]
};

async function montar(service, contato = false, contraceptiveService = contraceptivosIniciais) {
    const onVoltar = jest.fn();
    await render(
        <SafeAreaInsetsContext.Provider value={{ top: 0, bottom: 0, left: 0, right: 0 }}>
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <NotificationPreferencesFlow
                    service={service}
                    contraceptiveService={contraceptiveService}
                    contato={contato}
                    onVoltar={onVoltar}
                />
            </ThemeProvider>
        </SafeAreaInsetsContext.Provider>
    );
    return onVoltar;
}

test('explica o limite de alterações e preserva a preferência pendente', async () => {
    const preferencias = { ...iniciais, 'ciclo.menstrual.proxima': true };
    const atualizar = jest.fn().mockRejectedValueOnce({ status: 429 })
        .mockResolvedValue({ ...iniciais, 'ciclo.menstrual': false });
    await montar({ buscar: jest.fn().mockResolvedValue(preferencias), atualizar });
    await tocar('Ciclo e Previsões');
    await fireEvent.press(screen.getByRole('switch', { name: 'Ciclo Menstrual' }));
    expect(await screen.findByText('Muitas alterações seguidas')).toBeOnTheScreen();
    await tocar('Tentar novamente');
    expect(atualizar.mock.calls).toEqual([
        [{ chave: 'ciclo.menstrual', valor: false }],
        [{ chave: 'ciclo.menstrual', valor: false }]
    ]);
});

test('abre as três categorias, percorre as seções e volta à origem', async () => {
    const onVoltar = await montar({ buscar: jest.fn().mockResolvedValue(iniciais) });
    for (const [categoria, ultimoGrupo, ultimoEvento] of [
        ['Ciclo e Previsões', 'Diário', 'Comparação de períodos'],
        ['Anticoncepcional', 'Validade', 'Validade atingida'],
        ['Rede de Apoio', 'Consentimento Parental', 'Aplicações e trocas']
    ]) {
        await tocar(categoria);
        expect(await screen.findByRole('switch', { name: ultimoGrupo })).toBeOnTheScreen();
        await tocar('Personalizar notificações');
        expect(screen.getByRole('switch', { name: ultimoEvento })).toBeOnTheScreen();
        await tocar('Voltar');
        await tocar('Voltar');
    }
    await tocar('Voltar');
    expect(onVoltar).toHaveBeenCalledTimes(1);
});

test('abre o cadastro de anticoncepcional quando não há métodos e atualiza ao voltar', async () => {
    let metodos = [{ id: '1', tipo: 'anel_vaginal', ativo: false }];
    const listar = jest.fn(async () => metodos);
    await montar({ buscar: jest.fn().mockResolvedValue(iniciais) }, false, { listar });
    await tocar('Anticoncepcional');
    expect(await screen.findByText('Nenhum anticoncepcional cadastrado')).toBeOnTheScreen();
    expect(screen.queryByRole('switch')).toBeNull();
    const adicionar = screen.getByRole('button', { name: 'Cadastrar novo anticoncepcional' });
    expect(adicionar).toHaveProp('testID', 'anticoncepcional-notificacoes-adicionar');
    expect(screen.queryByText('Cadastrar anticoncepcional')).toBeNull();
    await fireEvent.press(adicionar);
    expect(await screen.findByRole('header', { name: 'Cadastro de Anticoncepcional' }))
        .toBeOnTheScreen();

    metodos = [{ id: '2', tipo: 'injetavel' }];
    await tocar('Voltar');
    expect(await screen.findByRole('switch', { name: 'Anticoncepcional Injetável' }))
        .toBeOnTheScreen();
    expect(screen.queryByRole('switch', { name: 'Anel Vaginal' })).toBeNull();
});

test('mostra os tipos cadastrados nos controles de grupo e individuais', async () => {
    const listar = jest.fn().mockResolvedValue([
        { id: '1', tipo: 'injetavel' },
        { id: '2', tipo: 'adesivo' },
        { id: '3', tipo: 'anel_vaginal', removido: true }
    ]);
    await montar({ buscar: jest.fn().mockResolvedValue(iniciais) }, false, { listar });
    await tocar('Anticoncepcional');
    expect(await screen.findByRole('switch', { name: 'Anticoncepcional Injetável' }))
        .toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Adesivo Anticoncepcional' })).toBeOnTheScreen();
    expect(screen.queryByRole('switch', { name: 'Anel Vaginal' })).toBeNull();
    expect(screen.queryByRole('switch', { name: 'DIU Hormonal' })).toBeNull();

    await tocar('Personalizar notificações');
    expect(screen.getByRole('switch', { name: 'Aplicação programada para hoje' })).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Troca do adesivo' })).toBeOnTheScreen();
    expect(screen.queryByRole('switch', { name: 'Retirada do anel' })).toBeNull();
});

test('contato personaliza apenas os grupos e avisos autorizados', async () => {
    const dica = 'redeApoio.dicas.apoio';
    const preferencias = {
        chavesDisponiveis: [dica, 'redeApoio.diario.energia', 'redeApoio.convites.recebido'],
        [dica]: false
    };
    const atualizar = jest.fn().mockResolvedValue({ ...preferencias, [dica]: true });
    const onVoltar = await montar({ buscar: jest.fn().mockResolvedValue(preferencias), atualizar }, true);

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
    await montar({ buscar }, true);
    await tocar('Rede de Apoio');
    expect(await screen.findByRole('switch', { name: 'Dicas de Apoio' })).toBeOnTheScreen();

    buscar.mockResolvedValue({ chavesDisponiveis: [convite] });
    await tocar('Personalizar notificações');
    expect(await screen.findByRole('switch', { name: 'Novo convite recebido' })).toBeOnTheScreen();
    expect(screen.queryByRole('switch', { name: 'Receber dicas de como apoiar' })).toBeNull();
});

test('abre o catálogo completo de testes mesmo com a API indisponível', async () => {
    const buscar = jest.fn().mockRejectedValue(new Error('API indisponível'));
    const onVoltar = await montar({ buscar });
    await tocar('Teste de notificações');
    expect(screen.getByRole('header', { name: 'Teste de notificações' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Convite aceito' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Convite recusado' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Dica de apoio na fase menstrual' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Retirada do anel' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Novo dispositivo' })).toBeOnTheScreen();
    expect(buscar).toHaveBeenCalledTimes(1);
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

test('mostra o horário apenas enquanto o lembrete diário está ativo', async () => {
    let valores = { ...iniciais, lembreteDiarioAtivo: false };
    const atualizar = jest.fn(async ({ chave, valor }) => (valores = { ...valores, [chave]: valor }));
    const alternar = (name) => fireEvent.press(screen.getByRole('switch', { name }));
    const buscarHorario = () => screen.queryByRole('button', { name: 'Horário do lembrete diário' });
    await montar({ buscar: jest.fn().mockResolvedValue(valores), atualizar });
    await tocar('Ciclo e Previsões');
    await tocar('Personalizar notificações');

    expect(buscarHorario()).toBeNull();
    await alternar('Lembrete diário');
    expect(buscarHorario()).toBeOnTheScreen();
    await alternar('Lembrete diário');
    expect(buscarHorario()).toBeNull();
    await alternar('Lembrete diário');
    await tocar('Voltar');
    await alternar('Diário');
    await tocar('Personalizar notificações');
    expect(buscarHorario()).toBeNull();
    expect(valores.horarioLembreteDiario).toBe('20:00');
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
