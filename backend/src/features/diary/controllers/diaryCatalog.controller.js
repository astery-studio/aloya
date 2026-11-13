function criarDiaryCatalogController({ catalogService, preferencesService, validarLote } = {}) {
    if (
        !catalogService?.buscar ||
        !preferencesService?.atualizar ||
        typeof validarLote !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar o Diário.');
    }

    async function atualizarLote(req, res, next) {
        try {
            const dados = validarLote(req.body);
            await preferencesService.atualizarLote({ usuarioId: req.usuario.id, ...dados });
            const catalogo = await catalogService.buscar(req.usuario.id);
            return res.status(200).json(catalogo);
        } catch (erro) {
            return next(erro);
        }
    }

    async function buscar(req, res, next) {
        try {
            const catalogo = await catalogService.buscar(req.usuario.id);
            return res.status(200).json(catalogo);
        } catch (erro) {
            return next(erro);
        }
    }

    function criarAtualizacao(tipo) {
        return async (req, res, next) => {
            try {
                const dados = req.validarPreferencia(req.body);
                await preferencesService.atualizar({
                    usuarioId: req.usuario.id,
                    tipo,
                    id: req.params.id,
                    ...dados
                });
                const catalogo = await catalogService.buscar(req.usuario.id);
                return res.status(200).json(catalogo);
            } catch (erro) {
                return next(erro);
            }
        };
    }

    return {
        buscar,
        atualizarLote,
        atualizarMacrocategoria: criarAtualizacao('macrocategoria'),
        atualizarCategoria: criarAtualizacao('categoria')
    };
}

export { criarDiaryCatalogController };
