import {
    interfaceEscuraDiario,
    macrocategoriasEscuras,
    obterCoresDiario
} from '../../../../src/features/diary/config/diaryColors';
import { temaClaro, temaEscuro } from '../../../../src/shared/theme/themePalettes';

test('reutiliza os tokens existentes no modo claro', () => {
    const cores = obterCoresDiario(temaClaro);

    expect(cores.interface).toBe(temaClaro.cores.interface);
    expect(cores.primaria).toBe(temaClaro.cores.marca.primaria);
    expect(cores.textoSobrePrimaria).toBe('#FFFFFF');
    expect(cores.macrocategorias).toBe(temaClaro.cores.redeApoio);
});

test('aplica fielmente a paleta noturna do protótipo', () => {
    const cores = obterCoresDiario(temaEscuro);

    expect(cores.interface).toBe(interfaceEscuraDiario);
    expect(cores).toMatchObject({ primaria: '#C26E5F', textoSobrePrimaria: '#121212' });
    expect(interfaceEscuraDiario).toMatchObject({
        fundo: '#121212',
        superficie: '#1E1E1E',
        superficieElevada: '#242424',
        borda: '#2F2F2F',
        textoPrincipal: '#E3E3E3',
        textoSecundario: '#999999'
    });
    expect(cores.macrocategorias).toBe(macrocategoriasEscuras);
    expect(macrocategoriasEscuras.ciclo.icone).toBe('#EF9A9A');
    expect(macrocategoriasEscuras.corpo.icone).toBe('#A5D6A7');
    expect(macrocategoriasEscuras.emocional.icone).toBe('#B59DDB');
    expect(macrocategoriasEscuras.energia.icone).toBe('#FFE082');
    expect(macrocategoriasEscuras.vidaIntima.icone).toBe('#EF9A9A');
    expect(macrocategoriasEscuras.saude.icone).toBe('#90CAF9');
});
