import { act, fireEvent, screen, within } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CycleTodayScreen } from '../../../../src/features/cycles/screens/CycleTodayScreen';
import { criarEstilos } from '../../../../src/features/cycles/screens/CycleTodayScreen.styles';
import { temaClaro } from '../../../../src/shared/theme/themePalettes';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

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
    expect(screen.queryByText(/feira, \d+ de/)).not.toBeOnTheScreen();
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

    expect(screen.getByText('Aloya - 8 de Outubro')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'qui, dia 8' })).toBeOnTheScreen();
    const sobreFase = screen.getByRole('button', { name: /Sobre a fase personalizada/ });
    expect(sobreFase.props.accessibilityState.expanded).toBe(false);
    expect(screen.queryByText('Conteúdo recebido pela tela.')).not.toBeOnTheScreen();
    await fireEvent.press(sobreFase);
    expect(screen.getByText('Conteúdo recebido pela tela.')).toBeOnTheScreen();
    expect(screen.getByText('8–12 de outubro')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Início' }).props.accessibilityState.selected).toBe(
        true
    );
});

test('mantém o cabeçalho fixo fora da área rolável', async () => {
    const { getByTestId } = await renderizar({ previsao });
    const rolagem = getByTestId('conteudo-rolavel');

    expect(screen.getByText('Aloya - 8 de Outubro')).toBeOnTheScreen();
    expect(within(rolagem).queryByText('Aloya - 8 de Outubro')).not.toBeOnTheScreen();
});

test('mantém a faixa de datas no estado sem dados', async () => {
    await renderizar({ previsao: { ...previsao, status: 'DADOS_INSUFICIENTES' } });

    expect(screen.getByLabelText('Datas do ciclo')).toBeOnTheScreen();
    expect(screen.getByText('Continue registrando seu ciclo')).toBeOnTheScreen();
    expect(screen.queryByText('Conheça seu ciclo')).not.toBeOnTheScreen();
});

test('retorna da data selecionada para a data de referência', async () => {
    const aoSelecionarData = jest.fn();
    await renderizar({ previsao, dataSelecionada: '2026-10-10', aoSelecionarData });

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar para hoje' }));

    expect(aoSelecionarData).toHaveBeenCalledWith('2026-10-08');
});

test('acrescenta páginas de dias passados e futuros ao alcançar as bordas', async () => {
    await renderizar({ previsao });
    const evento = (x) => ({
        nativeEvent: {
            contentOffset: { x, y: 0 },
            contentSize: { width: 1000, height: 94 },
            layoutMeasurement: { width: 390, height: 94 }
        }
    });

    await fireEvent(screen.getByLabelText('Datas do ciclo'), 'scrollEndDrag', evento(0));
    let dias = screen.getByLabelText('Datas do ciclo').props.data;
    expect(dias).toHaveLength(30);
    expect(dias[0].data).toBe('2026-09-21');
    expect(dias.at(-1).data).toBe('2026-10-20');

    await fireEvent(screen.getByLabelText('Datas do ciclo'), 'scrollEndDrag', evento(610));
    dias = screen.getByLabelText('Datas do ciclo').props.data;
    expect(dias).toHaveLength(44);
    expect(dias.at(-1).data).toBe('2026-11-03');
});

test('mantém a fase estimada quando a previsão do ciclo passa da data prevista', async () => {
    await renderizar({
        previsao: {
            ...previsao,
            status: 'PREVISAO_ULTRAPASSADA',
            dataReferencia: '2026-11-01',
            duracaoCicloEstimada: 28
        }
    });

    expect(screen.getByText('Fase Menstrual')).toBeOnTheScreen();
    expect(screen.getByText('Dia 32 do ciclo')).toBeOnTheScreen();
    expect(screen.queryByText('Seu ciclo')).not.toBeOnTheScreen();
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
    expect(
        screen.getByText('Não foi possível sincronizar alguns registros. Verifique sua conexão.')
    ).toBeOnTheScreen();
});

test.each([
    ['fases', previsao.fasesEstimadas],
    ['fasesEstimadas', previsao.fasesEstimadas]
])('usa ciclo.%s quando não há previsão', async (propriedade, fases) => {
    await renderizar({
        ciclo: { dataReferencia: '2026-10-08', [propriedade]: fases }
    });

    expect(
        screen.getByRole('button', { name: 'qui, dia 8' }).props.accessibilityState.selected
    ).toBe(true);
    expect(screen.getByText('Seu ciclo, sua descoberta.')).toBeOnTheScreen();
});

test('apresenta a faixa horizontal com hoje selecionado quando ciclo e previsão não existem', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 30, 23, 30));
    try {
        await renderizar();

        const faixa = screen.getByLabelText('Datas do ciclo');
        expect(faixa).toHaveProp('horizontal', true);
        expect(faixa.props.data).toHaveLength(16);
        expect(faixa.props.data.every((dia) => dia.fase === 'desconhecida')).toBe(true);
        expect(screen.getByRole('button', { name: 'sex, dia 30' })).toBeSelected();
        expect(screen.getByText('Seu ciclo, sua descoberta.')).toBeOnTheScreen();
    } finally {
        jest.useRealTimers();
    }
});

test('encaminha todas as interações da tela carregada', async () => {
    const acoes = {
        aoAbrirHistorico: jest.fn(),
        aoSelecionarData: jest.fn(),
        aoSelecionarAba: jest.fn(),
        aoCadastrarMenstruacao: jest.fn(),
        aoCadastrarDiario: jest.fn(),
        aoAbrirAnticoncepcional: jest.fn()
    };
    await renderizar({ previsao, ...acoes });

    expect(screen.queryByRole('button', { name: 'Abrir parâmetros do ciclo' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir histórico do ciclo' }));
    expect(screen.queryByRole('button', { name: 'Abrir parâmetros do ciclo' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'qua, dia 14' }));
    await fireEvent.press(screen.getByRole('tab', { name: 'Calendário' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar Menstruação' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Diário' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Anticoncepcional' }));

    expect(acoes.aoAbrirHistorico).toHaveBeenCalledTimes(1);
    expect(acoes.aoSelecionarData).toHaveBeenCalledWith('2026-10-14');
    expect(acoes.aoSelecionarAba).toHaveBeenCalledWith('calendario');
    expect(acoes.aoCadastrarMenstruacao).toHaveBeenCalledTimes(1);
    expect(acoes.aoCadastrarDiario).toHaveBeenCalledTimes(1);
    expect(acoes.aoAbrirAnticoncepcional).toHaveBeenCalledTimes(1);
});

test('reserva espaço responsivo para conteúdo e cabeçalho', () => {
    const estilos = criarEstilos(temaClaro);
    expect(estilos.areaRolagem).toMatchObject({ flex: 1 });
    expect(estilos.cabecalho).toMatchObject({
        width: '100%',
        paddingTop: 16,
        paddingBottom: 16
    });
    expect(estilos.cabecalho.height).toBeUndefined();
    expect(estilos.titulo).toMatchObject({
        flex: 1,
        flexShrink: 1,
        fontFamily: 'DMSans_700Bold',
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 27.5,
        color: '#222222',
        textAlign: 'left'
    });
    expect(estilos.textoCarregando.fontWeight).toBe('400');
    expect(estilos.rolagem).toMatchObject({ flexGrow: 1, paddingTop: 8, paddingBottom: 16 });
    expect(estilos.navegacaoSegura).toMatchObject({ flexShrink: 0 });
});

test('abre a explicação de confiabilidade pela previsão', async () => {
    await renderizar({ previsao });

    await fireEvent.press(screen.getByRole('button', { name: 'Confiança média' }));
    expect(await screen.findByText('O que isso significa?')).toBeOnTheScreen();
    const painel = screen.getByTestId('bottom-sheet-painel');
    const animarFechamento = jest.spyOn(Animated, 'timing').mockReturnValue({
        start: (concluir) => concluir?.({ finished: true })
    });
    try {
        await act(() => painel.props.onAccessibilityEscape());
        expect(screen.queryByText('O que isso significa?')).not.toBeOnTheScreen();
    } finally {
        animarFechamento.mockRestore();
    }
});

test('abre a leitura da fase pela seção de cuidados', async () => {
    await renderizar({ previsao });

    await fireEvent.press(screen.getByRole('button', { name: /O que acontece agora/ }));
    expect(await screen.findByText('Por que “folicular”?')).toBeOnTheScreen();
});

test('abre a pausa guiada e a reflexão a partir dos cartões da Home', async () => {
    const { unmount } = await renderizar({ previsao });
    await fireEvent.press(screen.getByRole('button', { name: /Um respiro para você/ }));
    expect(await screen.findByText('Acompanhe o movimento')).toBeOnTheScreen();
    await unmount();

    await renderizar({ previsao });
    await fireEvent.press(screen.getByRole('button', { name: /Uma pergunta para hoje/ }));
    expect(await screen.findByText('O que seu corpo está pedindo agora?')).toBeOnTheScreen();
});

test('carrega dias extras nas duas bordas e preserva a data selecionada', async () => {
    await renderizar({ previsao });
    const faixa = () => screen.getByLabelText('Datas do ciclo');
    const aoRolar = (x) =>
        fireEvent(faixa(), 'scrollEndDrag', {
            nativeEvent: {
                contentOffset: { x, y: 0 },
                contentSize: { width: 1000, height: 94 },
                layoutMeasurement: { width: 390, height: 94 }
            }
        });

    const datasIniciais = faixa().props.data;
    await aoRolar(0);
    expect(faixa().props.data).toHaveLength(datasIniciais.length + 14);
    expect(faixa().props.data[0].data < datasIniciais[0].data).toBe(true);

    await aoRolar(610);
    expect(faixa().props.data).toHaveLength(datasIniciais.length + 28);
    expect(screen.getByRole('button', { name: 'qui, dia 8' })).toBeSelected();
});

test('mostra o check-in quando o serviço do Diário está disponível', async () => {
    const buscarCatalogo = jest.fn().mockResolvedValue({ macrocategorias: [] });
    await renderizar({ previsao, diaryService: { buscarCatalogo } });

    expect(await screen.findByText('Check-in gentil')).toBeOnTheScreen();
    expect(buscarCatalogo).toHaveBeenCalledTimes(1);
});
