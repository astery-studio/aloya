import {
    listarMesesDoCiclo,
    filtrarDiasDoCiclo
} from '../../../src/features/cycles/utils/cycleRemovalCalendar';
const ciclo = { dataInicio: '2026-08-29', dataFim: '2026-09-02' };
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
