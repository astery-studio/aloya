/**
 * Valida o formato básico e o limite de tamanho dos e-mails aceitos.
 */
// Verifica o formato básico de um e-mail com até 254 caracteres.
export function isValidEmail(valor) {
    if (typeof valor !== 'string' || valor.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}
