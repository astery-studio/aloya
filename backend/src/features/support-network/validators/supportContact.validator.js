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

    return Object.freeze({ validarContatoId });
}

export { criarSupportContactValidator };
