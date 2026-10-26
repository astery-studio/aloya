//Configura o limite específico para tentativas de atualização de categorias.
function criarPermissionCategoryUpdateRateLimit({
    rateLimit,
    janelaMs,
    limite,
    logger = console
}) {
    return rateLimit({
        windowMs: janelaMs,
        limit: limite,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: req => `usuario:${req.usuario.id}`,
        handler: (req, res) => {
            logger.warn({
                evento: 'limite_atualizacao_categoria_permissao',
                usuarioId: req.usuario.id,
                metodo: req.method,
                rota: req.originalUrl
            })

            return res.status(429).json({
                erro: {
                    codigo: 'LIMITE_ATUALIZACAO_CATEGORIA',
                    mensagem: 'Muitas tentativas de atualização de categoria. Aguarde alguns minutos e tente novamente.'
                }
            })
        }
    })
}

export {criarPermissionCategoryUpdateRateLimit}
