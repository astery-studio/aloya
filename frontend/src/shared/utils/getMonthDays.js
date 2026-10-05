//Monta os dias que aparecem no calendário de um mês
function getMonthDays(ano, mes) {
    if (
        !Number.isInteger(ano)
        || ano < 1000
        || ano > 9999
        || !Number.isInteger(mes)
        || mes < 1
        || mes > 12
    ) {
        return []
    }

    const primeiroDiaDaSemana =
        new Date(ano, mes - 1, 1).getDay()

    const quantidadeDeDias =
        new Date(ano, mes, 0).getDate()

    const casas = []

    for (
        let posicao = 0;
        posicao < primeiroDiaDaSemana;
        posicao += 1
    ) {
        casas.push(null)
    }

    for (
        let dia = 1;
        dia <= quantidadeDeDias;
        dia += 1
    ) {
        const mesComDoisDigitos = String(mes).padStart(2, '0')

        const diaComDoisDigitos = String(dia).padStart(2, '0')

        casas.push({
            dia,
            data: `${ano}-${mesComDoisDigitos}-${diaComDoisDigitos}`
        })
    }

    while (casas.length % 7 !== 0) {
        casas.push(null)
    }

    return casas
}

export { getMonthDays }