function criarContactInvitationRateLimit({
    rateLimit,
    janelaMs,
    limite,
    logger = console,
    codigo = 'LIMITE_CONVITES_REDE_APOIO',
    mensagem = 'Muitas tentativas de convite. Aguarde alguns minutos e tente novamente.',
    evento = 'limite_convite_rede_apoio'
} = {}) {
    if (
        typeof rateLimit !== 'function' ||
        !Number.isSafeInteger(janelaMs) ||
        janelaMs <= 0 ||
        !Number.isSafeInteger(limite) ||
        limite <= 0 ||
        typeof codigo !== 'string' ||
        codigo.trim().length === 0 ||
        typeof mensagem !== 'string' ||
        mensagem.trim().length === 0 ||
        typeof evento !== 'string' ||
        evento.trim().length === 0
    ) {
        throw new TypeError('Não foi possível configurar o limite de convites.');
    }

    return rateLimit({
        windowMs: janelaMs,
        limit: limite,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => `usuario:${req.usuario.id}`,
        handler: (req, res) => {
            logger.warn({
                evento,
                usuarioId: req.usuario.id,
                metodo: req.method,
                rota: req.originalUrl
            });

            return res.status(429).json({
                erro: {
                    codigo,
                    mensagem
                }
            });
        }
    });
}

export { criarContactInvitationRateLimit };
