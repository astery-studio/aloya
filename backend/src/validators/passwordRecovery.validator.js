function criarPasswordRecoveryValidator() {
    const regexEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function erro(campo, mensagem) {
        return {
            campo,
            mensagem
        };
    }

    function validarSolicitacao(body) {
        const erros = [];

        const email =
            typeof body.email === 'string'
                ? body.email
                    .trim()
                    .toLowerCase()
                : '';

        if (!email) {
            erros.push(
                erro(
                    'email',
                    'Informe seu e-mail.'
                )
            );
        } else if (
            !regexEmail.test(email) ||
            email.length > 254
        ) {
            erros.push(
                erro(
                    'email',
                    'Informe um e-mail válido.'
                )
            );
        }

        return {
            valido: erros.length === 0,
            erros,

            dados: {
                email
            }
        };
    }

    return {
        validarSolicitacao
    };
}

module.exports = {
    criarPasswordRecoveryValidator
};