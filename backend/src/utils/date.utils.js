function calcularIdade(dataNascimento) {
    //Obtém a data/hora atual e instancia a data informada
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    //Estimativa inicial pela diferença direta entre os anos e meses
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    

    //Se ainda não chegou o mês de aniversário OU
    // se estamos no mês mas o dia atual é anterior ao dia do nascimento,
    // significa que a pessoa ainda não completou mais um ano.
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

module.exports = { calcularIdade };