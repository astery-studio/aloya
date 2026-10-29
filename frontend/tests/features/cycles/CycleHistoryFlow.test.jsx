//Testa o fluxo entre histórico, calendário mensal e remoções da HU-010.
import { act, render, waitFor } from '@testing-library/react-native';
import {
    CycleHistoryFlow,
    filtrarDiasDoCiclo,
    listarMesesDoCiclo
} from '../../../src/features/cycles/CycleHistoryFlow';
import { useCycleHistory } from '../../../src/features/cycles/hooks/useCycleHistory';
import { CycleHistoryScreen } from '../../../src/features/cycles/screens/CycleHistoryScreen';
import { RemoveMenstruationModal } from '../../../src/features/cycles/components/RemoveMenstruationModal';

jest.mock('../../../src/features/cycles/hooks/useCycleHistory', () => ({
    useCycleHistory: jest.fn()
}));
jest.mock('../../../src/features/cycles/screens/CycleHistoryScreen', () => ({
    CycleHistoryScreen: jest.fn(() => null)
}));
jest.mock('../../../src/features/cycles/components/RemoveMenstruationModal', () => ({
    RemoveMenstruationModal: jest.fn(() => null)
}));

const ciclo = Object.freeze({
    id: '3',
    numero: 3,
    dataInicio: '2026-08-29',
    dataFim: '2026-09-02',
    periodo: '29 Ago até 02 Set'
});
const ciclos = Object.freeze([ciclo]);
const resumo = Object.freeze({
    cicloMedioDias: 28,
    menstruacaoMediaDias: 5,
    quantidadeCiclos: 3,
    confianca: 'media'
});

function criarEstadoDoHook(alteracoes = {}) {
    return {
        ciclos,
        resumo,
        quantidadeCiclos: 3,
        carregando: false,
        carregandoMais: false,
        erro: null,
        erroCarregarMais: null,
        temMais: true,
        carregarMais: jest.fn(),
        tentarNovamente: jest.fn(),
        tentarCarregarMais: jest.fn(),
        ...alteracoes
    };
}

async function montar({
    calendarService = {
        buscarMes: jest.fn(async ({ mes }) => ({
            mes,
            possuiCiclos: true,
            diasMenstruacao: [{ data: '2026-08-29', registroCicloId: 3 }],
            previsao: { periodos: [] }
        }))
    },
    service = { listarPagina: jest.fn(), removerDia: jest.fn(), excluirCiclo: jest.fn() },
    estado,
    ...props
} = {}) {
    useCycleHistory.mockReturnValue(estado || criarEstadoDoHook());
    return render(
        <CycleHistoryFlow service={service} calendarService={calendarService} {...props} />
    );
}

beforeEach(() => {
    jest.clearAllMocks();
});

test('valida intervalos e lista os meses completos do ciclo', () => {
    expect(listarMesesDoCiclo(ciclo)).toEqual(['2026-08', '2026-09']);
    expect(listarMesesDoCiclo({ dataInicio: '2026-12-30', dataFim: '2027-01-02' })).toEqual([
        '2026-12',
        '2027-01'
    ]);
    expect(listarMesesDoCiclo({ dataInicio: '2026-10-01', dataFim: '2026-09-01' })).toEqual([]);
    expect(listarMesesDoCiclo({ dataInicio: 'inválida', dataFim: null })).toEqual([]);
    expect(listarMesesDoCiclo({ dataInicio: null, dataFim: '2026-10-01' })).toEqual([]);
});

test('filtra dias de outros ciclos e remove as previsões', () => {
    const calendario = {
        mes: '2026-08',
        possuiCiclos: true,
        diasMenstruacao: [
            { data: '2026-08-01', registroCicloId: 3 },
            { data: '2026-08-04', registroCicloId: 7 }
        ],
        previsao: { ovulacao: '2026-08-20' }
    };
    expect(filtrarDiasDoCiclo(calendario, '3')).toEqual({
        ...calendario,
        diasMenstruacao: [calendario.diasMenstruacao[0]],
        previsao: null
    });
    expect(filtrarDiasDoCiclo(calendario, 99).possuiCiclos).toBe(false);
});

test('encaminha serviço e callback de sessão expirada ao hook do histórico', async () => {
    const service = { listarPagina: jest.fn(), removerDia: jest.fn(), excluirCiclo: jest.fn() };
    const onSessaoExpirada = jest.fn();
    await montar({ service, onSessaoExpirada });
    expect(useCycleHistory).toHaveBeenCalledWith({ service, onSessaoExpirada });
});

test('encaminha estados e ações do histórico para a tela', async () => {
    const estado = criarEstadoDoHook({
        carregando: true,
        carregandoMais: true,
        erro: 'Erro inicial',
        erroCarregarMais: 'Erro da próxima página'
    });
    await montar({ estado });
    expect(CycleHistoryScreen.mock.calls[0][0]).toEqual(
        expect.objectContaining({
            ciclos: estado.ciclos,
            resumo: estado.resumo,
            carregando: true,
            carregandoMais: true,
            erro: 'Erro inicial',
            erroCarregarMais: 'Erro da próxima página',
            temMais: true,
            aoTentarNovamente: estado.tentarNovamente,
            aoCarregarMais: estado.carregarMais,
            aoTentarCarregarMais: estado.tentarCarregarMais
        })
    );
});

test('abre o sheet do ciclo escolhido e carrega apenas seus meses e dias', async () => {
    const calendarService = {
        buscarMes: jest.fn(async ({ mes }) => ({
            mes,
            possuiCiclos: true,
            diasMenstruacao: [
                { data: '2026-08-29', registroCicloId: 3 },
                { data: '2026-08-30', registroCicloId: 4 }
            ],
            previsao: null
        }))
    };
    await montar({ calendarService });
    await act(async () => {
        CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo);
    });
    await waitFor(() => expect(calendarService.buscarMes).toHaveBeenCalledTimes(2));
    expect(calendarService.buscarMes.mock.calls.map(([args]) => args.mes)).toEqual([
        '2026-08',
        '2026-09'
    ]);
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0]).toEqual(
        expect.objectContaining({
            modo: 'dia',
            visivel: true,
            ciclo,
            meses: expect.arrayContaining([
                expect.objectContaining({
                    previsao: null,
                    diasMenstruacao: [{ data: '2026-08-29', registroCicloId: 3 }]
                })
            ])
        })
    );
});

test('remove somente o dia selecionado e atualiza o sheet após sucesso', async () => {
    const service = {
        listarPagina: jest.fn(),
        removerDia: jest.fn().mockResolvedValue({}),
        excluirCiclo: jest.fn()
    };
    const calendarService = {
        buscarMes: jest.fn(async ({ mes }) => ({
            mes,
            possuiCiclos: true,
            diasMenstruacao: [
                { data: '2026-08-29', registroCicloId: 3 },
                { data: '2026-08-30', registroCicloId: 3 }
            ],
            previsao: null
        }))
    };
    await montar({
        calendarService,
        service,
        estado: criarEstadoDoHook({ tentarNovamente: jest.fn().mockResolvedValue(true) })
    });
    await act(async () => CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo));
    await waitFor(() => expect(calendarService.buscarMes).toHaveBeenCalled());
    const props = RemoveMenstruationModal.mock.calls.at(-1)[0];
    await act(async () => props.onRemoverDia({ data: '2026-08-29', registroCicloId: 3 }));
    expect(service.removerDia).toHaveBeenCalledWith({
        cicloId: '3',
        data: '2026-08-29'
    });
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0]).toEqual(
        expect.objectContaining({
            modo: 'dia',
            dataSelecionada: null,
            diasAlterados: true,
            meses: expect.arrayContaining([
                expect.objectContaining({
                    diasMenstruacao: [{ data: '2026-08-30', registroCicloId: 3 }]
                })
            ])
        })
    );
});

test('mantém dias visíveis após falha e permite repetir a remoção', async () => {
    const service = {
        listarPagina: jest.fn(),
        removerDia: jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({}),
        excluirCiclo: jest.fn()
    };
    const calendarService = {
        buscarMes: jest.fn(async ({ mes }) => ({
            mes,
            possuiCiclos: true,
            diasMenstruacao: [{ data: '2026-08-29', registroCicloId: 3 }],
            previsao: null
        }))
    };
    await montar({ calendarService, service });
    await act(async () => CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo));
    await waitFor(() => expect(calendarService.buscarMes).toHaveBeenCalled());
    await act(async () =>
        RemoveMenstruationModal.mock.calls.at(-1)[0].onRemoverDia({
            data: '2026-08-29',
            registroCicloId: 3
        })
    );
    let props = RemoveMenstruationModal.mock.calls.at(-1)[0];
    expect(props.alerta).toBe('erro');
    expect(props.dataSelecionada).toBe('2026-08-29');
    expect(props.meses[0].diasMenstruacao).toEqual([{ data: '2026-08-29', registroCicloId: 3 }]);
    await act(async () => props.onTentarNovamente());
    props = RemoveMenstruationModal.mock.calls.at(-1)[0];
    expect(service.removerDia).toHaveBeenCalledTimes(2);
    expect(props.dataSelecionada).toBe(null);
    expect(props.diasAlterados).toBe(true);
    expect(props.alerta).toBe(null);
});

test('exige confirmação antes da exclusão completa e mostra sucesso após atualizar o histórico', async () => {
    const service = {
        listarPagina: jest.fn(),
        removerDia: jest.fn(),
        excluirCiclo: jest.fn().mockResolvedValue({})
    };
    const calendarService = {
        buscarMes: jest.fn(async ({ mes }) => ({
            mes,
            possuiCiclos: true,
            diasMenstruacao: [{ data: '2026-08-29', registroCicloId: 3 }],
            previsao: null
        }))
    };
    await montar({ calendarService, service });
    await act(async () => CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo));
    await waitFor(() => expect(calendarService.buscarMes).toHaveBeenCalled());
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onSolicitarExcluirCiclo());
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0].modo).toBe('cicloCompleto');
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onExcluirCiclo());
    expect(service.excluirCiclo).toHaveBeenCalledWith({ cicloId: '3' });
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0]).toEqual(
        expect.objectContaining({ visivel: false, alerta: 'sucesso-excluir' })
    );
});

test('apresenta erro no sheet quando não consegue obter calendário', async () => {
    await montar({
        calendarService: { buscarMes: jest.fn().mockRejectedValue(new Error('offline')) }
    });
    await act(async () => {
        CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo);
    });
    await waitFor(() =>
        expect(RemoveMenstruationModal.mock.calls.at(-1)[0].erroMeses).toBeTruthy()
    );
});

test('permite tentar novamente a carga dos dias sem serviço de calendário', async () => {
    await montar({ calendarService: null });
    await act(async () => CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo));
    await waitFor(() =>
        expect(RemoveMenstruationModal.mock.calls.at(-1)[0].erroMeses).toBeTruthy()
    );
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onTentarNovamente());
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0].erroMeses).toBeTruthy();
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onFechar());
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onTentarNovamente());
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0].visivel).toBe(false);
});

test('exibe falha da exclusão completa e repete a operação confirmada', async () => {
    const service = {
        listarPagina: jest.fn(),
        removerDia: jest.fn(),
        excluirCiclo: jest
            .fn()
            .mockRejectedValueOnce(new Error('offline'))
            .mockRejectedValueOnce(new Error('offline again'))
            .mockResolvedValueOnce({})
    };
    await montar({ service });
    await act(async () => CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo));
    await waitFor(() => expect(RemoveMenstruationModal.mock.calls.at(-1)[0].meses).toHaveLength(2));
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onSolicitarExcluirCiclo());
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onCancelarExclusao());
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0].modo).toBe('dia');
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onSolicitarExcluirCiclo());
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onExcluirCiclo());
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0]).toEqual(
        expect.objectContaining({ modo: 'cicloCompleto', alerta: 'erro' })
    );
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onTentarNovamente());
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0].alerta).toBe('erro');
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onTentarNovamente());
    expect(service.excluirCiclo).toHaveBeenCalledTimes(3);
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0]).toEqual(
        expect.objectContaining({ visivel: false, modo: 'dia', alerta: 'sucesso-excluir' })
    );
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onFecharAlerta());
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0].alerta).toBe(null);
});

test('conclui a correção parcial e permite fechar o sheet sem mutação adicional', async () => {
    const service = {
        listarPagina: jest.fn(),
        removerDia: jest.fn().mockResolvedValue({}),
        excluirCiclo: jest.fn()
    };
    await montar({ service });
    await act(async () => CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo));
    await waitFor(() => expect(RemoveMenstruationModal.mock.calls.at(-1)[0].meses).toHaveLength(2));
    let props = RemoveMenstruationModal.mock.calls.at(-1)[0];
    await act(async () => props.onRemoverDia(null));
    expect(service.removerDia).not.toHaveBeenCalled();
    await act(async () => props.onTentarNovamente());
    await act(async () => props.onRemoverDia({ data: '2026-08-29', registroCicloId: 3 }));
    expect(service.removerDia).toHaveBeenCalledWith({
        cicloId: '3',
        data: '2026-08-29'
    });
    props = RemoveMenstruationModal.mock.calls.at(-1)[0];
    await act(async () => props.onConcluir());
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0]).toEqual(
        expect.objectContaining({ visivel: false, alerta: 'sucesso-atualizar' })
    );
    props = RemoveMenstruationModal.mock.calls.at(-1)[0];
    await act(async () => props.onFechar());
    props = RemoveMenstruationModal.mock.calls.at(-1)[0];
    await act(async () => props.onExcluirCiclo());
    expect(service.excluirCiclo).not.toHaveBeenCalled();
});

test('fecha o sheet sem exibir sucesso quando nenhum dia foi removido', async () => {
    const service = { listarPagina: jest.fn(), removerDia: jest.fn(), excluirCiclo: jest.fn() };
    await montar({ service });
    await act(async () => CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo));
    await waitFor(() => expect(RemoveMenstruationModal.mock.calls.at(-1)[0].meses).toHaveLength(2));
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onConcluir());
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0]).toEqual(
        expect.objectContaining({ visivel: false, alerta: null })
    );
});

test('mostra erro de carga para um período inválido do ciclo', async () => {
    const cicloInvalido = { ...ciclo, dataInicio: '2026-09-03', dataFim: '2026-09-01' };
    const calendarService = { buscarMes: jest.fn() };
    await montar({ calendarService });
    await act(async () => CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(cicloInvalido));
    await waitFor(() =>
        expect(RemoveMenstruationModal.mock.calls.at(-1)[0].erroMeses).toBeTruthy()
    );
    expect(calendarService.buscarMes).not.toHaveBeenCalled();
});

test('ignora a resposta mensal que chega depois de fechar o sheet', async () => {
    const pendentes = [];
    const calendarService = {
        buscarMes: jest.fn(({ mes }) => new Promise((resolve) => pendentes.push({ mes, resolve })))
    };
    await montar({ calendarService });
    await act(async () => CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo));
    await waitFor(() => expect(pendentes).toHaveLength(2));
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onFechar());
    await act(async () => {
        pendentes.forEach(({ mes, resolve }) =>
            resolve({ mes, possuiCiclos: true, diasMenstruacao: [], previsao: null })
        );
    });
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0]).toEqual(
        expect.objectContaining({ visivel: false, meses: [] })
    );
});

test('ignora falha mensal de uma requisição cancelada após fechar o sheet', async () => {
    const pendentes = [];
    const calendarService = {
        buscarMes: jest.fn(({ mes }) => new Promise((_, reject) => pendentes.push({ mes, reject })))
    };
    await montar({ calendarService });
    await act(async () => CycleHistoryScreen.mock.calls[0][0].aoExcluirCiclo(ciclo));
    await waitFor(() => expect(pendentes).toHaveLength(2));
    await act(async () => RemoveMenstruationModal.mock.calls.at(-1)[0].onFechar());
    await act(async () => pendentes.forEach(({ reject }) => reject(new Error('cancelado'))));
    expect(RemoveMenstruationModal.mock.calls.at(-1)[0]).toEqual(
        expect.objectContaining({ visivel: false, erroMeses: null })
    );
});
