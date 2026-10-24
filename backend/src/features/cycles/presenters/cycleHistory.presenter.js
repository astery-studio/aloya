//Transforma registros internos de ciclo no contrato público e seguro da API.
const CLASSIFICACOES_PERMITIDAS = Object.freeze([
    'normal',
    'atipico',
    'irregular'
]);

//Valida uma data interna e devolve somente sua parte ISO de calendário.
function apresentarData(data, campo) {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
        throw new TypeError(`O campo interno "${campo}" possui uma data inválida.`);
    }

    return data.toISOString().slice(0, 10);
}

//Aceita somente quantidades inteiras positivas ou ausência de valor.
function apresentarDuracao(valor, campo) {
    if (valor === null || valor === undefined) {
        return null;
    }

    if (!Number.isSafeInteger(valor) || valor <= 0) {
        throw new TypeError(`O campo interno "${campo}" possui uma duração inválida.`);
    }

    return valor;
}

//Valida o número sequencial usado para identificar visualmente o ciclo.
function apresentarNumero(numero) {
    if (!Number.isSafeInteger(numero) || numero <= 0) {
        throw new TypeError('O número sequencial do ciclo é inválido.');
    }

    return numero;
}

//Converte um registro persistido sem expor identificadores de usuário ou metadados internos.
function apresentarCicloHistorico(registro, numero) {
    if (!registro || typeof registro !== 'object' || Array.isArray(registro)) {
        throw new TypeError('O registro interno do ciclo é inválido.');
    }

    if (!Number.isSafeInteger(registro.id) || registro.id <= 0) {
        throw new TypeError('O identificador interno do ciclo é inválido.');
    }

    if (!CLASSIFICACOES_PERMITIDAS.includes(registro.classificacao)) {
        throw new TypeError('A classificação interna do ciclo é inválida.');
    }

    const dataInicio = apresentarData(
        registro.dataInicio,
        'dataInicio'
    );

    const dataFim = registro.dataFim === null || registro.dataFim === undefined
        ? null
        : apresentarData(
            registro.dataFim,
            'dataFim'
        );

    return {
        id: registro.id,
        numero: apresentarNumero(numero),
        dataInicio,
        dataFim,
        diasMenstruais: apresentarDuracao(
            registro.duracaoMenstruacao,
            'duracaoMenstruacao'
        ),
        duracaoDias: apresentarDuracao(
            registro.duracaoCiclo,
            'duracaoCiclo'
        ),
        status: dataFim === null
            ? 'emAndamento'
            : 'concluido',
        classificacao: registro.classificacao,
        estimativaIncerta:
            registro.classificacao === 'atipico'
            || registro.classificacao === 'irregular',
        cicloInicial: registro.ehCicloInicial === true
    };
}

export {
    apresentarCicloHistorico
};