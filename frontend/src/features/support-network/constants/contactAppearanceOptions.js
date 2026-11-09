//Centraliza as opções visuais permitidas para identificar contatos da Rede de Apoio.
const COR_ICONE_NAO_SELECIONADO = '#A8A49C';

const OPCOES_ICONE_CONTATO = Object.freeze([
    Object.freeze({
        id: 'pessoa',
        rotulo: 'Pessoa'
    }),
    Object.freeze({
        id: 'coracao',
        rotulo: 'Coração'
    }),
    Object.freeze({
        id: 'sol',
        rotulo: 'Sol'
    }),
    Object.freeze({
        id: 'escudo',
        rotulo: 'Escudo'
    }),
    Object.freeze({
        id: 'tulipa',
        rotulo: 'Tulipa'
    }),
    Object.freeze({
        id: 'aperto_maos',
        rotulo: 'Aperto de mãos'
    }),
    Object.freeze({
        id: 'lotus',
        rotulo: 'Flor de lótus'
    }),
    Object.freeze({
        id: 'brilho',
        rotulo: 'Brilho'
    }),
    Object.freeze({
        id: 'arco_iris',
        rotulo: 'Arco-íris'
    }),
    Object.freeze({
        id: 'sorriso',
        rotulo: 'Sorriso'
    })
]);

const OPCOES_COR_CONTATO = Object.freeze([
    Object.freeze({
        id: 'branco',
        rotulo: 'Branco',
        cor: '#FFFFFF',
        fundo: '#FFFFFF',
        borda: '#E6E2D8'
    }),
    Object.freeze({
        id: 'coral',
        rotulo: 'Coral',
        cor: '#C85A44',
        fundo: 'rgba(200, 90, 68, 0.14)',
        borda: 'rgba(200, 90, 68, 0.72)'
    }),
    Object.freeze({
        id: 'verde',
        rotulo: 'Verde',
        cor: '#2C4C3B',
        fundo: 'rgba(44, 76, 59, 0.14)',
        borda: 'rgba(44, 76, 59, 0.72)'
    }),
    Object.freeze({
        id: 'laranja',
        rotulo: 'Laranja',
        cor: '#D68C3A',
        fundo: 'rgba(214, 140, 58, 0.14)',
        borda: 'rgba(214, 140, 58, 0.72)'
    }),
    Object.freeze({
        id: 'azul',
        rotulo: 'Azul',
        cor: '#4A758E',
        fundo: 'rgba(74, 117, 142, 0.14)',
        borda: 'rgba(74, 117, 142, 0.72)'
    }),
    Object.freeze({
        id: 'roxo',
        rotulo: 'Roxo',
        cor: '#7B5EA7',
        fundo: 'rgba(123, 94, 167, 0.14)',
        borda: 'rgba(123, 94, 167, 0.72)'
    }),
    Object.freeze({
        id: 'cinza',
        rotulo: 'Cinza',
        cor: '#999999',
        fundo: 'rgba(153, 153, 153, 0.14)',
        borda: 'rgba(153, 153, 153, 0.72)'
    })
]);

const IDS_ICONES_CONTATO = Object.freeze(OPCOES_ICONE_CONTATO.map(({ id }) => id));

const IDS_CORES_CONTATO = Object.freeze(OPCOES_COR_CONTATO.map(({ id }) => id));

function obterOpcaoIconeContato(iconeId) {
    return OPCOES_ICONE_CONTATO.find(({ id }) => id === iconeId) ?? OPCOES_ICONE_CONTATO[0];
}

function obterOpcaoCorContato(corId) {
    return OPCOES_COR_CONTATO.find(({ id }) => id === corId) ?? OPCOES_COR_CONTATO[0];
}

function iconeContatoEhValido(iconeId) {
    return IDS_ICONES_CONTATO.includes(iconeId);
}

function corContatoEhValida(corId) {
    return IDS_CORES_CONTATO.includes(corId);
}

export {
    COR_ICONE_NAO_SELECIONADO,
    IDS_CORES_CONTATO,
    IDS_ICONES_CONTATO,
    OPCOES_COR_CONTATO,
    OPCOES_ICONE_CONTATO,
    corContatoEhValida,
    iconeContatoEhValido,
    obterOpcaoCorContato,
    obterOpcaoIconeContato
};
