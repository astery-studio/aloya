//Recebe a consulta HTTP do histórico usando exclusivamente a identidade da sessão autenticada.

//Confere se o service necessário foi configurado corretamente.
function validarService(cycleHistoryService) {
    if (!cycleHistoryService || typeof cycleHistoryService.listarHistorico !== 'function') {
        throw new TypeError('O service do histórico de ciclos é inválido.');
    }
}

//Cria o controller responsável pela leitura do histórico de ciclos.
function criarCycleHistoryController({cycleHistoryService} = {}) {
    validarService(cycleHistoryService);

    //Busca o histórico da própria pessoa autenticada e impede armazenamento em cache.
    async function listarHistorico(req, res, next) {
        try {
            const resultado = await cycleHistoryService.listarHistorico({
                usuarioId: req.usuario.id,
                consulta: req.query
            });

            res.set('Cache-Control', 'no-store');
            res.set('Pragma', 'no-cache');

            return res.status(200).json(resultado);
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario = 'Não foi possível carregar seu histórico de ciclos. Tente novamente.';
            }

            return next(erro);
        }
    }

    return {
        listarHistorico
    };
}

export {criarCycleHistoryController};