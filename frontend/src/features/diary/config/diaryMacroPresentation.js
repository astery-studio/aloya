import {
    DropIcon,
    FirstAidKitIcon,
    HeartIcon,
    LightningIcon,
    PersonArmsSpreadIcon,
    UsersIcon
} from '../../../shared/components/icons/AppIcons';
import { obterCoresDiario } from './diaryColors';

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

function obterCorMacrocategoria(tema, id) {
    const apresentacao = obterApresentacaoMacrocategoria(id);
    return (
        (tema ? obterCoresDiario(tema).macrocategorias[apresentacao.paleta]?.icone : null) ??
        tema?.cores?.redeApoio?.[apresentacao.paleta]?.icone ??
        tema?.cores?.redeApoio?.ciclo?.icone ??
        '#C85A44'
    );
}

export { apresentacaoMacrocategorias, obterApresentacaoMacrocategoria, obterCorMacrocategoria };
