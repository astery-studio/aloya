import {
    DropIcon,
    FirstAidKitIcon,
    HeartIcon,
    LightningIcon,
    PersonArmsSpreadIcon,
    UsersIcon
} from '../../../shared/components/icons/AppIcons';

const apresentacaoMacrocategorias = Object.freeze({
    ciclo_sangramento: { icone: DropIcon, paleta: 'ciclo', iconeProps: { weight: 'fill' } },
    corpo_sintomas_fisicos: { icone: PersonArmsSpreadIcon, paleta: 'corpo' },
    emocional: { icone: HeartIcon, paleta: 'emocional', iconeProps: { weight: 'fill' } },
    energia_sono: { icone: LightningIcon, paleta: 'energia', iconeProps: { weight: 'fill' } },
    vida_intima_social: { icone: UsersIcon, paleta: 'vidaIntima' },
    saude_acompanhamento: { icone: FirstAidKitIcon, paleta: 'saude' }
});

function obterApresentacaoMacrocategoria(id) {
    return apresentacaoMacrocategorias[id] ?? apresentacaoMacrocategorias.ciclo_sangramento;
}

export { apresentacaoMacrocategorias, obterApresentacaoMacrocategoria };
