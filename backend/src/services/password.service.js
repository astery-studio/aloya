function criarPasswordService({ bcrypt, rounds }) {

    // Função assíncrona responsável por gerar o hash seguro de uma senha de usuário.
    async function gerarHash(senha) {
        // Gera um salt aleatório, baseado na complexidade configurada (rounds)
        const salt = await bcrypt.genSalt(rounds);
        
        // Cria o hash definitivo da senha utilizando o texto puro e o salt gerado.
        const senhaHash = await bcrypt.hash(senha, salt);

        return {
        salt,
        senhaHash
        };
    }

    return {
        gerarHash
    };
}

module.exports = {
    criarPasswordService
};