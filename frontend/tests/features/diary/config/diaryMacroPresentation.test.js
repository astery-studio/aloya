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
    obterApresentacaoMacrocategoria,
    obterCorMacrocategoria
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

test('obtém a cor própria da paleta de cada macrocategoria', () => {
    const tema = {
        cores: {
            redeApoio: {
                ciclo: { icone: '#C85A44' },
                corpo: { icone: '#2C4C3B' },
                emocional: { icone: '#7B5EA7' },
                energia: { icone: '#B07D2A' },
                vidaIntima: { icone: '#B04A70' },
                saude: { icone: '#4A5899' }
            }
        }
    };

    expect(obterCorMacrocategoria(tema, 'ciclo_sangramento')).toBe('#C85A44');
    expect(obterCorMacrocategoria(tema, 'corpo_sintomas_fisicos')).toBe('#2C4C3B');
    expect(obterCorMacrocategoria(tema, 'emocional')).toBe('#7B5EA7');
    expect(obterCorMacrocategoria(tema, 'energia_sono')).toBe('#B07D2A');
    expect(obterCorMacrocategoria(tema, 'vida_intima_social')).toBe('#B04A70');
    expect(obterCorMacrocategoria(tema, 'saude_acompanhamento')).toBe('#4A5899');
    expect(obterCorMacrocategoria(tema, 'desconhecida')).toBe('#C85A44');
    expect(obterCorMacrocategoria(null, 'emocional')).toBe('#C85A44');
});
