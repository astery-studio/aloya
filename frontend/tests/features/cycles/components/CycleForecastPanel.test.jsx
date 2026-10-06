import { render, screen } from '@testing-library/react-native';
import { CycleForecastPanel } from '../../../../src/features/cycles/components/CycleForecastPanel';

const previsao = {
    status: 'DISPONIVEL',
    proximoInicioEstimado: '2026-10-29',
    dataOvulacaoEstimada: '2026-10-14',
    janelaFertilEstimada: { inicio: '2026-10-09', fim: '2026-10-14' },
    confiabilidadeMenstrual: { nivel: 'BAIXA' }
};

test('exibe previsão, confiança e aviso médico', async () => {
    await render(<CycleForecastPanel fase="folicular" diaCiclo={8} previsao={previsao} />);

    expect(screen.getByText('Fase Folicular')).toBeOnTheScreen();
    expect(screen.getByText('29 de outubro')).toBeOnTheScreen();
    expect(screen.getByText('Confiabilidade')).toBeOnTheScreen();
    expect(screen.getByText('baixa')).toBeOnTheScreen();
    expect(screen.getByText(/não substitui orientação médica/)).toBeOnTheScreen();
});

test('mantém o estado sem dados dentro da HU-013', async () => {
    await render(<CycleForecastPanel aoCadastrarMenstruacao={jest.fn()} />);
    expect(screen.getByText('Conheça seu ciclo')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cadastrar Menstruação' })).toBeEnabled();
});
