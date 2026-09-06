function criarParentalConsentService({
    prisma,
    emailService,
    crypto,
    baseUrl,
    now = () => new Date()
}) {
    // Função auxiliar para gerar um token seguro e o seu hash
    function gerarTokenSeguro() {
        // Gera 32 bytes de alta entropia e converte para uma string segura para URLs
        const tokenPuro = crypto
        .randomBytes(32)
        .toString('base64url');

        // Cria o hash SHA-256 do token puro. (obs: O token puro será enviado por e-mail, mas no banco é guardado apenas o hash, por segurança)
        const tokenHash = crypto
        .createHash('sha256')
        .update(tokenPuro)
        .digest('hex');

        //retorna o token puro (pro link) e o hash (pro banco)
        return {
        tokenPuro,
        tokenHash
        };
    }

    // Função auxiliar que monta a URL completa de confirmação.
    function criarLink(tokenPuro) {
        return `${baseUrl}/${encodeURIComponent(tokenPuro)}`;
    }
}