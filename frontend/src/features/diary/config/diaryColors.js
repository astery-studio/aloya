import { coresNoturnasConteudo } from '../../../shared/theme/coresNoturnasConteudo';

const criarPaletaMacro = (icone, fundoIcone, fundoCategoria, fundoOpcao) =>
    Object.freeze({
        icone,
        fundoIcone,
        fundoCategoria,
        fundoOpcao,
        fundoExpandido: fundoOpcao,
        fundoDiarioExpandido: fundoCategoria,
        bordaExpandida: fundoCategoria
    });

const interfaceEscuraDiario = Object.freeze({
    fundo: coresNoturnasConteudo.fundo,
    superficie: coresNoturnasConteudo.superficie,
    superficieElevada: '#242424',
    textoPrincipal: '#E3E3E3',
    textoSecundario: coresNoturnasConteudo.textoSecundario,
    textoDesabilitado: 'rgba(255, 255, 255, 0.38)',
    borda: '#2F2F2F',
    separador: coresNoturnasConteudo.borda,
    switchInativo: '#424242',
    destaque: coresNoturnasConteudo.verde,
    destaqueSuave: 'rgba(165, 214, 167, 0.10)',
    textoSobreDestaque: '#121212'
});

const macrocategoriasEscuras = Object.freeze({
    ciclo: criarPaletaMacro(
        coresNoturnasConteudo.coral,
        'rgba(194, 110, 95, 0.10)',
        'rgba(194, 110, 95, 0.20)',
        'rgba(194, 110, 95, 0.10)'
    ),
    corpo: criarPaletaMacro(
        '#A5D6A7',
        'rgba(165, 214, 167, 0.10)',
        'rgba(165, 214, 167, 0.20)',
        'rgba(165, 214, 167, 0.10)'
    ),
    emocional: criarPaletaMacro(
        '#B59DDB',
        'rgba(181, 157, 219, 0.10)',
        'rgba(181, 157, 219, 0.20)',
        'rgba(181, 157, 219, 0.10)'
    ),
    energia: criarPaletaMacro(
        '#FFE082',
        'rgba(255, 224, 130, 0.10)',
        'rgba(255, 224, 130, 0.20)',
        'rgba(255, 224, 130, 0.10)'
    ),
    vidaIntima: criarPaletaMacro(
        '#EF9A9A',
        'rgba(239, 154, 154, 0.10)',
        'rgba(239, 154, 154, 0.20)',
        'rgba(239, 154, 154, 0.10)'
    ),
    saude: criarPaletaMacro(
        '#90CAF9',
        'rgba(144, 202, 249, 0.10)',
        'rgba(144, 202, 249, 0.20)',
        'rgba(144, 202, 249, 0.10)'
    )
});

function obterCoresDiario(tema) {
    if (!tema?.escuro) {
        return {
            interface: tema.cores.interface,
            primaria: tema.cores.marca?.primaria ?? '#C85A44',
            textoSobrePrimaria: '#FFFFFF',
            macrocategorias: tema.cores.redeApoio
        };
    }
    return {
        interface: interfaceEscuraDiario,
        primaria: coresNoturnasConteudo.coral,
        textoSobrePrimaria: coresNoturnasConteudo.fundo,
        macrocategorias: macrocategoriasEscuras
    };
}

export { interfaceEscuraDiario, macrocategoriasEscuras, obterCoresDiario };
