const caminho = '/api/dispositivos-notificacao';

export function criarPushDeviceService({ requisicaoAutenticada }) {
    return {
        async registrar(corpo, signal) {
            const resposta = await requisicaoAutenticada({
                metodo: 'POST',
                caminho,
                corpo,
                signal
            });
            return resposta.dispositivo.id;
        },
        remover: (id, signal) =>
            requisicaoAutenticada({
                metodo: 'DELETE',
                caminho: `${caminho}/${encodeURIComponent(id)}`,
                signal
            }),
        async resolverDestino(id, signal) {
            const resposta = await requisicaoAutenticada({
                caminho: `${caminho}/destino/${id}`,
                signal
            });
            return resposta.destino;
        }
    };
}
