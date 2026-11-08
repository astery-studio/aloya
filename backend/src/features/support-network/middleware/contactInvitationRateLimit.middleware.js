function criarContactInvitationRateLimit({ rateLimit, janelaMs, limite, logger = console } = {}) {
    if (
        typeof rateLimit !== 'function' ||
        !Number.isSafeInteger(janelaMs) ||
        janelaMs <= 0 ||
        !Number.isSafeInteger(limite) ||
        limite <= 0
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
                evento: 'limite_convite_rede_apoio',
                usuarioId: req.usuario.id,
                metodo: req.method,
                rota: req.originalUrl
            });

            return res.status(429).json({
                erro: {
                    codigo: 'LIMITE_CONVITES_REDE_APOIO',
                    mensagem:
                        'Muitas tentativas de convite. Aguarde alguns minutos e tente novamente.'
                }
            });
        }
    });
}

export { criarContactInvitationRateLimit };
