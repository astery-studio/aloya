jest.mock('phosphor-react-native', () => ({
    BatteryCharging: jest.fn(),
    ClipboardText: jest.fn(),
    Drop: jest.fn(),
    FirstAid: jest.fn(),
    Heart: jest.fn(),
    Smiley: jest.fn()
}));

import {
    apresentacaoMacrocategorias,
    obterApresentacaoMacrocategoria
} from '../../../../src/features/diary/config/diaryMacroPresentation';

test('apresenta as seis macrocategorias do backend', () => {
    expect(Object.keys(apresentacaoMacrocategorias)).toEqual([
        'ciclo_sangramento',
        'corpo_sintomas_fisicos',
        'emocional',
        'energia_sono',
        'vida_intima_social',
        'saude_acompanhamento'
    ]);
    for (const apresentacao of Object.values(apresentacaoMacrocategorias)) {
        expect(apresentacao).toMatchObject({
            icone: expect.anything(),
            paleta: expect.any(String)
        });
    }
    expect(apresentacaoMacrocategorias.ciclo_sangramento.iconeProps).toEqual({ weight: 'fill' });
    expect(apresentacaoMacrocategorias.emocional.iconeProps).toEqual({ weight: 'fill' });
    expect(apresentacaoMacrocategorias.energia_sono.iconeProps).toEqual({ weight: 'fill' });
    expect(apresentacaoMacrocategorias.corpo_sintomas_fisicos.iconeProps).toBeUndefined();
});

test('usa a apresentação de ciclo como fallback seguro', () => {
    expect(obterApresentacaoMacrocategoria('desconhecida')).toBe(
        apresentacaoMacrocategorias.ciclo_sangramento
    );
    expect(obterApresentacaoMacrocategoria('emocional')).toBe(
        apresentacaoMacrocategorias.emocional
    );
});
