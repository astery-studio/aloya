import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContraceptiveTrackingScreen, MENSAGEM_VAZIO, criarSecoes } from '../../../../src/features/contraceptives/screens/ContraceptiveTrackingScreen';

const metricas = { frame: { x: 0, y: 0, width: 393, height: 852 }, insets: { top: 32, left: 0, right: 0, bottom: 24 } };

function renderizar(componente) {
    return render(<SafeAreaProvider initialMetrics={metricas}>{componente}</SafeAreaProvider>);
}

test('protege a listagem e o botão fixo nas quatro bordas nativas', async () => {
    await renderizar(<ContraceptiveTrackingScreen />);
    const area = screen.getByTestId('anticoncepcionais-area-segura');
    expect(area).toHaveProp('edges', {top: 'additive', left: 'additive', right: 'additive', bottom: 'additive'});
    expect(area).toContainElement(screen.getByRole('button', {name: 'Cadastrar novo anticoncepcional'}));
});

test('reproduz o estado vazio e a ação principal do protótipo', async () => {
    const aoCadastrarNovo = jest.fn();
    await renderizar(<ContraceptiveTrackingScreen aoCadastrarNovo={aoCadastrarNovo} />);

    expect(screen.getByRole('header', { name: 'Anticoncepcionais' })).toBeOnTheScreen();
    expect(screen.getByText('Nenhum anticoncepcional')).toBeOnTheScreen();
    expect(screen.getByText(MENSAGEM_VAZIO)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar novo anticoncepcional' }));
    expect(aoCadastrarNovo).toHaveBeenCalledTimes(1);
});

test('não duplica o cartão que possui doses com estados diferentes', () => {
    const item = {
        id: 'yaz', tipo: 'pilula', usosHoje: [
            { id: 'manha', horario: '08:00', status: 'confirmado' },
            { id: 'noite', horario: '20:00', status: 'pendente' }
        ]
    };
    expect(criarSecoes([item])).toEqual([{ titulo: 'NÃO USADOS', data: [item] }]);
});

test('o banner não conta doses de removidos nem de DIU, mas inclui o anel conforme o protótipo vigente', async () => {
    await renderizar(<ContraceptiveTrackingScreen anticoncepcionais={[
        { id: '1', nome: 'Mirena', tipo: 'diu_hormonal', programacao: { horarios: ['08:00'] } },
        { id: '2', nome: 'NuvaRing', tipo: 'anel_vaginal', programacao: { horarios: ['10:00'] } },
        { id: '3', nome: 'Depo-Provera', tipo: 'injetavel', removido: true, usosHoje: [{ id: 'u3', status: 'pendente' }] }
    ]} />);

    expect(screen.getByText('1 uso pendente hoje')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Marcar Uso' })).toHaveLength(1);
    expect(screen.getByText('REMOVIDOS')).toBeOnTheScreen();
});

test('a confirmação atualiza o banner e a seção sem duplicar o cartão', async () => {
    await renderizar(<ContraceptiveTrackingScreen aoAlternarUso={jest.fn().mockResolvedValue(undefined)} anticoncepcionais={[
        { id: '1', nome: 'Evra', tipo: 'adesivo', usosHoje: [{ id: 'u1', horario: '09:30', status: 'pendente' }] }
    ]} />);

    expect(screen.getByText('1 uso pendente hoje')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Uso' }));
    await waitFor(() => expect(screen.getByRole('header', { name: 'USADOS' })).toBeOnTheScreen());
    expect(screen.queryByText('1 uso pendente hoje')).not.toBeOnTheScreen();
    expect(screen.queryByText('NÃO USADOS')).not.toBeOnTheScreen();
    expect(screen.getAllByText('Evra')).toHaveLength(1);
});

test('a falha ao marcar restaura banner, seção e controle anteriores', async () => {
    await renderizar(<ContraceptiveTrackingScreen aoAlternarUso={jest.fn().mockRejectedValue(new Error('rede'))} anticoncepcionais={[
        { id: '1', nome: 'Evra', tipo: 'adesivo', usosHoje: [{ id: 'u1', horario: '09:30', status: 'pendente' }] }
    ]} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Uso' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Marcar Uso' })).toBeOnTheScreen());
    expect(screen.getByText('1 uso pendente hoje')).toBeOnTheScreen();
    expect(screen.getByText('NÃO USADOS')).toBeOnTheScreen();
    expect(screen.queryByText('USADOS')).not.toBeOnTheScreen();
});

test('agrupa itens e apresenta o banner de usos pendentes', async () => {
    await renderizar(<ContraceptiveTrackingScreen anticoncepcionais={[
        { id: '1', nome: 'Yaz', tipo: 'pilula', intensidadeAlerta: 'moderado', programacao: { horarios: ['08:00', '20:00'] }, historico: [] },
        { id: '2', nome: 'Mirena', tipo: 'diu_hormonal', intensidadeAlerta: 'leve', dataValidade: '14/03/2029', validadeRestante: '30 meses restantes', historico: [] }
    ]} />);

    expect(screen.getByText('2 usos pendentes hoje')).toBeOnTheScreen();
    expect(screen.getByText('NÃO USADOS')).toBeOnTheScreen();
    expect(screen.getByText('USADOS')).toBeOnTheScreen();
    expect(screen.getByText('Yaz')).toBeOnTheScreen();
    expect(screen.getByText('Mirena')).toBeOnTheScreen();
});
