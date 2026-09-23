import {
    lerSeguro, removerSeguro, salvarSeguro
} from '../storage/secureStorage';
import { storageKeys } from '../../constants/storageKeys';

async function salvarToken({ token, tipo = 'Bearer' }) {
    if (typeof token !== 'string' || !token.trim()) {
        throw new Error('Token de sessão inválido.');
    }

    await salvarSeguro(storageKeys.sessao, JSON.stringify({ token, tipo }));
}

async function obterToken() {
    const sessao = await lerSeguro(storageKeys.sessao);
    if (!sessao) return null;

    try {
        return JSON.parse(sessao);
    } catch {
        await removerSeguro(storageKeys.sessao);
        return null;
    }
}

async function removerToken() {
    await removerSeguro(storageKeys.sessao);
}

export { obterToken, removerToken, salvarToken };
/**
 * Persiste e recupera a sessão autenticada usando armazenamento seguro.
 */
