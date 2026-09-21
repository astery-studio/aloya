import {
    lerSeguro, removerSeguro, salvarSeguro
} from '../storage/secureStorage';

const CHAVE_SESSAO = 'aloya.auth.session';

async function salvarToken({ token, tipo = 'Bearer' }) {
    if (typeof token !== 'string' || !token.trim()) {
        throw new Error('Token de sessão inválido.');
    }

    await salvarSeguro(CHAVE_SESSAO, JSON.stringify({ token, tipo }));
}

async function obterToken() {
    const sessao = await lerSeguro(CHAVE_SESSAO);
    if (!sessao) return null;

    try {
        return JSON.parse(sessao);
    } catch {
        await removerSeguro(CHAVE_SESSAO);
        return null;
    }
}

async function removerToken() {
    await removerSeguro(CHAVE_SESSAO);
}

export { obterToken, removerToken, salvarToken };
