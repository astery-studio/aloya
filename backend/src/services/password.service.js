function criarPasswordService({ bcrypt, rounds }) {

    // Função assíncrona responsável por gerar o hash seguro de uma senha de usuário.
    async function gerarHash(senha) {
        // Gera um salt aleatório, baseado na complexidade configurada (rounds)
        const salt = await bcrypt.genSalt(rounds);
        
    }
};