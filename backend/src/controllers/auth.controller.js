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

        // Se a validação falhar, interrompe o fluxo e retorna imediatamente um código HTTP 422 com os detalhes dos erros.
        if (!validacao.valido) {
            return res.status(422).json({
            erro: {
                codigo: 'ERRO_VALIDACAO',
                mensagem: 'Existem campos inválidos no cadastro.',
                detalhes: validacao.erros
            }
            });
        }
        }}
    return {
        cadastrar
    };
}

module.exports = {
    criarAuthController
};