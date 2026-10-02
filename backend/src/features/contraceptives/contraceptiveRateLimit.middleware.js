//Configura o limite de edições de anticoncepcionais por usuária autenticada.
function criarEdicaoAnticoncepcionalRateLimit({rateLimit, janelaMs, limite, logger = console}) {
    if (typeof rateLimit !== 'function') {
        throw new Error('O criador do rate limit de anticoncepcionais não foi configurado.');
    }

    if (!Number.isInteger(janelaMs) || janelaMs <= 0) {
        throw new Error('A janela do rate limit de anticoncepcionais deve ser um inteiro positivo.');
    }

    if (!Number.isInteger(limite) || limite <= 0) {
        throw new Error('O limite de edições de anticoncepcionais deve ser um inteiro positivo.');
    }

    return rateLimit({
        windowMs: janelaMs,
        limit: limite,
        standardHeaders: true,
        legacyHeaders: false,

        //Agrupa as edições pela identidade autenticada, sem depender do IP do aparelho.
        keyGenerator: (requisicao) => {
            const usuarioId = requisicao.usuario?.id;
            return Number.isSafeInteger(usuarioId) && usuarioId > 0 ? `usuario:${usuarioId}` : 'usuario:nao-autenticado';
        },

        //Responde de forma controlada e não registra corpo, token ou identificador do anticoncepcional.
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

export { criarEdicaoAnticoncepcionalRateLimit };