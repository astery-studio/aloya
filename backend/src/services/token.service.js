function criarTokenService({
    jwt,
    crypto,
    secret,
    expiresIn
}) {
    // Cria o hash SHA-256 usado para persistir tokens de sessão sem armazenar seu valor puro.
    function gerarHashToken(token) {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }

    // Função que gera o token JWT de sessão para um usuário autenticado.
    function gerarTokenSessao(usuario) {
        const token = jwt.sign(
            {
                // Insere o papel (role) do usuário no payload do token para uso em autorizações.
                papel: usuario.papel
            },
            secret,
            {
                subject: String(usuario.id),
                expiresIn,
                algorithm: 'HS256'
            }
        );

        const payload = jwt.decode(token);

        if (
            !payload ||
            typeof payload.exp !== 'number'
        ) {
            throw new Error(
                'Não foi possível definir a validade da sessão.'
            );
        }

        return {
            token,
            tokenHash: gerarHashToken(token),
            validadeSessao: new Date(
                payload.exp * 1000
            )
        };
    }

    // Valida a assinatura e a expiração do token recebido em uma requisição autenticada.
    function validarTokenSessao(token) {
        const payload = jwt.verify(token, secret, {
            algorithms: ['HS256']
        });

        if (!payload.sub) {
            throw new Error(
                'Token sem identificador de usuário.'
            );
        }

        return {
            usuarioId: Number(payload.sub),
            papel: payload.papel
        };
    }

    return {
        gerarHashToken,
        gerarTokenSessao,
        validarTokenSessao
    };
}

module.exports = {
    criarTokenService
};