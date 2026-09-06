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
            expiresIn,// Tempo de expiração da sessão
            algorithm: 'HS256' // Algoritmo criptográfico simétrico padrão de assinatura.
        }
        );
    }

    return {
        gerarTokenSessao
    };
}

module.exports = {
    criarTokenService
};