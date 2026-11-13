//Define os identificadores de aparência que podem ser persistidos nos contatos.
const ICONE_CONTATO_PADRAO = 'pessoa';
const COR_CONTATO_PADRAO = 'branco';

const ICONES_CONTATO = Object.freeze([
    'pessoa',
    'coracao',
    'sol',
    'escudo',
    'tulipa',
    'aperto_maos',
    'lotus',
    'brilho',
    'arco_iris',
    'sorriso'
]);

const CORES_CONTATO = Object.freeze([
    'branco',
    'coral',
    'verde',
    'laranja',
    'azul',
    'roxo',
    'cinza'
]);

function iconeContatoEhValido(iconeId) {
    return typeof iconeId === 'string' && ICONES_CONTATO.includes(iconeId);
}

function corContatoEhValida(corId) {
    return typeof corId === 'string' && CORES_CONTATO.includes(corId);
}

export {
    CORES_CONTATO,
    COR_CONTATO_PADRAO,
    ICONES_CONTATO,
    ICONE_CONTATO_PADRAO,
    corContatoEhValida,
    iconeContatoEhValido
};
