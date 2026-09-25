const DIA_MS = 86_400_000;

function adicionarDias(data, dias) {
    return new Date(data.getTime() + dias * DIA_MS);
}

function somenteData(data) {
    return data.toISOString().slice(0, 10);
}

function calcularPeriodosPausa(dataPrimeiroUso, regra, quantidade = 24) {
    if (!regra?.diasPausa || regra.continuo) return [];
    const periodos = [];
    let inicioCiclo = dataPrimeiroUso;
    for (let indice = 0; indice < quantidade; indice += 1) {
        const inicio = adicionarDias(inicioCiclo, regra.diasUso);
        const fim = adicionarDias(inicio, regra.diasPausa - 1);
        periodos.push({ inicio: somenteData(inicio), fim: somenteData(fim) });
        inicioCiclo = adicionarDias(fim, 1);
    }
    return periodos;
}

function estaEmPausa(data, periodos) {
    const dia = somenteData(data);
    return periodos.some(({ inicio, fim }) => dia >= inicio && dia <= fim);
}

function combinaDataHorario(data, horario) {
    const [hora, minuto] = horario.split(':').map(Number);
    return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate(), hora, minuto));
}

function calcularProximoUso({ horarios, dataPrimeiroUso, regra, periodosPausa }, agora = new Date()) {
    const inicio = dataPrimeiroUso > agora ? dataPrimeiroUso : new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));
    for (let deslocamento = 0; deslocamento <= 730; deslocamento += 1) {
        const dia = adicionarDias(inicio, deslocamento);
        const diasDesdeInicio = Math.floor((dia - dataPrimeiroUso) / DIA_MS);
        const ocorre = regra.periodicidade === 'diaria'
            || (regra.periodicidade === 'semanal' && diasDesdeInicio % 7 === 0)
            || (regra.periodicidade === 'mensal' && dia.getUTCDate() === dataPrimeiroUso.getUTCDate());
        if (!ocorre || estaEmPausa(dia, periodosPausa)) continue;
        const candidato = horarios.map((horario) => combinaDataHorario(dia, horario)).find((data) => data > agora);
        if (candidato) return candidato;
    }
    return null;
}

export { calcularPeriodosPausa, calcularProximoUso, estaEmPausa };
