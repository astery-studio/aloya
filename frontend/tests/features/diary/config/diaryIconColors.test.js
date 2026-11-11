import { cores } from '../../../../src/shared/theme/colors';

test.each([
    ['ciclo', '#C85A44', '#FDF0EC', 'rgba(253, 240, 236, 0.533)'],
    ['corpo', '#2C4C3B', '#EEF4F0', 'rgba(238, 244, 240, 0.533)'],
    ['emocional', '#7B5EA7', '#EDE6F8', 'rgba(237, 230, 248, 0.533)'],
    ['energia', '#B07D2A', '#FBF3E0', 'rgba(251, 243, 224, 0.533)'],
    ['vidaIntima', '#B04A70', '#FAECF2', 'rgba(250, 236, 242, 0.533)'],
    ['saude', '#4A5899', '#EEF0F8', 'rgba(238, 240, 248, 0.533)']
])('preserva as cores exatas dos ícones de %s', (paleta, icone, fundoIcone, fundoExpandido) => {
    expect(cores.redeApoio[paleta]).toMatchObject({
        icone,
        fundoIcone,
        fundoDiarioExpandido: fundoExpandido
    });
});
