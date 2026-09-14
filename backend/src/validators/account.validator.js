function criarAccountValidator({ dateUtils }) {
    const regexNome =
        /^[\p{L}]+(?:[ -][\p{L}]+)*$/u;

    const regexEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const identidadesGeneroPermitidas = new Set([
        'Prefiro não informar',
        'Mulher Cisgênero',
        'Homem Cisgênero',
        'Mulher Trans',
        'Homem Trans',
        'Não-binário',
        'Outro'
    ]);

    const senhasBloqueadas = new Set([
        'senha',
        'senha123',
        'password',
        'password123',
        '123456789012345',
        'qwertyuiopasdfg',
        'administrador',
        'minhasenhasegura',
        'euamoaloya',
        'aloyaaloyaaloya'
    ]);

    function erro(campo, mensagem) {
        return {
            campo,
            mensagem
        };
    }

    function ehObjeto(body) {
        return (
            body !== null
            && typeof body === 'object'
            && !Array.isArray(body)
        );
    }

    function normalizarNome(nome) {
        if (typeof nome !== 'string') {
            return '';
        }

        return nome
            .trim()
            .replace(/\s+/g, ' ');
    }

    function normalizarEmail(email) {
        if (typeof email !== 'string') {
            return '';
        }

        return email
            .trim()
            .toLowerCase();
    }

    function normalizarIdentidadeGenero(
        identidadeGenero
    ) {
        if (identidadeGenero === null) {
            return null;
        }

        if (typeof identidadeGenero !== 'string') {
            return '';
        }

        return identidadeGenero
            .trim()
            .replace(/\s+/g, ' ');
    }

    function encontrarCamposDesconhecidos(
        body,
        camposPermitidos
    ) {
        return Object
            .keys(body)
            .filter(
                (campo) =>
                    !camposPermitidos.includes(campo)
            );
    }

    function validarAtualizacao(body) {
        if (!ehObjeto(body)) {
            return {
                valido: false,
                erros: [
                    erro(
                        'dados',
                        'O corpo da requisição deve ser um objeto.'
                    )
                ],
                dados: {}
            };
        }

        const erros = [];

        const camposDesconhecidos =
            encontrarCamposDesconhecidos(
                body,
                [
                    'nome',
                    'email',
                    'identidadeGenero',
                    'dataNascimento'
                ]
            );

        if (camposDesconhecidos.length > 0) {
            erros.push(
                erro(
                    'dados',
                    'A requisição contém campos não permitidos.'
                )
            );
        }

        const nome = body.nome === undefined
            ? undefined
            : normalizarNome(body.nome);

        const email = body.email === undefined
            ? undefined
            : normalizarEmail(body.email);

        const identidadeGenero =
            body.identidadeGenero === undefined
                ? undefined
                : normalizarIdentidadeGenero(
                    body.identidadeGenero
                );

        const dataNascimento =
            body.dataNascimento === undefined
                ? undefined
                : dateUtils.criarDataValida(
                    body.dataNascimento
                );

        if (
            nome !== undefined
            && nome.length < 3
        ) {
            erros.push(
                erro(
                    'nome',
                    'O nome deve ter pelo menos 3 caracteres.'
                )
            );
        } else if (
            nome !== undefined
            && (
                nome.length > 120
                || !regexNome.test(nome)
            )
        ) {
            erros.push(
                erro(
                    'nome',
                    'O nome deve conter apenas letras, espaços ou hífens.'
                )
            );
        }

        if (
            email !== undefined
            && (
                !regexEmail.test(email)
                || email.length > 254
            )
        ) {
            erros.push(
                erro(
                    'email',
                    'Informe um e-mail válido.'
                )
            );
        }

        if (
            identidadeGenero !== undefined
            && identidadeGenero !== null
            && !identidadesGeneroPermitidas.has(
                identidadeGenero
            )
        ) {
            erros.push(
                erro(
                    'identidadeGenero',
                    'Informe uma identidade de gênero válida.'
                )
            );
        }

        if (
            body.dataNascimento !== undefined
            && (
                !dataNascimento
                || dataNascimento > new Date()
            )
        ) {
            erros.push(
                erro(
                    'dataNascimento',
                    'Informe uma data de nascimento válida.'
                )
            );
        }

        const nenhumCampoInformado =
            nome === undefined
            && email === undefined
            && identidadeGenero === undefined
            && dataNascimento === undefined;

        if (nenhumCampoInformado) {
            erros.push(
                erro(
                    'dados',
                    'Informe pelo menos um dado para atualização.'
                )
            );
        }

        return {
            valido: erros.length === 0,
            erros,

            dados: {
                nome,
                email,
                identidadeGenero,
                dataNascimento
            }
        };
    }

    function validarAlteracaoSenha(body) {
        if (!ehObjeto(body)) {
            return {
                valido: false,
                erros: [
                    erro(
                        'dados',
                        'O corpo da requisição deve ser um objeto.'
                    )
                ],
                dados: {}
            };
        }

        const erros = [];

        const camposDesconhecidos =
            encontrarCamposDesconhecidos(
                body,
                [
                    'senhaAtual',
                    'novaSenha',
                    'confirmacaoNovaSenha'
                ]
            );

        if (camposDesconhecidos.length > 0) {
            erros.push(
                erro(
                    'dados',
                    'A requisição contém campos não permitidos.'
                )
            );
        }

        const senhaAtual =
            typeof body.senhaAtual === 'string'
                ? body.senhaAtual
                : '';

        const novaSenha =
            typeof body.novaSenha === 'string'
                ? body.novaSenha
                : '';

        const confirmacaoNovaSenha =
            typeof body.confirmacaoNovaSenha
                === 'string'
                ? body.confirmacaoNovaSenha
                : '';

        if (!senhaAtual) {
            erros.push(
                erro(
                    'senhaAtual',
                    'Informe sua senha atual.'
                )
            );
        }

        const tamanhoNovaSenha =
            [...novaSenha].length;

        if (tamanhoNovaSenha < 15) {
            erros.push(
                erro(
                    'novaSenha',
                    'A nova senha deve ter pelo menos 15 caracteres.'
                )
            );
        }

        /*
         * O bcrypt considera no máximo 72 bytes.
         * A validação evita truncamento silencioso.
         */
        if (
            Buffer.byteLength(novaSenha, 'utf8') > 72
        ) {
            erros.push(
                erro(
                    'novaSenha',
                    'A nova senha ultrapassa o tamanho máximo permitido.'
                )
            );
        }

        if (
            senhasBloqueadas.has(
                novaSenha.toLocaleLowerCase('pt-BR')
            )
        ) {
            erros.push(
                erro(
                    'novaSenha',
                    'Essa senha é muito comum. Escolha uma senha diferente.'
                )
            );
        }

        if (novaSenha !== confirmacaoNovaSenha) {
            erros.push(
                erro(
                    'confirmacaoNovaSenha',
                    'As senhas não coincidem.'
                )
            );
        }

        return {
            valido: erros.length === 0,
            erros,

            dados: {
                senhaAtual,
                novaSenha
            }
        };
    }

    return {
        validarAtualizacao,
        validarAlteracaoSenha
    };
}

module.exports = {
    criarAccountValidator
};