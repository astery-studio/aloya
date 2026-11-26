import {
    normalizarDocumentoInicial,
    prepararDocumentos
} from '../../../../src/features/legal/utils/legalDocuments';

test('remove apenas seções sem blocos e sem contato de suporte', () => {
    const documentos = prepararDocumentos({
        privacy: {
            id: 'privacy',
            secoes: [
                { id: 'vazia', blocos: [] },
                { id: 'texto', blocos: [{ texto: 'Conteúdo' }] },
                { id: 'contato', blocos: [], contatoSuporte: true }
            ]
        }
    });

    expect(documentos.privacy.secoes.map(({ id }) => id)).toEqual(['texto', 'contato']);
});

test.each([
    ['terms', 'terms'],
    ['privacy', 'privacy'],
    [undefined, 'privacy'],
    ['desconhecido', 'privacy']
])('normaliza o documento inicial %s para %s', (recebido, esperado) => {
    expect(normalizarDocumentoInicial(recebido)).toBe(esperado);
});
