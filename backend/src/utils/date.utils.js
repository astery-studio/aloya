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
