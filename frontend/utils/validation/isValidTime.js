/**
 * Valida horários HH:MM dentro dos limites de hora e minuto.
 */
// Valida campos de formulário antes do envio.

// Recebe um horário em HH:MM, verifica seus limites e devolve verdadeiro ou falso.
export function horarioValido(valor) {
    if (typeof valor !== 'string' || !/^\d{2}:\d{2}$/.test(valor)) return false;
    const [hora, minuto] = valor.split(':').map(Number);
    return hora < 24 && minuto < 60;
}
