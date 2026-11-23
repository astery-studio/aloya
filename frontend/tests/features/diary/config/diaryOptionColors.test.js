import { obterApresentacaoOpcao } from '../../../../src/features/diary/config/diaryOptionPresentation';

const coresSemanticas = [
    ['fluxo_menstrual', 'aspecto', 'Vermelho vivo', '#CB442A'],
    ['fluxo_menstrual', 'aspecto', 'Vermelho escuro', '#881F0A'],
    ['fluxo_menstrual', 'aspecto', 'Marrom', '#8D6C65'],
    ['fluxo_menstrual', 'aspecto', 'Rosado', '#F79696'],
    ['sangramento_escape', 'cor', 'Vermelho vivo', '#CB442A'],
    ['sangramento_escape', 'cor', 'Vermelho escuro', '#881F0A'],
    ['sangramento_escape', 'cor', 'Marrom', '#8D6C65'],
    ['sangramento_escape', 'cor', 'Rosado', '#F79696'],
    ['sangramento_escape', 'cor', 'Vermelho amarronzado', '#BA5757'],
    ['secrecao_corrimento', 'cor', 'Branca', '#FFFFFF'],
    ['secrecao_corrimento', 'cor', 'Branco amarelada', '#E4CAA8'],
    ['secrecao_corrimento', 'cor', 'Amarelada', '#B07D2A'],
    ['secrecao_corrimento', 'cor', 'Rosada', '#F79696'],
    ['secrecao_corrimento', 'cor', 'Marrom', '#8D6C65'],
    ['secrecao_corrimento', 'cor', 'Cinza', '#999999'],
    ['secrecao_corrimento', 'cor', 'Esverdeada', '#3D4A3D']
];

test.each(coresSemanticas)('preserva a cor de %s/%s/%s', (categoriaId, grupo, nome, color) => {
    const opcao = { id: `${categoriaId}_${grupo}_${nome}`, grupo, nome };
    expect(obterApresentacaoOpcao(categoriaId, opcao).iconeProps).toEqual({
        weight: 'fill',
        color
    });
});

test.each([
    ['fluxo_menstrual', 'coagulos', 'Muitos', 'fluxo_menstrual_coagulos_muitos'],
    [
        'secrecao_corrimento',
        'caracteristicas',
        'Odor diferente do habitual',
        'secrecao_corrimento_caracteristicas_odor_diferente_do_habitual'
    ],
    [
        'secrecao_corrimento',
        'caracteristicas',
        'Pequenos grumos',
        'secrecao_corrimento_caracteristicas_pequenos_grumos'
    ],
    [
        'secrecao_corrimento',
        'caracteristicas',
        'Presença de sangue',
        'secrecao_corrimento_caracteristicas_presenca_de_sangue'
    ]
])('preserva o preenchimento de %s/%s/%s', (categoriaId, grupo, nome, id) => {
    const opcao = { id, grupo, nome };
    expect(obterApresentacaoOpcao(categoriaId, opcao).iconeProps).toEqual({ weight: 'fill' });
});
