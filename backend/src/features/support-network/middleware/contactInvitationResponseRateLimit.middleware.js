function criarContactInvitationResponseRateLimit({
    rateLimit,
    janelaMs,
    limite,
    logger = console
} = {}) {
    if (
        typeof rateLimit !== 'function' ||
        !Number.isSafeInteger(janelaMs) ||
        janelaMs <= 0 ||
        !Number.isSafeInteger(limite) ||
        limite <= 0
    ) {
        throw new TypeError('Não foi possível configurar o limite de respostas a convites.');
    }

    return rateLimit({
        windowMs: janelaMs,
        limit: limite,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => (req.usuario?.id ? `usuario:${req.usuario.id}` : `ip:${req.ip}`),
        handler: (req, res) => {
            logger.warn({
                evento: 'limite_resposta_convite_rede_apoio',
                autenticado: Boolean(req.usuario?.id),
                metodo: req.method
            });

            return res.status(429).json({
                erro: {
                    codigo: 'LIMITE_RESPOSTAS_CONVITE',
                    mensagem: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
                }
            });
        }
    });
}

export { criarContactInvitationResponseRateLimit };
