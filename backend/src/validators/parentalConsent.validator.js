function criarParentalConsentValidator() {
    // Expressão regular padrão para validação básica da estrutura de um email.
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Função auxiliar para estruturar objetos de erro.
    function erro(campo, mensagem) {
        return { campo, mensagem };
    }

    // Valida o e-mail informado posteriormente para solicitar o consentimento.
    function validarSolicitacao(body) {
        const erros = [];

        const emailResponsavelLegal =
            typeof body.emailResponsavelLegal === 'string'
                ? body.emailResponsavelLegal.trim().toLowerCase()
                : '';

        if (
            !regexEmail.test(emailResponsavelLegal) ||
            emailResponsavelLegal.length > 254
        ) {
            erros.push(
                erro(
                    'emailResponsavelLegal',
                    'Informe um e-mail válido para o responsável legal.'
                )
            );
        }

        return {
            valido: erros.length === 0,
            erros,

            dados: {
                emailResponsavelLegal
            }
        };
    }

    // Valida o token que chega pela URL aberta pelo responsável legal.
    function validarToken(token) {
        const erros = [];

        if (
            typeof token !== 'string' ||
            !/^[A-Za-z0-9_-]{43}$/.test(token)
        ) {
            erros.push(
                erro(
                    'token',
                    'Link de consentimento inválido.'
                )
            );
        }

        return {
            valido: erros.length === 0,
            erros,

            dados: {
                token
            }
        };
    }

    return {
        validarSolicitacao,
        validarToken
    };
}

module.exports = {
    criarParentalConsentValidator
};