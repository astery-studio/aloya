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

        // Extrai e sanitiza o nome do dispositivo a partir do cabeçalho HTTP
        const dispositivo =
            typeof req.headers['x-device-name'] === 'string'
            ? req.headers['x-device-name'].slice(0, 120)
            : null;

            // Delega ao serviço de autenticação a regra de negócio para persistir a conta, criar o ciclo inicial e tratar o consentimento parental.
        const resultado = await authService.cadastrar(
            validacao.dados,
            dispositivo
        );

        // Retorna uma resposta de sucesso HTTP 201 contendo os dados do usuário, token de sessão e informações do ciclo inicial.
        return res.status(201).json(resultado);
        } catch (erro) {
        return next(erro);
        }
    }

    return {
        cadastrar
    };
}

module.exports = {
    criarAuthController
};