function criarSupportContactValidator() {
    function validarContatoId(valor) {
        const contatoId = typeof valor === 'string' && /^\d+$/u.test(valor) ? Number(valor) : NaN;

        if (!Number.isSafeInteger(contatoId) || contatoId <= 0) {
            return Object.freeze({
                valido: false,
                erro: Object.freeze({
                    campo: 'contatoId',
                    codigo: 'CONTATO_ID_INVALIDO',
                    mensagem: 'Contato inválido.'
                })
            });
        }

        return Object.freeze({ valido: true, contatoId });
    }

    function validarRespostaConvite(valor) {
        const acao = valor?.acao;

        if (!['aceitar', 'recusar'].includes(acao) || Object.keys(valor ?? {}).length !== 1) {
            return Object.freeze({
                valido: false,
                erro: Object.freeze({
                    campo: 'acao',
                    codigo: 'ACAO_CONVITE_INVALIDA',
                    mensagem: 'Escolha aceitar ou recusar o convite.'
                })
            });
        }

        return Object.freeze({ valido: true, acao });
    }

    return Object.freeze({ validarContatoId, validarRespostaConvite });
}

export { criarSupportContactValidator };
