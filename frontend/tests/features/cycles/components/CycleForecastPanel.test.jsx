import { fireEvent, render, screen } from '@testing-library/react-native';
import { CycleForecastPanel } from '../../../../src/features/cycles/components/CycleForecastPanel';
import { conteudoPorFase } from '../../../../src/features/cycles/constants/phaseContent';

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
    expect(screen.getByText('CONFIABILIDADE')).toBeOnTheScreen();
    expect(screen.getByText('Baixa')).toBeOnTheScreen();
    expect(screen.getByText(/não substitui orientação médica/)).toBeOnTheScreen();
});

test('mantém o estado sem dados dentro da HU-013', async () => {
    await render(<CycleForecastPanel aoCadastrarMenstruacao={jest.fn()} />);
    expect(screen.getByText('Conheça seu ciclo')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cadastrar Menstruação' })).toBeEnabled();
});

test.each([
    ['menstrual', 'Fase Menstrual', 'O ciclo recomeça. O corpo libera', 'Sensação de cansaço'],
    ['folicular', 'Fase Folicular', 'O ciclo recomeça e o corpo se prepara', 'Aumento de energia'],
    ['ovulatoria', 'Fase Ovulatória', 'O óvulo é liberado', 'Pico de energia'],
    ['lutea', 'Fase Lútea', 'Após a ovulação', 'Retenção de líquidos']
])('exibe conteúdo completo da fase %s', async (fase, titulo, descricao, sintoma) => {
    await render(
        <CycleForecastPanel
            fase={fase}
            diaCiclo={8}
            previsao={{ ...previsao, confiabilidadeMenstrual: { nivel: 'ALTA' } }}
            conteudoDaFase={conteudoPorFase[fase]}
        />
    );

    expect(screen.getByText(titulo)).toBeOnTheScreen();
    expect(screen.getByLabelText(`Símbolo provisório: ${titulo}`)).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(descricao))).toBeOnTheScreen();
    expect(screen.getByText(sintoma)).toBeOnTheScreen();
    expect(screen.getByText('Observe como seu corpo está se sentindo hoje.')).toBeOnTheScreen();
    expect(screen.getByText('Continue registrando suas percepções ao longo do ciclo.')).toBeOnTheScreen();
});

test('executa as três ações do painel com previsão', async () => {
    const acoes = {
        aoCadastrarMenstruacao: jest.fn(),
        aoAbrirDiario: jest.fn(),
        aoAbrirAnticoncepcional: jest.fn()
    };
    await render(<CycleForecastPanel previsao={previsao} {...acoes} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar Menstruação' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar no Diário' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Anticoncepcional' }));

    expect(acoes.aoCadastrarMenstruacao).toHaveBeenCalledTimes(1);
    expect(acoes.aoAbrirDiario).toHaveBeenCalledTimes(1);
    expect(acoes.aoAbrirAnticoncepcional).toHaveBeenCalledTimes(1);
});

test('prioriza a janela fértil recebida por prop e aceita confiança média', async () => {
    const janelaFertil = { inicio: '2026-09-08', fim: '2026-09-14' };
    await render(
        <CycleForecastPanel
            previsao={{ ...previsao, confiabilidadeMenstrual: { nivel: 'MEDIA' } }}
            janelaFertil={janelaFertil}
        />
    );

    expect(screen.getByText('Média')).toBeOnTheScreen();
    expect(screen.getByText('8 de setembro até 14 de setembro')).toBeOnTheScreen();
    expect(screen.queryByText('Estimativa incerta')).not.toBeOnTheScreen();
    expect(screen.queryByText(/Continue registrando seus ciclos/)).not.toBeOnTheScreen();
});

test('explica previsão parcial sem confiança nem janela fértil', async () => {
    await render(
        <CycleForecastPanel
            previsao={{
                ...previsao,
                status: 'PARCIALMENTE_DISPONIVEL',
                confiabilidadeMenstrual: undefined,
                janelaFertilEstimada: undefined
            }}
        />
    );

    expect(screen.getByText('Estimativa incerta')).toBeOnTheScreen();
    expect(screen.getByText('Os dados deste ciclo podem ser imprecisos.')).toBeOnTheScreen();
    expect(screen.getByText('Indisponível')).toBeOnTheScreen();
    expect(screen.getByText('Baixa')).toBeOnTheScreen();
});

test('trata fase inválida como ciclo desconhecido', async () => {
    await render(<CycleForecastPanel fase="inexistente" previsao={previsao} />);

    expect(screen.getByText('Seu ciclo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Símbolo provisório: Seu ciclo')).toBeOnTheScreen();
    expect(screen.queryByText(/Dia \d+ do ciclo/)).not.toBeOnTheScreen();
    expect(screen.queryByText('Você está na janela fértil.')).not.toBeOnTheScreen();
});
