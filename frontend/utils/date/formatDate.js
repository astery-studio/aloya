/**
 * Formata progressivamente entradas numéricas no padrão DD/MM/AAAA.
 */
// Aplica a máscara DD/MM/AAAA enquanto a pessoa digita.
export function formatDate(valor) {
    if (typeof valor !== 'string') return '';
    const numeros = valor.replace(/\D/g, '').slice(0, 8);
    if (numeros.length > 4) {
        return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
    }
    if (numeros.length > 2) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return numeros;
}
