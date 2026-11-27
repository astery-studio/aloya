function criarDiaryPreferencesRateLimit({ rateLimit, janelaMs, limite, logger = console } = {}) {
    if (
        typeof rateLimit !== 'function' ||
        !Number.isSafeInteger(janelaMs) ||
        janelaMs <= 0 ||
        !Number.isSafeInteger(limite) ||
        limite <= 0
    ) {
        throw new TypeError('Não foi possível configurar o limite de preferências do Diário.');
    }

    return rateLimit({
        windowMs: janelaMs,
        limit: limite,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => `usuario:${req.usuario.id}`,
        handler: (req, res) => {
            logger.warn({
                evento: 'limite_preferencias_diario',
                usuarioId: req.usuario.id,
                metodo: req.method,
                rota: req.originalUrl
            });
            return res.status(429).json({
                erro: {
                    codigo: 'LIMITE_PREFERENCIAS_DIARIO',
                    mensagem:
                        'Muitas alterações em pouco tempo. Aguarde um momento e tente novamente.'
                }
            });
        }
    });
}

export { criarDiaryPreferencesRateLimit };
