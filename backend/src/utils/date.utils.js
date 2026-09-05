function criarDataValida(dataTexto) {

    //Se o que chegou não for um texto, ele já devolve nulo e cancela.
    if (typeof dataTexto !== 'string') {
        return null;
    }

    //Força que o texto tenha estritamente o formato "4 números - 2 números - 2 números" (YYYY-MM-DD).
    //obs: O backend utiliza o padrão internacional ISO 8601 pois ele evita ambiguidades regionais, permite ordenação cronológica direta e é o formato nativo esperado pelo banco
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataTexto)) {
        return null;
    }

    //corta o texto nos hifens
    const [ano, mes, dia] = dataTexto.split('-').map(Number);
    //Cria a data no JavaScript (os meses começam do zero, por isso é mes - 1)
    const data = new Date(ano, mes - 1, dia);

    const ehValida =
        data.getFullYear() === ano &&
        data.getMonth() === mes - 1 &&
        data.getDate() === dia;

    return ehValida ? data : null;
}

function calcularIdade(dataNascimento) {
    const hoje = new Date();
    //converte o texto em data validada
    const nascimento = criarDataValida(dataNascimento);

    if (!nascimento) {
        return null;
    }

    // Diferença bruta de anos e meses
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const diferencaMes = hoje.getMonth() - nascimento.getMonth();

    // Subtrai 1 ano se o mês do aniversário ainda não chegou, ou se estamos no mês mas o dia não chegou
    if (
        diferencaMes < 0 ||
        (diferencaMes === 0 && hoje.getDate() < nascimento.getDate())
    ) {
        idade--;
    }

    return idade;
}

function adicionarDias(data, quantidade) {
    //clona a data para não modificar a variável original acidentalmente
    const resultado = new Date(data);
    //soma os dias e ajusta a virada de mês/ano se necessário
    resultado.setDate(resultado.getDate() + quantidade);

    return resultado;
}

function calcularDiasInclusivos(dataInicio, dataFim) {
    // Recria as datas ignorando horas e minutos para garantir um cálculo de diferença exato
    
    const inicio = new Date(
        dataInicio.getFullYear(),
        dataInicio.getMonth(),
        dataInicio.getDate()
    );

    const fim = new Date(
        dataFim.getFullYear(),
        dataFim.getMonth(),
        dataFim.getDate()
    );

    // Constante matemática: quantidade de milissegundos em 24 horas
    const umDiaEmMs = 24 * 60 * 60 * 1000;

    // O "+ 1" garante que tanto o dia de início quanto o de fim entrem na conta (ex: dia 20 a 24 = 5 dias)
    return Math.floor((fim - inicio) / umDiaEmMs) + 1;
}

function gerarDiasMenstruacao(dataInicio, dataFim) {
    const dias = [];
    let dataAtual = new Date(dataInicio);

    //roda enquanto a data atual não ultrapassar a data de fim do ciclo
    while (dataAtual <= dataFim) {
        // Guarda uma cópia exata do dia atual na lista final
        dias.push(new Date(dataAtual));
        // Avança para o próximo dia usando a função utilitária criada acima
        dataAtual = adicionarDias(dataAtual, 1);
    }

    return dias;
}

module.exports = {
    criarDataValida,
    calcularIdade,
    adicionarDias,
    calcularDiasInclusivos,
    gerarDiasMenstruacao
};