//Expõe o estado atual do ciclo usando exclusivamente a identidade autenticada.
function criarCurrentCycleController({
    currentCycleService
} = {}) {
    if (typeof currentCycleService?.buscarEstadoAtual !== 'function') {
        throw new TypeError('Não foi possível configurar o controller do estado atual.');
    }

    async function buscarEstadoAtual(requisicao, resposta, proximo) {
        try {
            const estadoAtual = await currentCycleService.buscarEstadoAtual({
                usuarioId: requisicao.usuario.id
            });

            resposta.set('Cache-Control', 'private, no-store');
            resposta.set('Pragma', 'no-cache');

            return resposta.status(200).json({
                estadoAtual
            });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario = 'Não foi possível carregar os dados do calendário. Tente novamente.';
            }

            return proximo(erro);
        }
    }

    return {buscarEstadoAtual};
}

export { criarCurrentCycleController };