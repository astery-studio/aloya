import { CycleEditFlow } from '../../../src/features/cycles/CycleEditFlow';
jest.mock('../../../src/features/cycles/CycleEditFlow', () => ({
    CycleEditFlow: jest.fn(() => null)
}));
//Testa o fluxo entre histórico, calendário mensal e remoções da HU-010.
import { act, render, waitFor } from '@testing-library/react-native';
import { CycleHistoryFlow } from '../../../src/features/cycles/CycleHistoryFlow';
import { useCycleHistory } from '../../../src/features/cycles/hooks/useCycleHistory';
import { CycleHistoryScreen } from '../../../src/features/cycles/screens/CycleHistoryScreen';
import { CycleRemovalFeedbackModal } from '../../../src/features/cycles/components/CycleRemovalFeedbackModal';

jest.mock('../../../src/features/cycles/hooks/useCycleHistory', () => ({
    useCycleHistory: jest.fn()
}));
jest.mock('../../../src/features/cycles/screens/CycleHistoryScreen', () => ({
    CycleHistoryScreen: jest.fn(() => null)
}));
jest.mock('../../../src/features/cycles/components/CycleRemovalFeedbackModal', () => ({
    CycleRemovalFeedbackModal: jest.fn(() => null)
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

const popup = () => CycleRemovalFeedbackModal.mock.calls.at(-1)[0];
const tela = () => CycleHistoryScreen.mock.calls.at(-1)[0];
const abrir = async () => act(() => tela().aoExcluirCiclo(ciclo));

test('lixeira abre confirmação direta sem calendário ou exclusão antecipada', async () => {
    const calendarService = { buscarMes: jest.fn() };
    const service = { excluirCiclo: jest.fn(), removerDia: jest.fn() };
    await montar({ calendarService, service });
    expect(popup().visivel).toBe(false);
    await abrir();
    expect(popup()).toMatchObject({
        visivel: true,
        tipo: 'confirmacao',
        periodo: '29/08/2026 a 02/09/2026'
    });
    expect(calendarService.buscarMes).not.toHaveBeenCalled();
    expect(service.excluirCiclo).not.toHaveBeenCalled();
    expect(service.removerDia).not.toHaveBeenCalled();
    await act(() => popup().onCancelar());
    expect(popup().visivel).toBe(false);
    expect(service.excluirCiclo).not.toHaveBeenCalled();
});

test('confirma ciclo inteiro, atualiza histórico e fecha sucesso no OK', async () => {
    const service = { excluirCiclo: jest.fn().mockResolvedValue({ cicloRemovido: true }) };
    const atualizar = jest.fn().mockResolvedValue(true);
    await montar({ service, estado: criarEstadoDoHook({ tentarNovamente: atualizar }) });
    await abrir();
    await act(() => popup().onConfirmar());
    expect(service.excluirCiclo).toHaveBeenCalledWith({ cicloId: '3' });
    expect(atualizar).toHaveBeenCalledTimes(1);
    expect(popup()).toMatchObject({ tipo: 'sucesso-excluir', visivel: true, carregando: false });
    await act(() => popup().onFechar());
    expect(popup().visivel).toBe(false);
});

test('falha conserva histórico e permite sair sem excluir novamente', async () => {
    const service = { excluirCiclo: jest.fn().mockRejectedValue(new Error('offline')) };
    const atualizar = jest.fn();
    await montar({ service, estado: criarEstadoDoHook({ tentarNovamente: atualizar }) });
    await abrir();
    await act(() => popup().onConfirmar());
    expect(popup()).toMatchObject({ tipo: 'erro', visivel: true, carregando: false });
    expect(tela().ciclos).toEqual(ciclos);
    expect(atualizar).not.toHaveBeenCalled();
    await act(() => popup().onFechar());
    expect(popup().visivel).toBe(false);
    expect(service.excluirCiclo).toHaveBeenCalledTimes(1);
});

test('retentativa repete somente a exclusão confirmada', async () => {
    const service = {
        excluirCiclo: jest.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({})
    };
    await montar({ service });
    await abrir();
    await act(() => popup().onConfirmar());
    expect(popup().tipo).toBe('erro');
    await act(() => popup().onTentarNovamente());
    expect(popup().tipo).toBe('sucesso-excluir');
    expect(service.excluirCiclo.mock.calls).toEqual([[{ cicloId: '3' }], [{ cicloId: '3' }]]);
});

test('bloqueia duplicação e fechamento durante exclusão', async () => {
    let concluir;
    const service = {
        excluirCiclo: jest.fn(
            () =>
                new Promise((resolve) => {
                    concluir = resolve;
                })
        )
    };
    await montar({ service });
    await abrir();
    let envio;
    await act(() => {
        envio = popup().onConfirmar();
    });
    expect(popup().carregando).toBe(true);
    await act(() => popup().onCancelar());
    await act(() => popup().onConfirmar());
    expect(popup().visivel).toBe(true);
    expect(service.excluirCiclo).toHaveBeenCalledTimes(1);
    await act(async () => {
        concluir({});
        await envio;
    });
    await waitFor(() => expect(popup().tipo).toBe('sucesso-excluir'));
});

test('erro de atualização não repete exclusão já persistida', async () => {
    const service = { excluirCiclo: jest.fn().mockResolvedValue({}) };
    await montar({
        service,
        estado: criarEstadoDoHook({ tentarNovamente: jest.fn().mockResolvedValue(false) })
    });
    await abrir();
    await act(() => popup().onConfirmar());
    expect(popup().tipo).toBe('sucesso-excluir');
    await act(() => popup().onConfirmar());
    expect(service.excluirCiclo).toHaveBeenCalledTimes(1);
});

test('preserva sessão expirada e edição existente', async () => {
    const onSessaoExpirada = jest.fn();
    const service = { excluirCiclo: jest.fn().mockRejectedValue({ status: 401 }) };
    await montar({ service, onSessaoExpirada });
    await abrir();
    await act(() => popup().onConfirmar());
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
    await act(() => popup().onFechar());
    await act(() => tela().aoEditarCiclo(ciclo));
    expect(CycleEditFlow.mock.calls.at(-1)[0]).toMatchObject({ ciclo, service });
    await act(() => CycleEditFlow.mock.calls.at(-1)[0].onFechar());
});
