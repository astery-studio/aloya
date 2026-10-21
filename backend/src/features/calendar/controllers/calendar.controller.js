//Traduz a consulta HTTP do calendário para uma operação segura do service.
function criarCalendarController({calendarService} = {}) {
    if (typeof calendarService?.buscarMes !== 'function') {
        throw new TypeError('Não foi possível configurar o controller do calendário.');
    }

    async function buscarMes(requisicao, resposta, proximo) {
        try {
            const calendario = await calendarService.buscarMes({
                usuarioId: requisicao.usuario.id,
                mes: requisicao.query.mes
            });

            resposta.set('Cache-Control', 'private, no-store');
            resposta.set('Pragma', 'no-cache');

            return resposta.status(200).json({
                calendario
            });
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario = 'Não foi possível carregar os dados do calendário. Tente novamente.';
            }

            return proximo(erro);
        }
    }

    return {buscarMes};
}

export { criarCalendarController };