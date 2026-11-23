import { formatarDataLonga } from './cyclePresentation';

function separarData(data) {
    const formatada = formatarDataLonga(data);
    const [dia, mes] = formatada.split(' de ');
    if (!dia || !mes) return { dia: '—', mes: formatada || 'Indisponível' };
    return { dia, mes };
}

function formatarJanelaFertil(intervalo) {
    if (!intervalo) return 'Indisponível';
    const inicio = separarData(intervalo.inicio);
    const fim = separarData(intervalo.fim);
    if (inicio.dia === '—' || fim.dia === '—') return 'Indisponível';
    return inicio.mes === fim.mes
        ? `${inicio.dia}–${fim.dia} de ${fim.mes}`
        : `${inicio.dia} de ${inicio.mes} – ${fim.dia} de ${fim.mes}`;
}

export { formatarJanelaFertil, separarData };
