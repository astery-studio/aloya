//esse service serve para validar os dados de atualizacao e alteracao de senha do usuario, verificando se o corpo da requisicao e um objeto, se os campos sao permitidos, se os valores sao validos e retornando um objeto com a validade, os erros e os dados normalizados

//funcao para validar os dados de atualizacao e alteracao de senha do usuario
function criarAccountValidator({ dateUtils }) {
    const regexNome =
        /^[\p{L}]+(?:[ -][\p{L}]+)*$/u

    const regexEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    ])

    //funcao de erro para retornar o campo e a mensagem de erro
    function erro(campo, mensagem) {
        return {
            campo,
            mensagem
        }
    }

    //funcao para verificar se o corpo da requisicao e um objeto
    function ehObjeto(body) {
        return (
            body !== null
            && typeof body === 'object'
            && !Array.isArray(body)
        )
    }

    //funcao para normalizar o nome do usuario, removendo espacos extras e retornando uma string vazia se nao for uma string
    function normalizarNome(nome) {
        if (typeof nome !== 'string') {
            return ''
        }

        return nome
            .trim()
            .replace(/\s+/g, ' ')
    }

    //funcao para normalizar o email do usuario, removendo espacos extras e convertendo para minusculo, retornando uma string vazia se nao for uma string
    function normalizarEmail(email) {
        if (typeof email !== 'string') {
            return ''
        }

        return email
            .trim()
            .toLowerCase()
    }

    //funcao para normalizar a identidade de genero do usuario, removendo espacos extras e retornando null se for null, retornando uma string vazia se nao for uma string
    function normalizarIdentidadeGenero(
        identidadeGenero
    ) {
        if (identidadeGenero === null) {
            return null
        }

        if (typeof identidadeGenero !== 'string') {
            return ''
        }

        return identidadeGenero
            .trim()
            .replace(/\s+/g, ' ')
    }

    //funcao para encontrar campos desconhecidos no corpo da requisicao, comparando com os campos permitidos
    function encontrarCamposDesconhecidos(
        body,
        camposPermitidos
    ) {
        return Object
            .keys(body)
            .filter(
                (campo) =>
                    !camposPermitidos.includes(campo)
            )
    }

    //funcao para validar os dados de atualizacao do usuario, verificando se o corpo da requisicao e um objeto, se os campos sao permitidos, se os valores sao validos e retornando um objeto com a validade, os erros e os dados normalizados
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
            }
        }

        const erros = []

        const camposDesconhecidos =
            encontrarCamposDesconhecidos(
                body,
                [
                    'nome',
                    'email',
                    'identidadeGenero',
                    'dataNascimento'
                ]
            )

        if (camposDesconhecidos.length > 0) {
            erros.push(
                erro(
                    'dados',
                    'A requisição contém campos não permitidos.'
                )
            )
        }

        const nome = body.nome === undefined
            ? undefined
            : normalizarNome(body.nome)

        const email = body.email === undefined
            ? undefined
            : normalizarEmail(body.email)

        const identidadeGenero =
            body.identidadeGenero === undefined
                ? undefined
                : normalizarIdentidadeGenero(
                    body.identidadeGenero
                )

        const dataNascimento =
            body.dataNascimento === undefined
                ? undefined
                : dateUtils.criarDataValida(
                    body.dataNascimento
                )

        //validacao de nome
        if (
            nome !== undefined
            && nome.length < 3
        ) {
            erros.push(
                erro(
                    'nome',
                    'O nome deve ter pelo menos 3 caracteres.'
                )
            )
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
            )
        }

        //validacao de email
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
            )
        }

        //validacao de identidade de genero
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
            )
        }

        //validacao de data de nascimento
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
            )
        }

        const nenhumCampoInformado =
            nome === undefined
            && email === undefined
            && identidadeGenero === undefined
            && dataNascimento === undefined;

        //verifica se nenhum campo foi informado para atualizacao
        if (nenhumCampoInformado) {
            erros.push(
                erro(
                    'dados',
                    'Informe pelo menos um dado para atualização.'
                )
            )
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
        }
    }


    //funcao para validar os dados de alteracao de senha do usuario, verificando se o corpo da requisicao e um objeto, se os campos sao permitidos, se os valores sao validos e retornando um objeto com a validade, os erros e os dados normalizados
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
            }
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
            )

        //verifica se existem campos desconhecidos no corpo da requisicao
        if (camposDesconhecidos.length > 0) {
            erros.push(
                erro(
                    'dados',
                    'A requisição contém campos não permitidos.'
                )
            )
        }

        const senhaAtual =
            typeof body.senhaAtual === 'string'
                ? body.senhaAtual
                : ''

        const novaSenha =
            typeof body.novaSenha === 'string'
                ? body.novaSenha
                : ''

        const confirmacaoNovaSenha =
            typeof body.confirmacaoNovaSenha
                === 'string'
                ? body.confirmacaoNovaSenha
                : ''

        //verifica se a senha atual foi informada
        if (!senhaAtual) {
            erros.push(
                erro(
                    'senhaAtual',
                    'Informe sua senha atual.'
                )
            )
        }

        const tamanhoNovaSenha =
            [...novaSenha].length;

        //verifica se a nova senha tem pelo menos 15 caracteres
        if (tamanhoNovaSenha < 15) {
            erros.push(
                erro(
                    'novaSenha',
                    'A nova senha deve ter pelo menos 15 caracteres.'
                )
            )
        }

        //verifica se a nova senha ultrapassa o tamanho maximo permitido de 72 bytes
        if (
            Buffer.byteLength(novaSenha, 'utf8') > 72
        ) {
            erros.push(
                erro(
                    'novaSenha',
                    'A nova senha ultrapassa o tamanho máximo permitido.'
                )
            )
        }

        //verifica se a nova senha esta na lista de senhas bloqueadas
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
            )
        }

        //verifica se a nova senha e a confirmacao da nova senha coincidem
        if (novaSenha !== confirmacaoNovaSenha) {
            erros.push(
                erro(
                    'confirmacaoNovaSenha',
                    'As senhas não coincidem.'
                )
            )
        }

        return {
            valido: erros.length === 0,
            erros,

            dados: {
                senhaAtual,
                novaSenha
            }
        }
    }

    return {
        validarAtualizacao,
        validarAlteracaoSenha
    }
}

module.exports = {
    criarAccountValidator
}