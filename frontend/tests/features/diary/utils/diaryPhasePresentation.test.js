import {
    FASE_INDEFINIDA_DIARIO,
    FASES_DIARIO,
    obterApresentacaoFase,
    obterApresentacaoFaseRegistro
} from '../../../../src/features/diary/utils/diaryPhasePresentation';

test.each([
    ['menstruacao', 'Fase Menstrual', '#C85A44', 'fill'],
    ['folicular', 'Fase Folicular', '#3B7150', 'regular'],
    ['ovulacao', 'Fase Ovulatória', '#4A758E', 'regular'],
    ['lutea', 'Fase Lútea', '#B06D2A', 'regular']
])('apresenta a fase %s com identidade própria', (fase, rotulo, cor, pesoIcone) => {
    const apresentacao = obterApresentacaoFase(fase);

    expect(apresentacao).toMatchObject({ rotulo, cor, pesoIcone });
    expect(apresentacao.fundo).toContain('rgba');
    expect(apresentacao.fundoIcone).toContain('0.10');
    expect(apresentacao.Icone).toBeDefined();
});

test('não inventa apresentação quando a fase é desconhecida', () => {
    expect(obterApresentacaoFase(null)).toBeNull();
    expect(Object.keys(FASES_DIARIO)).toHaveLength(4);
});

test('apresenta registros antigos sem fase de forma neutra', () => {
    expect(obterApresentacaoFaseRegistro(null)).toBe(FASE_INDEFINIDA_DIARIO);
    expect(obterApresentacaoFaseRegistro('folicular')).toBe(FASES_DIARIO.folicular);
    expect(obterApresentacaoFaseRegistro('inexistente')).toBeNull();
});
