/**
 * Valida se um texto contém conteúdo visível após remoção de espaços.
 */
// Confirma que um campo de texto possui conteúdo visível.
export function isRequired(valor) {
    return typeof valor === 'string' && valor.trim().length > 0;
}
