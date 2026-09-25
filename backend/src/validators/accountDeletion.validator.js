//Valida a senha e a confirmação explícita usadas no fluxo seguro de exclusão.
function criarAccountDeletionValidator() {
    //Cria uma mensagem associada ao campo inválido.
    function criarErro(campo, mensagem) {
        return {campo, mensagem}
    }

    //Confirma que o corpo da requisição é um objeto JSON simples.
    function ehObjeto(body) {
        return body !== null && typeof body === 'object' && !Array.isArray(body)
    }

    //Valida a senha e rejeita qualquer campo não permitido para a operação.
    function validarSenha(body, camposPermitidos) {
        if (!ehObjeto(body)) {
            return {
                valido: false,
                erros: [
                    criarErro('dados', 'O corpo da requisição deve ser um objeto.')
                ],
                dados: {}
            }
        }

        const erros = []
        const camposDesconhecidos = Object.keys(body).filter(campo => !camposPermitidos.includes(campo))

        if (camposDesconhecidos.length > 0) {
            erros.push(
                criarErro('dados', 'A requisição contém campos não permitidos.')
            )
        }

        const senhaAtual = body.senhaAtual

        if (typeof senhaAtual !== 'string' || senhaAtual.length === 0) {
            erros.push(
                criarErro('senhaAtual', 'Informe sua senha atual.')
            )
        } else if (Buffer.byteLength(senhaAtual, 'utf8') > 72) {
            erros.push(
                criarErro('senhaAtual', 'A senha atual ultrapassa o tamanho máximo permitido.')
            )
        }

        return {
            valido: erros.length === 0,
            erros,
            dados: {senhaAtual}
        }
    }

    //Valida somente a senha usada antes de abrir a confirmação final.
    function validarConfirmacaoSenha(body) {
        return validarSenha(body, ['senhaAtual'])
    }

    //Valida a senha e o consentimento final usados para excluir a conta.
    function validarExclusao(body) {
        const resultado = validarSenha(body, [
            'senhaAtual',
            'confirmarExclusao'
        ])

        if (!ehObjeto(body)) {
            return resultado
        }

        if (body.confirmarExclusao !== true) {
            resultado.erros.push(
                criarErro('confirmarExclusao', 'Confirme a exclusão permanente para continuar.')
            )

            resultado.valido = false
        }

        return resultado
    }

    return {
        validarConfirmacaoSenha,
        validarExclusao
    }
}

export { criarAccountDeletionValidator }