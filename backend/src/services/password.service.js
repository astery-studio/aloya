function criarPasswordService({ bcrypt, rounds }) {
    // Hash válido usado apenas para reduzir a diferença de tempo quando o e-mail não existe.
    const hashFicticio =
        '$2b$12$C6UzMDM.H6dfI/f/IKcEe.7fQpVbH8VQrlcHiJR4gUoK8z7qRNI2q';

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

    // Compara a senha recebida com o hash persistido, sem revelar se o e-mail existe.
    async function compararSenha(senha, senhaHash) {
        const hashParaComparacao =
            typeof senhaHash === 'string'
                ? senhaHash
                : hashFicticio;

        return bcrypt.compare(
            senha,
            hashParaComparacao
        );
    }

    return {
        gerarHash,
        compararSenha
    };
}

module.exports = {
    criarPasswordService
};