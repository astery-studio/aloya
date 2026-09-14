function criarTokenService({
    jwt,
    crypto,
    secret,
    expiresIn
}) {
    function gerarHashToken(token) {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }

    function gerarTokenSessao(usuario) {
        const token = jwt.sign(
            {
                papel: usuario.papel
            },
            secret,
            {
                subject: String(usuario.id),
                expiresIn,
                algorithm: 'HS256'
            }
        );

        const payload = jwt.decode(token);

        if (
            !payload ||
            typeof payload.exp !== 'number'
        ) {
            throw new Error(
                'Não foi possível definir a validade da sessão.'
            );
        }

        return {
            token,
            tokenHash: gerarHashToken(token),
            validadeSessao: new Date(
                payload.exp * 1000
            )
        };
    }

    function validarTokenSessao(token) {
        const payload = jwt.verify(token, secret, {
            algorithms: ['HS256']
        });

        if (!payload.sub) {
            throw new Error(
                'Token sem identificador de usuário.'
            );
        }

        return {
            usuarioId: Number(payload.sub),
            papel: payload.papel
        };
    }

    function gerarTokenRecuperacao(usuario) {
        const token = jwt.sign(
            {
                finalidade:
                    'recuperacao_senha'
            },
            secret,
            {
                subject: String(usuario.id),
                expiresIn: '60m',
                algorithm: 'HS256'
            }
        );

        const payload = jwt.decode(token);

        if (
            !payload ||
            typeof payload.exp !== 'number'
        ) {
            throw new Error(
                'Não foi possível definir a validade da recuperação.'
            );
        }

        return {
            token,
            tokenHash: gerarHashToken(token),

            validadeToken: new Date(
                payload.exp * 1000
            )
        };
    }

    function validarTokenRecuperacao(token) {
        const payload = jwt.verify(
            token,
            secret,
            {
                algorithms: ['HS256']
            }
        );

        if (
            !payload.sub ||
            payload.finalidade !==
                'recuperacao_senha'
        ) {
            throw new Error(
                'Token de recuperação inválido.'
            );
        }

        return {
            usuarioId: Number(payload.sub)
        };
    }

    return {
        gerarHashToken,
        gerarTokenSessao,
        validarTokenSessao,
        gerarTokenRecuperacao,
        validarTokenRecuperacao
    };
}

module.exports = {
    criarTokenService
};