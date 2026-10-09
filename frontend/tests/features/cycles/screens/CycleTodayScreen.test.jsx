import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CycleTodayScreen } from '../../../../src/features/cycles/screens/CycleTodayScreen';
import { estilos } from '../../../../src/features/cycles/screens/CycleTodayScreen.styles';

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

test('permite repetir ou fechar o erro de previsão', async () => {
    const aoTentarNovamente = jest.fn();
    const aoVoltar = jest.fn();
    await renderizar({ erroPrevisao: true, aoTentarNovamente, aoVoltar });

    expect(screen.getByText('Algo deu errado')).toBeOnTheScreen();
    expect(screen.getByText(/Não foi possível carregar sua previsão/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(aoTentarNovamente).toHaveBeenCalledTimes(1);
    expect(aoVoltar).toHaveBeenCalledTimes(1);
});

test('prioriza o erro de sincronização quando ambos são informados', async () => {
    await renderizar({ erroPrevisao: true, erroSincronizacao: true });

    expect(screen.getByText('Algo deu errado')).toBeOnTheScreen();
    expect(screen.getByText('Não foi possível sincronizar alguns registros. Verifique sua conexão.')).toBeOnTheScreen();
});

test.each([
    ['fases', previsao.fasesEstimadas],
    ['fasesEstimadas', previsao.fasesEstimadas]
])('usa ciclo.%s quando não há previsão', async (propriedade, fases) => {
    await renderizar({
        ciclo: { dataReferencia: '2026-10-08', [propriedade]: fases }
    });

    expect(screen.getByRole('button', { name: 'qui, dia 8' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByText('Conheça seu ciclo')).toBeOnTheScreen();
});

test('apresenta início sem faixa quando ciclo e previsão não existem', async () => {
    await renderizar();

    expect(screen.queryByLabelText('Datas do ciclo')).not.toBeOnTheScreen();
    expect(screen.getByText('Conheça seu ciclo')).toBeOnTheScreen();
});

test('encaminha todas as interações da tela carregada', async () => {
    const acoes = {
        aoAbrirCalendario: jest.fn(),
        aoSelecionarData: jest.fn(),
        aoSelecionarAba: jest.fn(),
        aoCadastrarMenstruacao: jest.fn(),
        aoAbrirDiario: jest.fn(),
        aoAbrirAnticoncepcional: jest.fn()
    };
    await renderizar({ previsao, ...acoes });

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir calendário' }));
    await fireEvent.press(screen.getByRole('button', { name: 'qua, dia 14' }));
    await fireEvent.press(screen.getByRole('tab', { name: 'Ciclos' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar Menstruação' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar no Diário' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Anticoncepcional' }));

    expect(acoes.aoAbrirCalendario).toHaveBeenCalledTimes(1);
    expect(acoes.aoSelecionarData).toHaveBeenCalledWith('2026-10-14');
    expect(acoes.aoSelecionarAba).toHaveBeenCalledWith('ciclos');
    expect(acoes.aoCadastrarMenstruacao).toHaveBeenCalledTimes(1);
    expect(acoes.aoAbrirDiario).toHaveBeenCalledTimes(1);
    expect(acoes.aoAbrirAnticoncepcional).toHaveBeenCalledTimes(1);
});

test('reserva espaço responsivo para conteúdo e cabeçalho', () => {
    expect(estilos.areaRolagem).toMatchObject({ flex: 1 });
    expect(estilos.cabecalho).toMatchObject({ width: '100%', minHeight: 78, paddingTop: 32 });
    expect(estilos.titulo).toMatchObject({ flexShrink: 1 });
    expect(estilos.rolagem).toMatchObject({ flexGrow: 1, paddingBottom: 128 });
});
