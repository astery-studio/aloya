// Confirma que um campo de texto possui conteúdo visível.
export function isRequired(valor) {
    return typeof valor === 'string' && valor.trim().length > 0;
}
