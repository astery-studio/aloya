import {
    BatteryCharging,
    ClipboardText,
    Drop,
    FirstAid,
    Heart,
    Smiley
} from 'phosphor-react-native';

const apresentacaoMacrocategorias = Object.freeze({
    ciclo_sangramento: { icone: Drop, paleta: 'ciclo' },
    corpo_sintomas_fisicos: { icone: FirstAid, paleta: 'corpo' },
    emocional: { icone: Smiley, paleta: 'emocional' },
    energia_sono: { icone: BatteryCharging, paleta: 'energia' },
    vida_intima_social: { icone: Heart, paleta: 'vidaIntima' },
    saude_acompanhamento: { icone: ClipboardText, paleta: 'saude' }
});

function obterApresentacaoMacrocategoria(id) {
    return apresentacaoMacrocategorias[id] ?? apresentacaoMacrocategorias.ciclo_sangramento;
}

export { apresentacaoMacrocategorias, obterApresentacaoMacrocategoria };
