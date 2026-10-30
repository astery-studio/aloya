const CAMPOS = Object.freeze([
    'duracaoCicloInformada',
    'duracaoMenstruacaoInformada',
    'duracaoLuteaInformada'
]);

function normalizarParametros(resposta) {
    const parametros = resposta?.parametros;
    const validos =
        parametros &&
        CAMPOS.every((campo) => Number.isSafeInteger(parametros[campo]) && parametros[campo] > 0);

    if (!validos) {
        throw new Error('A API retornou parâmetros do ciclo inválidos.');
    }

    return Object.fromEntries(CAMPOS.map((campo) => [campo, parametros[campo]]));
}

function filtrarParametros(dados) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        throw new Error('Os parâmetros do ciclo são inválidos.');
    }

    const recebidos = Object.keys(dados);
    const formatoValido =
        recebidos.length === CAMPOS.length &&
        recebidos.every((campo) => CAMPOS.includes(campo)) &&
        CAMPOS.every((campo) => Number.isSafeInteger(dados[campo]) && dados[campo] > 0);

    if (!formatoValido) {
        throw new Error('Os parâmetros do ciclo são inválidos.');
    }

    return Object.fromEntries(CAMPOS.map((campo) => [campo, dados[campo]]));
}

export { filtrarParametros, normalizarParametros };
