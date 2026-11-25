import { criarCycleHomeViewModel } from '../../../../src/features/cycles/utils/cycleHomeViewModel';

test.each([
    [undefined, 'semCiclo'],
    [{ status: 'DADOS_INSUFICIENTES', motivos: ['INICIO_ELEGIVEL_AUSENTE'] }, 'semCiclo'],
    [{ status: 'DADOS_INSUFICIENTES' }, 'dadosInsuficientes'],
    [{ status: 'DISPONIVEL' }, 'comCiclo']
])('distingue o estado de domínio %#', (previsao, estado) => {
    expect(criarCycleHomeViewModel({ previsao }).estado).toBe(estado);
});

test('deriva fase, confiança, incerteza e janela fértil da data selecionada', () => {
    expect(
        criarCycleHomeViewModel({
            previsao: {
                status: 'PARCIALMENTE_DISPONIVEL',
                confiabilidadeMenstrual: { nivel: 'MEDIA' }
            },
            fase: 'folicular',
            dataSelecionada: '2026-10-10',
            janelaFertil: { inicio: '2026-10-09', fim: '2026-10-14' }
        })
    ).toMatchObject({
        fase: 'folicular',
        nivelConfiabilidade: 'media',
        previsaoIncerta: true,
        janelaFertilAtiva: true
    });
});

test('mantém a janela fértil visível na fase ovulatória sem intervalo da API', () => {
    expect(
        criarCycleHomeViewModel({
            previsao: { status: 'DISPONIVEL' },
            fase: 'ovulatoria',
            dataSelecionada: '2026-10-14'
        }).janelaFertilAtiva
    ).toBe(true);
});

test.each([
    ['2026-10-08', false],
    ['2026-10-09', true],
    ['2026-10-14', true],
    ['2026-10-15', false]
])('inclui as duas datas limite da janela fértil da API (%s)', (dataSelecionada, visivel) => {
    const modelo = criarCycleHomeViewModel({
        previsao: {
            status: 'PREVISAO_ULTRAPASSADA',
            janelaFertilEstimada: { inicio: '2026-10-09', fim: '2026-10-14' }
        },
        dataSelecionada,
        fase: 'folicular'
    });

    expect(modelo).toMatchObject({ previsaoIncerta: true, janelaFertilAtiva: visivel });
});

test.each([
    [undefined, { inicio: '2026-10-09', fim: '2026-10-14' }],
    ['2026-10-10', { fim: '2026-10-14' }],
    ['2026-10-10', { inicio: '2026-10-09' }]
])('ignora datas e intervalos incompletos (%#)', (dataSelecionada, janelaFertil) => {
    expect(criarCycleHomeViewModel({ dataSelecionada, janelaFertil }).janelaFertilAtiva).toBe(
        false
    );
});

test('dados insuficientes com outro motivo não indicam primeiro uso', () => {
    expect(
        criarCycleHomeViewModel({
            previsao: { status: 'DADOS_INSUFICIENTES', motivos: ['OUTRO_MOTIVO'] }
        }).estado
    ).toBe('dadosInsuficientes');
});
