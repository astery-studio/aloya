import {
    horarioDaConfirmacao,
    normalizarAcompanhamentoAnticoncepcional,
    normalizarRegistroHistorico,
    normalizarUsoAcompanhamento
} from '../../../../src/features/contraceptives/utils/contraceptiveTrackingAdapter';

const confirmadoEm = new Date(2026, 8, 4, 9, 32, 12).toISOString();

test('exibe o horário local do timestamp real de confirmação, não o horário programado', () => {
    expect(horarioDaConfirmacao(confirmadoEm)).toBe('09:32');
    expect(horarioDaConfirmacao(null)).toBeNull();
    expect(horarioDaConfirmacao('inválido')).toBeNull();
    const resultado = normalizarRegistroHistorico({
        id: 12, data: '2026-09-04', horarioProgramado: '09:30', confirmadoEm, estado: 'confirmado'
    });
    expect(resultado).toEqual({
        id: '12', data: '2026-09-04', horarioProgramado: '09:30', confirmadoEm,
        estado: 'confirmado', horarioConfirmacao: '09:32'
    });
    expect(Object.isFrozen(resultado)).toBe(true);
});

test.each(['pendente', 'naoConfirmado', 'foraDoPrazo', 'confirmado'])(
    'preserva o estado %s recebido do histórico sem inventar confirmação',
    (estado) => {
        const resultado = normalizarRegistroHistorico({ id: 1, data: '2026-09-04', horarioProgramado: '10:00', estado });
        expect(resultado.estado).toBe(estado);
        expect(resultado.confirmadoEm).toBeNull();
        expect(resultado.horarioConfirmacao).toBeNull();
    }
);

test('normaliza o retorno de confirmação e a sinalização de atraso dos dois endpoints', () => {
    expect(normalizarUsoAcompanhamento({
        id: 1, data: '2026-09-04', horario: '09:30', status: 'confirmado', confirmadoEm,
        horarioConfirmacao: '00:00', confirmacaoForaPrazo: true
    })).toEqual({
        id: '1', data: '2026-09-04', horario: '09:30', status: 'confirmado', confirmadoEm,
        horarioConfirmacao: '09:32', foraDoPrazo: true, confirmacaoForaPrazo: true
    });
    expect(normalizarUsoAcompanhamento({ horarioProgramado: '09:30', estado: 'pendente', foraDoPrazo: false }))
        .toMatchObject({ horario: '09:30', status: 'pendente', confirmadoEm: null, horarioConfirmacao: null, confirmacaoForaPrazo: false });
});

test('preserva o formato legado e mantém arrays e registros de acompanhamento imutáveis sem mutar a API', () => {
    const base = Object.freeze({ id: '7', nome: 'Evra', programacao: Object.freeze({ horarios: Object.freeze(['09:30']) }) });
    const uso = Object.freeze({ id: 11, data: '2026-09-04', horario: '09:30', status: 'confirmado', confirmadoEm });
    const registroHistorico = Object.freeze({ id: 11, data: '2026-09-04', horarioProgramado: '09:30', confirmadoEm, estado: 'confirmado' });
    const registro = Object.freeze({ ativo: true, removidoEm: null, usosHoje: Object.freeze([uso]), historico: Object.freeze([registroHistorico]) });
    const resultado = normalizarAcompanhamentoAnticoncepcional(registro, base);
    expect(resultado.programacao).toBe(base.programacao);
    expect(resultado).toMatchObject({ id: '7', ativo: true, removido: false, removidoEm: null });
    expect(Object.isFrozen(resultado)).toBe(true);
    expect(Object.isFrozen(resultado.usosHoje)).toBe(true);
    expect(Object.isFrozen(resultado.historico)).toBe(true);
    expect(Object.isFrozen(resultado.usosHoje[0])).toBe(true);
    expect(Object.isFrozen(resultado.historico[0])).toBe(true);
    expect(registro.usosHoje[0].id).toBe(11);
});

test.each([
    { ativo: false, removidoEm: '2026-09-06T10:00:00Z' },
    { ativo: true, removidoEm: '2026-09-06T10:00:00Z' },
    { ativo: false }
])('identifica remoção real pelo registro %p', (registro) => {
    const resultado = normalizarAcompanhamentoAnticoncepcional(registro, { id: '7' });
    expect(resultado.ativo).toBe(false);
    expect(resultado.removido).toBe(true);
    expect(resultado.usosHoje).toEqual([]);
    expect(resultado.historico).toEqual([]);
});

test('não cria históricos de demonstração quando a API não envia registros', () => {
    expect(normalizarAcompanhamentoAnticoncepcional({}, { id: '7' })).toEqual({
        id: '7', ativo: true, removido: false, removidoEm: null, statusUltimoUso: null, usosHoje: [], historico: []
    });
});
