import { cores } from '../../../../src/shared/theme/colors';

test.each([
    ['ciclo', '#C85A44', '#FDF0EC', 'rgba(200, 90, 68, 0.2)', 'rgba(200, 90, 68, 0.1)'],
    ['corpo', '#2C4C3B', '#EEF4F0', 'rgba(44, 76, 59, 0.2)', 'rgba(44, 76, 59, 0.1)'],
    ['emocional', '#7B5EA7', '#EDE6F8', 'rgba(123, 94, 167, 0.2)', 'rgba(123, 94, 167, 0.1)'],
    ['energia', '#B07D2A', '#FBF3E0', 'rgba(176, 125, 42, 0.2)', 'rgba(176, 125, 42, 0.1)'],
    ['vidaIntima', '#B04A70', '#FAECF2', 'rgba(176, 74, 112, 0.2)', 'rgba(176, 74, 112, 0.1)'],
    ['saude', '#4A5899', '#EEF0F8', 'rgba(74, 88, 153, 0.2)', 'rgba(74, 88, 153, 0.1)']
])(
    'preserva as cores exatas dos ícones de %s',
    (paleta, icone, fundoIcone, fundoCategoria, fundoOpcao) => {
        expect(cores.redeApoio[paleta]).toMatchObject({
            icone,
            fundoIcone,
            fundoCategoria,
            fundoOpcao,
            fundoDiarioExpandido: expect.stringContaining('0.533')
        });
    }
);
