// Valida campos de formulário antes do envio.

// Recebe um texto, confirma se há conteúdo visível e devolve verdadeiro ou falso.
export function campoObrigatorio(valor) {
    return typeof valor === 'string' && valor.trim().length > 0;
}

// Recebe um e-mail, verifica o formato básico e devolve verdadeiro ou falso.
export function emailValido(valor) {
    if (typeof valor !== 'string' || valor.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
}

// Recebe uma data em DD/MM/AAAA, confere o calendário e devolve verdadeiro ou falso.
export function dataValida(valor) {
    if (typeof valor !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return false;
    const [dia, mes, ano] = valor.split('/').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return ano >= 1900 && data.getFullYear() === ano
        && data.getMonth() === mes - 1 && data.getDate() === dia;
}

// Recebe um horário em HH:MM, verifica seus limites e devolve verdadeiro ou falso.
export function horarioValido(valor) {
    if (typeof valor !== 'string' || !/^\d{2}:\d{2}$/.test(valor)) return false;
    const [hora, minuto] = valor.split(':').map(Number);
    return hora < 24 && minuto < 60;
}
