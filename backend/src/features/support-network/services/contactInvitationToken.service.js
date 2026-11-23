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

    function calcularHash(token) {
        if (
            typeof token !== 'string' ||
            token.length < 32 ||
            token.length > 256 ||
            !/^[A-Za-z0-9_-]+$/.test(token)
        ) {
            return null;
        }

        return crypto.createHash('sha256').update(token).digest('hex');
    }

    return Object.freeze({ calcularHash, emitir });
}

export { criarContactInvitationTokenService };
