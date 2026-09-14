function criarCadastroRateLimit({
    rateLimit,
    janelaMs,
    limite,
    logger = console
}) {
    // Limita tentativas de criação de conta por endereço IP.
    return rateLimit({
        windowMs: janelaMs,
        limit: limite,
        standardHeaders: true,
        legacyHeaders: false,

        handler: (req, res) => {
            // Registra somente o evento; não armazena senha, token ou e-mail.
            logger.warn({
                evento: 'limite_tentativas_cadastro',
                metodo: req.method,
                rota: req.originalUrl
            });

            return res.status(429).json({
                erro: {
                    codigo: 'LIMITE_TENTATIVAS',
                    mensagem: 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'
                }
            });
        }
    });
}

function criarEmailRateLimit({
    rateLimit,
    janelaMs,
    limite,
    logger = console
}) {
    // Limita solicitações e reenvios de e-mail por endereço IP.
    return rateLimit({
        windowMs: janelaMs,
        limit: limite,
        standardHeaders: true,
        legacyHeaders: false,

        handler: (req, res) => {
            // Registra somente o evento; não armazena e-mail, token ou dados sensíveis.
            logger.warn({
                evento: 'limite_envios_consentimento_parental',
                metodo: req.method,
                rota: req.originalUrl
            });

            return res.status(429).json({
                erro: {
                    codigo: 'LIMITE_ENVIOS_EMAIL',
                    mensagem: 'Muitas solicitações em pouco tempo. Aguarde alguns minutos e tente novamente.'
                }
            });
        }
    });
}

module.exports = {
    criarCadastroRateLimit,
    criarEmailRateLimit
};