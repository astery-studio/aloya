const CAMPOS = ['duracaoCicloInformada', 'duracaoMenstruacaoInformada', 'duracaoLuteaInformada'];

function criarCycleParametersValidator() {
    function validar(body) {
        const erros = [];
        const ehObjeto = body && typeof body === 'object' && !Array.isArray(body);

        if (!ehObjeto) {
            return {
                valido: false,
                erros: [{ campo: 'dados', mensagem: 'O corpo da requisição deve ser um objeto.' }]
            };
        }

        if (Object.keys(body).some((campo) => !CAMPOS.includes(campo))) {
            erros.push({ campo: 'dados', mensagem: 'A requisição contém campos não permitidos.' });
        }

        for (const campo of CAMPOS) {
            if (!Number.isSafeInteger(body[campo]) || body[campo] <= 0) {
                erros.push({
                    campo,
                    mensagem: 'Informe uma duração em dias inteiros e positivos.'
                });
            }
        }

        const ciclo = body.duracaoCicloInformada;
        const menstruacao = body.duracaoMenstruacaoInformada;
        const lutea = body.duracaoLuteaInformada;

        if (
            Number.isSafeInteger(ciclo) &&
            Number.isSafeInteger(menstruacao) &&
            menstruacao >= ciclo
        ) {
            erros.push({
                campo: 'duracaoMenstruacaoInformada',
                mensagem: 'A duração da menstruação deve ser menor que a duração do ciclo.'
            });
        }

        if (
            Number.isSafeInteger(ciclo) &&
            Number.isSafeInteger(menstruacao) &&
            Number.isSafeInteger(lutea) &&
            menstruacao < ciclo &&
            lutea > ciclo - menstruacao - 2
        ) {
            erros.push({
                campo: 'duracaoLuteaInformada',
                mensagem:
                    'A duração da fase lútea informada não é compatível com o ciclo. Ajuste os valores.'
            });
        }

        return {
            valido: erros.length === 0,
            erros,
            dados: Object.fromEntries(CAMPOS.map((campo) => [campo, body[campo]]))
        };
    }

    return { validar };
}

export { criarCycleParametersValidator };
