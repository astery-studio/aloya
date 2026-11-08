import { DURACAO_CONVITE_MS } from '../constants/contactInvitation.constants.js';

function criarContactInvitationTokenService({ crypto, baseUrl, now = () => new Date() } = {}) {
    if (
        typeof crypto?.randomBytes !== 'function' ||
        typeof crypto?.createHash !== 'function' ||
        typeof baseUrl !== 'string' ||
        baseUrl.trim().length === 0 ||
        typeof now !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar os tokens de convite.');
    }

    function emitir() {
        const token = crypto.randomBytes(32).toString('base64url');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const dataExpiracao = new Date(now().getTime() + DURACAO_CONVITE_MS);
        const link = new URL(baseUrl);
        link.searchParams.set('token', token);

        return Object.freeze({ tokenHash, dataExpiracao, link: link.toString() });
    }

    return Object.freeze({ emitir });
}

export { criarContactInvitationTokenService };
