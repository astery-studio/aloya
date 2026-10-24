const DIA_MS = 86_400_000;

function paraDataUtc(texto) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto || '')) return null;
    const [ano, mes, dia] = texto.split('-').map(Number);
    const data = new Date(Date.UTC(ano, mes - 1, dia));
    return data.getUTCFullYear() === ano
        && data.getUTCMonth() === mes - 1
        && data.getUTCDate() === dia ? data : null;
}

function formatarIso(data) {
    return data.toISOString().slice(0, 10);
}

function adicionarDias(texto, quantidade) {
    const data = paraDataUtc(texto);
    if (!data) return null;
    data.setUTCDate(data.getUTCDate() + quantidade);
    return formatarIso(data);
}

function formatarDataLonga(texto) {
    const data = paraDataUtc(texto);
    if (!data) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric', month: 'long', timeZone: 'UTC'
    }).format(data);
}

function dataNoIntervalo(data, intervalo) {
    return Boolean(intervalo?.inicio && intervalo?.fim
        && data >= intervalo.inicio && data <= intervalo.fim);
}

function obterFaseDireta(data, fases) {
    if (!fases) return 'desconhecida';
    if (dataNoIntervalo(data, fases.menstrual)) return 'menstrual';
    if (dataNoIntervalo(data, fases.folicularPosMenstrual)) return 'folicular';
    if (data === fases.ovulatoria?.data) return 'ovulatoria';
    if (dataNoIntervalo(data, fases.lutea)) return 'lutea';
    return 'desconhecida';
}

function diferencaDias(inicio, fim) {
    const primeira = paraDataUtc(inicio);
    const segunda = paraDataUtc(fim);
    if (!primeira || !segunda) return null;
    return Math.round((segunda - primeira) / DIA_MS);
}

function obterFase(data, fases, duracaoCiclo) {
    const faseConhecida = obterFaseDireta(data, fases);
    if (faseConhecida !== 'desconhecida') return faseConhecida;

    const inicioCiclo = fases?.menstrual?.inicio;
    const inicioProximoCiclo = adicionarDias(fases?.lutea?.fim, 1);
    const duracao = duracaoCiclo ?? diferencaDias(inicioCiclo, inicioProximoCiclo);
    if (!Number.isSafeInteger(duracao) || duracao <= 0) return 'desconhecida';

    const diferenca = diferencaDias(inicioCiclo, data);
    if (diferenca === null) return 'desconhecida';
    const diaProjetado = ((diferenca % duracao) + duracao) % duracao;
    return obterFaseDireta(adicionarDias(inicioCiclo, diaProjetado), fases);
}

function criarDiasDaFaixa(dataCentral, fases, deslocamentoInicial = -3, quantidade = 16, duracaoCiclo) {
    return Array.from({ length: quantidade }, (_, indice) => {
        const data = adicionarDias(dataCentral, deslocamentoInicial + indice);
        const objeto = paraDataUtc(data);
        return {
            data,
            dia: objeto?.getUTCDate(),
            semana: new Intl.DateTimeFormat('pt-BR', {
                weekday: 'short', timeZone: 'UTC'
            }).format(objeto).replace('.', ''),
            fase: obterFase(data, fases, duracaoCiclo),
            hoje: data === dataCentral
        };
    });
}

function obterDiaCiclo(data, fases) {
    const diferenca = diferencaDias(fases?.menstrual?.inicio, data);
    return diferenca === null || diferenca < 0 ? null : diferenca + 1;
}

export { criarDiasDaFaixa, formatarDataLonga, obterDiaCiclo, obterFase, paraDataUtc };
