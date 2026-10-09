import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContraceptiveOverviewScreen, MENSAGEM_ERRO, MENSAGEM_VAZIO } from '../../../../src/features/contraceptives/screens/ContraceptiveOverviewScreen';

jest.mock('phosphor-react-native', () => {
    const { Text } = require('react-native');
    return new Proxy({}, { get: (_, nome) => (props) => <Text {...props}>{String(nome)}</Text> });
});
jest.mock('phosphor-react-native/src/icons/ArrowLeft', () => ({ ArrowLeftIcon: () => null }));

const metricas = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };
const renderizar = (componente) => render(<SafeAreaProvider initialMetrics={metricas}>{componente}</SafeAreaProvider>);

test('mostra estado vazio com a mensagem definida pela HU-019 e a ação fixa', async () => {
    const aoCadastrarNovo = jest.fn();
    await renderizar(<ContraceptiveOverviewScreen aoCadastrarNovo={aoCadastrarNovo} />);

    expect(screen.getByText(MENSAGEM_VAZIO)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Cadastrar novo anticoncepcional' }));
    expect(aoCadastrarNovo).toHaveBeenCalledTimes(1);
});

test('ordena os itens pelo próximo horário e destaca pendências sem depender apenas de cor', async () => {
    await renderizar(<ContraceptiveOverviewScreen anticoncepcionais={[
        { id: '2', nome: 'Noite', tipo: 'pilula', intensidadeAlerta: 'leve', proximoUsoPrevisto: '20:00', usosHoje: [{ id: '2a', horario: '20:00', status: 'confirmado' }] },
        { id: '1', nome: 'Manhã', tipo: 'pilula', intensidadeAlerta: 'moderado', proximoUsoPrevisto: '08:00', usosHoje: [{ id: '1a', horario: '08:00', status: 'pendente' }] }
    ]} />);

    expect(screen.getAllByText(/Manhã|Noite/).map((item) => item.props.children)).toEqual(['Manhã', 'Noite']);
    expect(screen.getByLabelText(/Manhã, Pílula, possui uso pendente/)).toBeOnTheScreen();
    expect(screen.getAllByText('Pendente de uso').length).toBeGreaterThan(0);
});

test('para DIU e anel mostra validade sem controle diário', async () => {
    await renderizar(<ContraceptiveOverviewScreen anticoncepcionais={[
        { id: '1', nome: 'Mirena', tipo: 'diu_hormonal', intensidadeAlerta: 'critico', contagemValidade: '30 meses restantes', usosHoje: [] },
        { id: '2', nome: 'NuvaRing', tipo: 'anel_vaginal', intensidadeAlerta: 'leve', contagemValidade: '12 dias restantes', usosHoje: [] }
    ]} />);

    expect(screen.getByText('30 meses restantes')).toBeOnTheScreen();
    expect(screen.getByText('12 dias restantes')).toBeOnTheScreen();
    expect(screen.queryByRole('checkbox')).not.toBeOnTheScreen();
});

test('exibe erro amigável e permite tentar novamente', async () => {
    const aoTentarNovamente = jest.fn();
    await renderizar(<ContraceptiveOverviewScreen erro aoTentarNovamente={aoTentarNovamente} />);

    expect(screen.getByText(MENSAGEM_ERRO)).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(aoTentarNovamente).toHaveBeenCalledTimes(1);
});
