// Confere se DD/MM/AAAA representa um dia real a partir de 1900.
export function isValidDate(valor) {
    if (typeof valor !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) return false;
    const [dia, mes, ano] = valor.split('/').map(Number);
    const data = new Date(ano, mes - 1, dia);
    return ano >= 1900 && data.getFullYear() === ano
        && data.getMonth() === mes - 1 && data.getDate() === dia;
}
/**
 * Valida datas DD/MM/AAAA reais com ano mínimo de 1900.
 */
