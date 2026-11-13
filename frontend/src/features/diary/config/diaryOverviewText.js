// Centraliza a linguagem do resumo pessoal para manter regras de texto fora do fluxo visual.
const DESCRICOES_PADRAO_POR_FASE = Object.freeze({
    menstruacao: 'Nesta fase, é comum sentir necessidade de descanso e maior sensibilidade.',
    folicular: 'Nesta fase, é comum perceber mais energia, disposição e motivação.',
    ovulacao:
        'Nesta fase, é comum perceber mais disposição, sociabilidade e sinais de fertilidade.',
    lutea: 'Nesta fase, são comuns mudanças de energia, sensibilidade e alterações de humor.'
});

const ROTULOS_CATEGORIAS = Object.freeze({
    fluxo_menstrual: 'Fluxo menstrual',
    sangramento_escape: 'Sangramento de escape',
    secrecao_corrimento: 'Secreção/corrimento',
    sintomas_fisicos: 'Sintomas físicos',
    sintomas_pre_menstruais: 'Sintomas pré-menstruais',
    sintomas_emocionais: 'Sintomas emocionais',
    tempo_sono: 'Tempo de sono',
    qualidade_sono: 'Qualidade do sono'
});

const CARACTERISTICAS_PELE_COM = new Set([
    'acne',
    'espinhas',
    'cravos',
    'sensibilidade',
    'vermelhidão',
    'irritação',
    'manchas',
    'inchaço',
    'coceira',
    'descamação'
]);
const CARACTERISTICAS_CABELO_COM = new Set(['frizz', 'queda', 'descamação']);

const TEXTOS_ENERGIA = Object.freeze({
    'sem energia': 'baixa energia',
    'com energia': 'boa disposição e energia',
    exausto: 'exaustão',
    exausta: 'exaustão',
    cansado: 'cansaço',
    cansada: 'cansaço',
    disposto: 'boa disposição',
    disposta: 'boa disposição',
    agitado: 'agitação',
    agitada: 'agitação',
    'energia oscilante': 'energia oscilante'
});

function rotuloCategoriaResumo(categoriaId) {
    if (typeof categoriaId !== 'string' || !categoriaId.trim()) return '';
    if (ROTULOS_CATEGORIAS[categoriaId]) return ROTULOS_CATEGORIAS[categoriaId];
    const texto = categoriaId.trim().replaceAll('_', ' ');
    return `${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;
}

function formatarDestaque({ categoriaId, grupo, valor } = {}) {
    const valorLimpo = typeof valor === 'string' ? valor.trim() : '';
    if (!valorLimpo) return '';
    const valorMinusculo = valorLimpo.toLocaleLowerCase('pt-BR');

    if (categoriaId === 'fluxo_menstrual') {
        if (grupo === 'coagulos') {
            if (valorMinusculo === 'nenhum') return 'ausência de coágulos no fluxo menstrual';
            if (valorMinusculo === 'muitos') return 'muitos coágulos no fluxo menstrual';
            return `coágulos ${valorMinusculo} no fluxo menstrual`;
        }
        if (grupo === 'aspecto') return `fluxo menstrual de cor ${valorMinusculo}`;
        return `fluxo menstrual ${valorMinusculo}`;
    }

    if (categoriaId === 'sangramento_escape') {
        if (grupo === 'cor') return `sangramento de escape de cor ${valorMinusculo}`;
        return `sangramento de escape ${valorMinusculo}`;
    }

    if (categoriaId === 'secrecao_corrimento') {
        if (grupo === 'presenca') {
            if (valorMinusculo === 'nenhuma') return 'ausência de secreção/corrimento';
            if (valorMinusculo === 'pouca') return 'pouca secreção/corrimento';
            if (valorMinusculo === 'moderada') return 'quantidade moderada de secreção/corrimento';
            if (valorMinusculo === 'abundante') return 'secreção/corrimento abundante';
        }
        if (grupo === 'cor') return `secreção/corrimento de cor ${valorMinusculo}`;
        if (grupo === 'consistencia')
            return `secreção/corrimento com consistência ${valorMinusculo}`;
        return `secreção/corrimento ${valorMinusculo}`;
    }

    if (categoriaId === 'sintomas_fisicos') return `${valorMinusculo} como sintoma físico`;
    if (categoriaId === 'pele')
        return CARACTERISTICAS_PELE_COM.has(valorMinusculo)
            ? `pele com ${valorMinusculo}`
            : `pele ${valorMinusculo}`;
    if (categoriaId === 'cabelo')
        return CARACTERISTICAS_CABELO_COM.has(valorMinusculo)
            ? `cabelo com ${valorMinusculo}`
            : `cabelo ${valorMinusculo}`;
    if (categoriaId === 'digestao')
        return valorMinusculo === 'sem alterações'
            ? 'digestão sem alterações'
            : `${valorMinusculo} entre os sinais digestivos`;

    if (categoriaId === 'banheiro') {
        if (grupo === 'intestino') {
            if (valorMinusculo === 'normal') return 'funcionamento intestinal normal';
            if (valorMinusculo === 'dor') return 'dor intestinal';
            return `${valorMinusculo} no funcionamento intestinal`;
        }
        if (grupo === 'urina') {
            if (valorMinusculo === 'normal') return 'micção sem alterações';
            if (valorMinusculo === 'dor') return 'dor ao urinar';
            if (valorMinusculo === 'alteração na cor') return 'alteração na cor da urina';
            return `${valorMinusculo} ao urinar`;
        }
    }

    if (categoriaId === 'regiao_genital')
        return valorMinusculo === 'sem alterações'
            ? 'região genital sem alterações'
            : `${valorMinusculo} na região genital`;
    if (categoriaId === 'torax_peito')
        return valorMinusculo === 'sem alterações'
            ? 'tórax/peito sem alterações'
            : `${valorMinusculo} no tórax/peito`;
    if (categoriaId === 'sintomas_emocionais') return `humor descrito como ${valorMinusculo}`;
    if (categoriaId === 'sintomas_pre_menstruais')
        return `${valorMinusculo} no período pré-menstrual`;
    if (categoriaId === 'energia')
        return TEXTOS_ENERGIA[valorMinusculo] ?? `energia descrita como ${valorMinusculo}`;
    if (categoriaId === 'qualidade_sono')
        return grupo === 'tipo' ? `sono ${valorMinusculo}` : valorMinusculo;

    if (categoriaId === 'vida_social') {
        if (grupo === 'interacao') return `interação social descrita como ${valorMinusculo}`;
        if (grupo === 'relacionamentos') return `${valorMinusculo} nos relacionamentos`;
        return `experiência social descrita como ${valorMinusculo}`;
    }

    if (categoriaId === 'testes')
        return grupo === 'teste'
            ? `teste de ${valorMinusculo}`
            : `resultado ${valorMinusculo} em testes`;
    if (categoriaId === 'consultas') {
        if (grupo === 'consulta') return `consulta com ${valorMinusculo}`;
        if (grupo === 'exame') return `exame de ${valorMinusculo}`;
        return `acompanhamento de ${valorMinusculo}`;
    }
    if (categoriaId === 'temperatura_basal') return 'registros de temperatura basal';
    if (categoriaId === 'peso') return 'registros de peso';
    if (categoriaId === 'tempo_sono') return 'registros do tempo de sono';

    const categoria = rotuloCategoriaResumo(categoriaId);
    if (!categoria || categoria.localeCompare(valorLimpo, 'pt-BR', { sensitivity: 'base' }) === 0)
        return valorMinusculo;
    return `${valorMinusculo} na categoria ${categoria.toLocaleLowerCase('pt-BR')}`;
}

function listarDestaques(destaques = []) {
    const valores = destaques.map(formatarDestaque).filter(Boolean);
    if (valores.length < 2) return valores[0] ?? '';
    return `${valores.slice(0, -1).join(', ')} e ${valores.at(-1)}`;
}

function criarDescricaoResumo({ fase, resumo }) {
    if (resumo?.informacoesSuficientes && resumo.destaques?.length) {
        return `Nos seus registros, você costuma relatar ${listarDestaques(resumo.destaques)}.`;
    }
    return DESCRICOES_PADRAO_POR_FASE[fase];
}

export {
    criarDescricaoResumo,
    DESCRICOES_PADRAO_POR_FASE,
    formatarDestaque,
    listarDestaques,
    rotuloCategoriaResumo
};
