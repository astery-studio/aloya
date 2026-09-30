/**
 * Valida e normaliza e-mail, token e nova senha do fluxo de recuperação.
 */
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
        body = body && typeof body === 'object' ? body : {};
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

    function validarRedefinicao(body) {
        body = body && typeof body === 'object' ? body : {};
        const erros = [];
        const token = typeof body.token === 'string'
            ? body.token.trim()
            : '';
        const senha = typeof body.senha === 'string'
            ? body.senha
            : '';

        if (!token) {
            erros.push(
                erro('token', 'Este link de redefinição é inválido ou já expirou. Solicite um novo.')
            );
        }

        if (senha.length < 8) {
            erros.push(
                erro('senha', 'A senha deve possuir pelo menos 8 caracteres.')
            );
        } else if (senha.length > 128) {
            erros.push(
                erro('senha', 'A senha deve possuir no máximo 128 caracteres.')
            );
        }

        return {
            valido: erros.length === 0,
            erros,
            dados: { token, senha }
        };
    }

    return {
        validarSolicitacao,
        validarRedefinicao
    };
}

export {
    criarPasswordRecoveryValidator
};
