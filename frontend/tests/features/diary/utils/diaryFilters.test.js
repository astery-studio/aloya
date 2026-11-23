import {
    alternarValorFiltro,
    converterDataFiltroParaIso,
    criarChaveFiltrosDiario,
    criarFiltrosDaEdicao,
    possuiFiltrosDiario,
    validarPeriodoDiario
} from '../../../../src/features/diary/utils/diaryFilters';

test('converte e valida datas reais do filtro', () => {
    expect(converterDataFiltroParaIso()).toBeNull();
    expect(converterDataFiltroParaIso('08/04/2006')).toBe('2006-04-08');
    expect(converterDataFiltroParaIso('31/02/2006')).toBeNull();
    expect(converterDataFiltroParaIso('11/11/1111')).toBeNull();
    expect(
        validarPeriodoDiario({ dataInicio: '12/11/2026', dataFim: '11/11/2026' }, '2026-11-12')
    ).toBe('A data inicial não pode ser posterior à data final.');
    expect(validarPeriodoDiario({ dataInicio: '1', dataFim: '' }, '2026-11-12')).toBe(
        'Informe uma data inicial válida.'
    );
    expect(validarPeriodoDiario({ dataFim: '1' }, '2026-11-12')).toBe(
        'Informe uma data final válida.'
    );
    expect(validarPeriodoDiario({ dataInicio: '11/11/1111' }, '2026-11-12')).toBe(
        'Informe uma data inicial válida.'
    );
    expect(validarPeriodoDiario({ dataInicio: '01/01/7777' }, '2026-11-12')).toBe(
        'A data inicial não pode ser futura.'
    );
    expect(validarPeriodoDiario({ dataFim: '13/11/2026' }, '2026-11-12')).toBe(
        'A data final não pode ser futura.'
    );
});

test('usa valores vazios quando a edição do filtro é omitida', () => {
    expect(criarFiltrosDaEdicao()).toEqual({
        dataInicio: null,
        dataFim: null,
        categorias: [],
        fases: []
    });
});

test('normaliza seleções múltiplas e cria uma chave estável', () => {
    const filtros = criarFiltrosDaEdicao({
        dataInicio: '01/11/2026',
        categorias: ['pele', 'fluxo_menstrual', 'pele'],
        fases: ['lutea', 'menstrual', 'inexistente']
    });
    expect(filtros).toEqual({
        dataInicio: '2026-11-01',
        dataFim: null,
        categorias: ['fluxo_menstrual', 'pele'],
        fases: ['lutea', 'menstrual']
    });
    expect(possuiFiltrosDiario(filtros)).toBe(true);
    expect(criarChaveFiltrosDiario(filtros)).toBe(
        criarChaveFiltrosDiario({ ...filtros, categorias: [...filtros.categorias].reverse() })
    );
    expect(alternarValorFiltro(['pele'], 'pele')).toEqual([]);
    expect(alternarValorFiltro([], 'pele')).toEqual(['pele']);
});
