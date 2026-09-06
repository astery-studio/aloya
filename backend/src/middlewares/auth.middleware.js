function criarAuthMiddleware({
    tokenService,
    prisma
}) {
    // Middleware que garante que a requisição possui uma sessão autenticada e válida.
    async function autenticar(req, _res, next) {
        try {
            const cabecalhoAutorizacao = req.headers.authorization;

            // Exige o padrão: Authorization: Bearer <token>.
            if (
                typeof cabecalhoAutorizacao !== 'string' ||
                !cabecalhoAutorizacao.startsWith('Bearer ')
            ) {
                const erro = new Error('Autenticação necessária.');

                erro.status = 401;
                erro.codigo = 'NAO_AUTENTICADO';

                throw erro;
            }

            const token = cabecalhoAutorizacao.slice(7).trim();

            if (!token) {
                const erro = new Error('Token de autenticação inválido.');

                erro.status = 401;
                erro.codigo = 'TOKEN_INVALIDO';

                throw erro;
            }

            const tokenValidado =
                tokenService.validarTokenSessao(token);

            // Confirma se o token ainda corresponde a uma sessão ativa persistida.
            const sessao = await prisma.sessao.findFirst({
                where: {
                    usuarioId: tokenValidado.usuarioId,
                    tokenSessao: token
                },

                select: {
                    usuario: {
                        select: {
                            id: true,
                            papel: true,
                            statusConta: true
                        }
                    }
                }
            });

            if (
                !sessao ||
                !sessao.usuario ||
                sessao.usuario.statusConta !== 'ativa'
            ) {
                const erro = new Error('Sua sessão não está mais ativa.');

                erro.status = 401;
                erro.codigo = 'SESSAO_INVALIDA';

                throw erro;
            }

            // Disponibiliza somente dados necessários para os próximos controllers e middlewares.
            req.usuario = {
                id: sessao.usuario.id,
                papel: sessao.usuario.papel
            };

            return next();
        } catch (erro) {
            if (
                erro.name === 'JsonWebTokenError' ||
                erro.name === 'TokenExpiredError'
            ) {
                erro.status = 401;
                erro.codigo = 'TOKEN_INVALIDO';
                erro.message = 'Sua sessão expirou ou é inválida.';
            }

            return next(erro);
        }
    }

    return {
        autenticar
    };
}

module.exports = {
    criarAuthMiddleware
};