//Este validator confere a senha informada e a confirmação explícita da exclusão
function criarAccountDeletionValidator() {
    //Cria um erro associado ao campo correspondente
    function criarErro(campo, mensagem) {
        return {
            campo,
            mensagem
        }
    }

    //Confirma que o corpo recebido é um objeto JSON
    function ehObjeto(body) {
        return (
            body !== null
            && typeof body === 'object'
            && !Array.isArray(body)
        )
    }

    //Valida somente os dados necessários à exclusão
    function validarExclusao(body) {
        if (!ehObjeto(body)) {
            return {
                valido: false,

                erros: [
                    criarErro(
                        'dados',
                        'O corpo da requisição deve ser um objeto.'
                    )
                ],

                dados: {}
            }
        }

        const erros = []

        const camposPermitidos = [
            'senhaAtual',
            'confirmarExclusao'
        ]

        const camposDesconhecidos =
            Object.keys(body).filter(
                (campo) =>
                    !camposPermitidos.includes(campo)
            )

        //Impede que um usuarioId, papel ou outro campo seja aceito no body
        if (camposDesconhecidos.length > 0) {
            erros.push(
                criarErro(
                    'dados',
                    'A requisição contém campos não permitidos.'
                )
            )
        }

        const senhaAtual = body.senhaAtual

        if (
            typeof senhaAtual !== 'string'
            || senhaAtual.length === 0
        ) {
            erros.push(
                criarErro(
                    'senhaAtual',
                    'Informe sua senha atual.'
                )
            )
        } else if (
            Buffer.byteLength(
                senhaAtual,
                'utf8'
            ) > 72
        ) {
            //Bcrypt considera no máximo 72 bytes; evita entradas truncadas
            erros.push(
                criarErro(
                    'senhaAtual',
                    'A senha atual ultrapassa o tamanho máximo permitido.'
                )
            )
        }

        //Somente o booleano true representa a confirmação do modal
        if (body.confirmarExclusao !== true) {
            erros.push(
                criarErro(
                    'confirmarExclusao',
                    'Confirme a exclusão permanente para continuar.'
                )
            )
        }

        return {
            valido: erros.length === 0,
            erros,

            dados: {
                senhaAtual
            }
        }
    }

    return {
        validarExclusao
    }
}

export { criarAccountDeletionValidator }