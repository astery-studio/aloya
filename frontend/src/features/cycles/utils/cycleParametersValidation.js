const CAMPOS = Object.freeze([
    'duracaoCicloInformada',
    'duracaoMenstruacaoInformada',
    'duracaoLuteaInformada'
]);

function validarParametrosCiclo(valores = {}) {
    const erros = {};

    for (const campo of CAMPOS) {
        if (!Number.isSafeInteger(valores[campo]) || valores[campo] <= 0) {
            erros[campo] = 'Informe uma duração em dias inteiros e positivos.';
        }
    }

    const ciclo = valores.duracaoCicloInformada;
    const menstruacao = valores.duracaoMenstruacaoInformada;
    const lutea = valores.duracaoLuteaInformada;

    if (
        !erros.duracaoCicloInformada &&
        !erros.duracaoMenstruacaoInformada &&
        menstruacao >= ciclo
    ) {
        erros.duracaoMenstruacaoInformada =
            'A duração da menstruação deve ser menor que a duração do ciclo.';
    } else if (!erros.duracaoLuteaInformada && lutea > ciclo - menstruacao - 2) {
        erros.duracaoLuteaInformada =
            'A duração da fase lútea informada não é compatível com o ciclo. Ajuste os valores.';
    }

    return erros;
}

function parametrosSaoIguais(atuais, iniciais) {
    return (
        Boolean(atuais && iniciais) && CAMPOS.every((campo) => atuais[campo] === iniciais[campo])
    );
}

export { CAMPOS, parametrosSaoIguais, validarParametrosCiclo };
