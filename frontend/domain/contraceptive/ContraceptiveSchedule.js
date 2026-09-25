function adicionarDias(dataIso, quantidade) {
    const [ano, mes, dia] = dataIso.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);
    data.setDate(data.getDate() + quantidade);
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

function calcularPeriodosDePausa(dataPrimeiroUso, frequencia, quantidade = 12) {
    if (!dataPrimeiroUso || !frequencia?.diasPausa || frequencia.continuo) return [];

    const periodos = [];
    let inicioCiclo = dataPrimeiroUso;
    for (let indice = 0; indice < quantidade; indice += 1) {
        const inicio = adicionarDias(inicioCiclo, frequencia.diasUso);
        const fim = adicionarDias(inicio, frequencia.diasPausa - 1);
        periodos.push({ inicio, fim });
        inicioCiclo = adicionarDias(fim, 1);
    }
    return periodos;
}

function criarProgramacao({ horarios = [], frequencia, dataPrimeiroUso = null }) {
    return Object.freeze({
        horarios: Object.freeze([...horarios].sort()),
        frequenciaId: frequencia?.id ?? null,
        periodicidade: frequencia?.periodicidade ?? null,
        dataPrimeiroUso,
        periodosPausa: Object.freeze(calcularPeriodosDePausa(dataPrimeiroUso, frequencia))
    });
}

export { adicionarDias, calcularPeriodosDePausa, criarProgramacao };
