function criarSupportContactRemovalRateLimit({
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
        limite <= 0 ||
        typeof logger?.warn !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar o limite de remoção de contato.');
    }

    return rateLimit({
        windowMs: janelaMs,
        limit: limite,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => `usuario:${req.usuario.id}`,
        handler: (req, res) => {
            logger.warn({
                evento: 'limite_remocao_contato_rede_apoio',
                usuarioId: req.usuario.id,
                metodo: req.method,
                rota: req.originalUrl
            });
            return res.status(429).json({
                erro: {
                    codigo: 'LIMITE_REMOCAO_CONTATO',
                    mensagem:
                        'Muitas tentativas de remoção de contato. Aguarde alguns minutos e tente novamente.'
                }
            });
        }
    });
}

export { criarSupportContactRemovalRateLimit };
