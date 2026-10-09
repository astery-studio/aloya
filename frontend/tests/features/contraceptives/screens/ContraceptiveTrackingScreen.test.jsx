import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ContraceptiveTrackingScreen, MENSAGEM_VAZIO } from '../../../../src/features/contraceptives/screens/ContraceptiveTrackingScreen';

const metricas = { frame: { x: 0, y: 0, width: 393, height: 852 }, insets: { top: 32, left: 0, right: 0, bottom: 24 } };

function renderizar(componente) {
    return render(<SafeAreaProvider initialMetrics={metricas}>{componente}</SafeAreaProvider>);
}

test('reproduz o estado vazio e a ação principal do protótipo', async () => {
    const aoCadastrarNovo = jest.fn();
    await renderizar(<ContraceptiveTrackingScreen aoCadastrarNovo={aoCadastrarNovo} />);

    expect(screen.getByRole('header', { name: 'Anticoncepcionais' })).toBeOnTheScreen();
    expect(screen.getByText('Nenhum anticoncepcional')).toBeOnTheScreen();
    expect(screen.getByText(MENSAGEM_VAZIO)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar novo anticoncepcional' }));
    expect(aoCadastrarNovo).toHaveBeenCalledTimes(1);
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
