// Aplica a máscara HH:MM enquanto a pessoa digita.
export function formatTime(valor) {
    if (typeof valor !== 'string') return '';
    const numeros = valor.replace(/\D/g, '').slice(0, 4);
    return numeros.length > 2
        ? `${numeros.slice(0, 2)}:${numeros.slice(2)}` : numeros;
}
