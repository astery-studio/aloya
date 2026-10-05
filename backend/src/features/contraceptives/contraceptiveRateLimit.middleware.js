//Configura limites separados para edição e remoção de anticoncepcionais.

//Cria a chave do limite usando somente a identidade autenticada.
function criarChaveUsuario(requisicao) {
    const usuarioId = requisicao.usuario?.id;

    return Number.isSafeInteger(usuarioId) && usuarioId > 0
        ? `usuario:${usuarioId}`
        : 'usuario:nao-autenticado';
}

//Devolve o nome plural da operação usado nas mensagens de configuração.
function obterOperacaoPlural(operacao) {
    return operacao === 'edição'
        ? 'edições'
        : 'remoções';
}

//Valida a configuração obrigatória antes de criar o middleware.
function validarConfiguracao({rateLimit, janelaMs, limite}, operacao) {
    const operacaoPlural = obterOperacaoPlural(operacao);

    if (typeof rateLimit !== 'function') {
        throw new Error(`O criador do rate limit de ${operacao} de anticoncepcionais não foi configurado.`);
    }

    if (!Number.isInteger(janelaMs) || janelaMs <= 0) {
        throw new Error(`A janela do rate limit de ${operacao} de anticoncepcionais deve ser um inteiro positivo.`);
    }

    if (!Number.isInteger(limite) || limite <= 0) {
        throw new Error(`O limite de ${operacaoPlural} de anticoncepcionais deve ser um inteiro positivo.`);
    }
}

//Configura o limite de edições por usuária autenticada.
function criarEdicaoAnticoncepcionalRateLimit({rateLimit, janelaMs, limite, logger = console}) {
    validarConfiguracao({
        rateLimit,
        janelaMs,
        limite
    }, 'edição');

    return rateLimit({
        windowMs: janelaMs,
        limit: limite,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: criarChaveUsuario,

        //Responde de forma controlada sem registrar corpo, token ou id do anticoncepcional.
        handler: (requisicao, resposta) => {
            logger.warn({
                evento: 'limite_edicoes_anticoncepcional',
                usuarioId: requisicao.usuario?.id ?? null,
                metodo: requisicao.method
            });

            return resposta.status(429).json({
                erro: {
                    codigo: 'LIMITE_EDICOES_ANTICONCEPCIONAL',
                    mensagem: 'Muitas alterações em pouco tempo. Aguarde alguns minutos e tente novamente.'
                }
            });
        }
    });
}

//Configura o limite de remoções por usuária autenticada.
function criarRemocaoAnticoncepcionalRateLimit({rateLimit, janelaMs, limite, logger = console}) {
    validarConfiguracao({
        rateLimit,
        janelaMs,
        limite
    }, 'remoção');

    return rateLimit({
        windowMs: janelaMs,
        limit: limite,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: criarChaveUsuario,

        //Responde sem registrar token, corpo ou identificador do anticoncepcional.
        handler: (requisicao, resposta) => {
            logger.warn({
                evento: 'limite_remocoes_anticoncepcional',
                usuarioId: requisicao.usuario?.id ?? null,
                metodo: requisicao.method
            });

            return resposta.status(429).json({
                erro: {
                    codigo: 'LIMITE_REMOCOES_ANTICONCEPCIONAL',
                    mensagem: 'Muitas remoções em pouco tempo. Aguarde alguns minutos e tente novamente.'
                }
            });
        }
    });
}

export {
    criarEdicaoAnticoncepcionalRateLimit,
    criarRemocaoAnticoncepcionalRateLimit
};