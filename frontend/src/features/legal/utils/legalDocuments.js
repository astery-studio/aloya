function secaoDisponivel({ blocos, contatoSuporte }) {
    return blocos.length > 0 || Boolean(contatoSuporte);
}

function prepararDocumentos(documentos) {
    return Object.fromEntries(
        Object.entries(documentos).map(([id, documento]) => [
            id,
            {
                ...documento,
                secoes: documento.secoes.filter(secaoDisponivel)
            }
        ])
    );
}

const documentosLegais = __DEV__
    ? prepararDocumentos(require('../data/legalDocuments.json'))
    : null;

function normalizarDocumentoInicial(documentoInicial) {
    return documentoInicial === 'terms' ? 'terms' : 'privacy';
}

export { documentosLegais, normalizarDocumentoInicial, prepararDocumentos };
