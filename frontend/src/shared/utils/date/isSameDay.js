/**
 * Compara duas datas pelo dia civil local, ignorando seus horários.
 */
// Compara o dia do calendário local, independentemente do horário.
export function isSameDay(primeira, segunda) {
    if (!(primeira instanceof Date) || !(segunda instanceof Date)) return false;
    if (Number.isNaN(primeira.getTime()) || Number.isNaN(segunda.getTime())) return false;
    return primeira.getFullYear() === segunda.getFullYear()
        && primeira.getMonth() === segunda.getMonth()
        && primeira.getDate() === segunda.getDate();
}
