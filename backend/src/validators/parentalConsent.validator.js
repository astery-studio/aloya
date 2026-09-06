function criarParentalConsentValidator() {
    // Expressão regular para validar a estrutura básica de e-mail
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Função que valida o e-mail informado posteriormente pelo titular
    function validarSolicitacao(body) {
        const emailResponsavelLegal =
            typeof body.emailResponsavelLegal === 'string'
                ? body.emailResponsavelLegal.trim().toLowerCase()
                : '';

        if (
            !regexEmail.test(emailResponsavelLegal) ||
            emailResponsavelLegal.length > 254
        ) {
            return {
                valido: false,
                erros: [
                    {
                        campo: 'emailResponsavelLegal',
                        mensagem: 'Informe um e-mail válido para o responsável legal.'
                    }
                ]
            };
        }

        return {
            valido: true,
            dados: {
                emailResponsavelLegal
            }
        };
    }

    return {
        validarSolicitacao
    };
}

module.exports = {
    criarParentalConsentValidator
};