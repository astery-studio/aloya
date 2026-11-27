import { atualizarRegistro } from './nativePushDevice';

export function criarSincronizacaoPush(contexto) {
    const { controller } = contexto;
    let registrando = false;
    let renovar = false;

    async function sincronizar(solicitar = false) {
        if (registrando) {
            renovar = true;
            return;
        }

        registrando = true;

        try {
            await atualizarRegistro(contexto, solicitar);
        } catch {
            // Tenta sincronizar novamente ao voltar para o app ou quando o token mudar.
        } finally {
            registrando = false;
            if (renovar && !controller.signal.aborted) {
                renovar = false;
                void sincronizar();
            }
        }
    }

    return sincronizar;
}
