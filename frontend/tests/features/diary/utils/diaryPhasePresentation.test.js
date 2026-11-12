import {
    FASE_INDEFINIDA_DIARIO,
    FASES_DIARIO,
    obterApresentacaoFase,
    obterApresentacaoFaseRegistro
} from '../../../../src/features/diary/utils/diaryPhasePresentation';

test.each([
    ['menstruacao', 'Fase Menstrual', '#C85A44'],
    ['folicular', 'Fase Folicular', '#3B7150'],
    ['ovulacao', 'Fase Ovulatória', '#4A758E'],
    ['lutea', 'Fase Lútea', '#B06D2A']
])('apresenta a fase %s com identidade própria', (fase, rotulo, cor) => {
    const apresentacao = obterApresentacaoFase(fase);

    expect(apresentacao).toMatchObject({ rotulo, cor });
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
