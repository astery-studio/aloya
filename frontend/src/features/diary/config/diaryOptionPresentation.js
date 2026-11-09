import { diaryIcons } from '../../../shared/components/icons/DiaryIcons';
import { diaryGroupPresentation } from './diaryGroupPresentation';

const excecoes = Object.freeze({
    secrecao_corrimento_consistencia_aquosa: 'ciclo-secrecao-consistencia-aquosa-liquida',
    secrecao_corrimento_caracteristicas_sem_odor:
        'ciclo-secrecao-caracteristicas-sem-odor-perceptivel',
    secrecao_corrimento_caracteristicas_aspecto_espumoso:
        'ciclo-secrecao-caracteristicas-com-aspecto-espumoso',
    secrecao_corrimento_caracteristicas_presenca_de_sangue:
        'ciclo-secrecao-caracteristicas-com-presenca-de-sangue',
    secrecao_corrimento_caracteristicas_pequenos_grumos:
        'ciclo-secrecao-caracteristicas-com-pequenos-grumos',
    sintomas_fisicos_sintomas_inchaco: 'corpo-sintomas-fisicos-inchaco-corporal',
    digestao_sintomas_sem_alteracoes: 'corpo-digestao-sem-alteracoes-percebidas',
    regiao_genital_sintomas_sem_alteracoes: 'corpo-regiao-genital-sem-alteracoes-percebidas',
    torax_peito_sintomas_sem_alteracoes: 'corpo-torax-peito-sem-alteracoes-percebidas'
});

const propriedadesEspeciais = Object.freeze({
    'ciclo-fluxo-menstrual-coagulos-muitos': { weight: 'fill' },
    'ciclo-secrecao-caracteristicas-odor-diferente-do-habitual': { weight: 'fill' },
    'ciclo-secrecao-caracteristicas-com-pequenos-grumos': { weight: 'fill' },
    'ciclo-secrecao-caracteristicas-com-presenca-de-sangue': { weight: 'fill' }
});

const coresGotas = Object.freeze({
    'vermelho-vivo': '#CB442A',
    'vermelho-escuro': '#881F0A',
    marrom: '#8D6C65',
    rosado: '#F79696',
    rosada: '#F79696',
    'vermelho-amarronzado': '#BA5757',
    branca: '#FFFFFF',
    'branco-amarelada': '#E4CAA8',
    amarelada: '#B07D2A',
    cinza: '#999999',
    esverdeada: '#3D4A3D'
});

function criarSlug(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function obterApresentacaoOpcao(categoriaId, opcao) {
    const grupo = diaryGroupPresentation[`${categoriaId}:${opcao.grupo}`];
    const iconeId = excecoes[opcao.id] ?? `${grupo?.[1] ?? ''}${criarSlug(opcao.nome)}`;
    if (!grupo || !Object.hasOwn(diaryIcons, iconeId)) return null;
    const cor = Object.entries(coresGotas).find(([sufixo]) => iconeId.endsWith(sufixo))?.[1];
    return {
        iconeId,
        iconeProps: {
            ...propriedadesEspeciais[iconeId],
            ...(cor ? { weight: 'fill', color: cor } : {})
        }
    };
}

export { criarSlug, obterApresentacaoOpcao };
