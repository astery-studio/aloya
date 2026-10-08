import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CycleTodayScreen } from '../../../../src/features/cycles/screens/CycleTodayScreen';

const previsao = {
    status: 'DISPONIVEL',
    dataReferencia: '2026-10-08',
    proximoInicioEstimado: '2026-10-29',
    dataOvulacaoEstimada: '2026-10-14',
    janelaFertilEstimada: { inicio: '2026-10-09', fim: '2026-10-14' },
    confiabilidadeMenstrual: { nivel: 'MEDIA' },
    fasesEstimadas: {
        menstrual: { inicio: '2026-10-01', fim: '2026-10-05' },
        folicularPosMenstrual: { inicio: '2026-10-06', fim: '2026-10-13' },
        ovulatoria: { data: '2026-10-14' },
        lutea: { inicio: '2026-10-15', fim: '2026-10-28' }
    }
};

const metricas = {
    frame: { x: 0, y: 0, width: 390, height: 852 },
    insets: { top: 24, right: 0, bottom: 24, left: 0 }
};

function renderizar(propriedades = {}) {
    return render(
        <SafeAreaProvider initialMetrics={metricas}>
            <CycleTodayScreen {...propriedades} />
        </SafeAreaProvider>
    );
}

test('apresenta o estado de carregamento sem exibir erro simultâneo', async () => {
    await renderizar({ carregando: true, erro: true });

    expect(screen.getByText('Carregando sua previsão...')).toBeOnTheScreen();
    expect(screen.queryByText('Aloya - Seu Ciclo Hoje')).not.toBeOnTheScreen();
    expect(screen.queryByText('Algo deu errado')).not.toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Início' })).toBeOnTheScreen();
});

test('compõe a tela carregada com conteúdo e janela recebidos por prop', async () => {
    const conteudo = {
        tituloExplicacao: 'Sobre a fase personalizada',
        descricao: 'Conteúdo recebido pela tela.',
        sintomas: ['Sintoma personalizado'],
        dicas: ['Dica personalizada']
    };
    await renderizar({
        previsao,
        conteudoDaFase: conteudo,
        janelaFertil: { inicio: '2026-10-08', fim: '2026-10-12' }
    });

    expect(screen.getByText('Aloya - Seu Ciclo Hoje')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'qui, dia 8' })).toBeOnTheScreen();
    expect(screen.getByText('Conteúdo recebido pela tela.')).toBeOnTheScreen();
    expect(screen.getByText('8 de outubro até 12 de outubro')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Início' }).props.accessibilityState.selected).toBe(true);
});

test('mantém a faixa de datas no estado sem dados', async () => {
    await renderizar({ previsao: { ...previsao, status: 'DADOS_INSUFICIENTES' } });

    expect(screen.getByLabelText('Datas do ciclo')).toBeOnTheScreen();
    expect(screen.getByText('Conheça seu ciclo')).toBeOnTheScreen();
});
