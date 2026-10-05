/**
 * Configura o limitador específico para criação de categorias da Rede de Apoio.
 */
function criarPermissionCategoryRateLimit({
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

        //Separa o limite por pessoa autenticada, sem depender do endereço IP.
        keyGenerator: req =>
            `usuario:${req.usuario.id}`,

        handler: (req, res) => {
            //Não registra nome da categoria, permissões, token ou corpo da requisição.
            logger.warn({
                evento:
                    'limite_criacao_categoria_permissao',
                usuarioId: req.usuario.id,
                metodo: req.method,
                rota: req.originalUrl
            })

            return res.status(429).json({
                erro: {
                    codigo:
                        'LIMITE_CRIACAO_CATEGORIA',
                    mensagem:
                        'Muitas tentativas de criação de categoria. Aguarde alguns minutos e tente novamente.'
                }
            })
        }
    })
}

export {
    criarPermissionCategoryRateLimit
}