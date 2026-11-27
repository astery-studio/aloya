import { AppError } from '../../shared/errors/AppError.js';

export const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export function validar(entrada) {
    const { instalacao, token, plataforma, fuso } = entrada ?? {};
    if (
        typeof instalacao === 'string' &&
        uuid.test(instalacao) &&
        typeof token === 'string' &&
        /^(?:ExponentPushToken|ExpoPushToken)\[[\w-]{10,180}\]$/.test(token) &&
        ['android', 'ios'].includes(plataforma) &&
        typeof fuso === 'string' &&
        fuso.length <= 100 &&
        Object.keys(entrada).length === 4
    ) {
        try {
            const fusoCanonico = new Intl.DateTimeFormat('en', { timeZone: fuso }).resolvedOptions()
                .timeZone;
            return { instalacao, token, plataforma, fuso: fusoCanonico };
        } catch {
            /* Fuso inválido. */
        }
    }
    throw new AppError('Dispositivo de notificações inválido.', 422, 'DISPOSITIVO_PUSH_INVALIDO');
}
