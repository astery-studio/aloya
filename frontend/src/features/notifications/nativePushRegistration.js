import { atualizarRegistro } from './nativePushDevice';

export function criarSincronizacaoPush(contexto) {
    const { controller } = contexto;
    let registrando = false;
    let pendente = false;
    let tokenNativoAtual;
    let registroAtual;
    let bloqueadoAte = 0;

    async function sincronizar({ solicitar = false, tokenNativo } = {}) {
        if (controller.signal.aborted) return;
        if (tokenNativo) {
            if (tokenNativo.data === tokenNativoAtual?.data) return;
            tokenNativoAtual = tokenNativo;
        }
        if (Date.now() < bloqueadoAte) return;
        if (registrando) {
            pendente = true;
            return;
        }

        registrando = true;

        try {
            registroAtual = await atualizarRegistro(contexto, {
                solicitar,
                tokenNativo: tokenNativoAtual,
                anterior: registroAtual
            });
        } catch (erro) {
            if (erro?.status === 429)
                bloqueadoAte = Date.now() + (erro.tentarAposMs ?? 60_000);
        } finally {
            registrando = false;
            if (pendente) {
                pendente = false;
                void sincronizar();
            }
        }
    }

    return sincronizar;
}
