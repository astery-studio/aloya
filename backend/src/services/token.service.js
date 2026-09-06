function criarTokenService({ jwt, secret, expiresIn }) {
    // Função que gera o token JWT de sessão para um usuário autenticado.
    function gerarTokenSessao(usuario) {
        return jwt.sign(
            {
                // Insere o papel (role) do usuário no payload do token para uso em autorizações.
                papel: usuario.papel
            },
            secret,
            {
                subject: String(usuario.id), // Define o ID do usuário como o assunto do token.
                expiresIn, // Tempo de expiração da sessão
                algorithm: 'HS256' // Algoritmo criptográfico simétrico padrão de assinatura.
            }
        );
    }

    // Valida a assinatura e a expiração do token recebido em uma requisição autenticada.
    function validarTokenSessao(token) {
        const payload = jwt.verify(token, secret, {
            algorithms: ['HS256']
        });

        if (!payload.sub) {
            throw new Error('Token sem identificador de usuário.');
        }

        return {
            usuarioId: String(payload.sub),
            papel: payload.papel
        };
    }

    return {
        gerarTokenSessao,
        validarTokenSessao
    };
}

module.exports = {
    criarTokenService
};