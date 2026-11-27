export function criarAberturaPush({ push, service, controller, navegar }) {
    const vistos = new Set();

    async function abrir(resposta) {
        const id = resposta?.notification.request.content.data?.notificacaoId;
        if (typeof id !== 'string' || !/^\d+$/.test(id) || vistos.has(id)) return;
        vistos.add(id);
        try {
            const destino = await service.resolverDestino(id, controller.signal);
            if (!controller.signal.aborted) navegar(destino);
        } catch (erro) {
            if (![401, 403, 404].includes(erro?.status)) {
                vistos.delete(id);
                return;
            }
        }
        if (!controller.signal.aborted) await push.clearLastNotificationResponseAsync();
    }
    return abrir;
}
