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
        expect(apresentacao).toEqual({ icone: expect.any(Function), paleta: expect.any(String) });
    }
});

test('usa a apresentação de ciclo como fallback seguro', () => {
    expect(obterApresentacaoMacrocategoria('desconhecida')).toBe(
        apresentacaoMacrocategorias.ciclo_sangramento
    );
    expect(obterApresentacaoMacrocategoria('emocional')).toBe(
        apresentacaoMacrocategorias.emocional
    );
});
