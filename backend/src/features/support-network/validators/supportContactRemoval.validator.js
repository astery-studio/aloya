function objetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) return false;
    const prototipo = Object.getPrototypeOf(valor);
    return prototipo === Object.prototype || prototipo === null;
}

function criarSupportContactRemovalValidator() {
    function validarConfirmacao(body) {
        const erros = [];
        if (!objetoSimples(body)) {
            return Object.freeze({
                valido: false,
                erros: Object.freeze([
                    Object.freeze({
                        campo: 'body',
                        mensagem: 'Confirme a remoção do contato.'
                    })
                ])
            });
        }

        for (const campo of Object.keys(body)) {
            if (campo !== 'confirmado') {
                erros.push({ campo, mensagem: 'Campo não permitido.' });
            }
        }
        if (body.confirmado !== true) {
            erros.push({ campo: 'confirmado', mensagem: 'Confirme a remoção do contato.' });
        }

        return erros.length > 0
            ? Object.freeze({
                  valido: false,
                  erros: Object.freeze(erros.map(Object.freeze))
              })
            : Object.freeze({ valido: true, dados: Object.freeze({ confirmado: true }) });
    }

    return Object.freeze({ validarConfirmacao });
}

export { criarSupportContactRemovalValidator };
