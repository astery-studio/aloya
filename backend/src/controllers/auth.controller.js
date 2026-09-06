function criarAuthController({
    authService,
    authValidator
    }) {
        // Função responsável por processar a requisição HTTP de cadastro de nova conta
    async function cadastrar(req, res, next) {
        try {
            // Executa a validação de formato e integridade dos dados enviados no corpo da requisição usando o validador.
        const validacao = authValidator.validarCadastro(
            req.body
        );
        }}

    return {
        cadastrar
    };
}

module.exports = {
    criarAuthController
};