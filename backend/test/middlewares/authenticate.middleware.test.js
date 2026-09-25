import assert from 'node:assert/strict';
import test from 'node:test';
import { criarAutenticacao, hashToken } from '../../src/middlewares/authenticate.js';

const agora = new Date('2026-09-24T12:00:00.000Z');

function executar(middleware, authorization) {
    return new Promise((resolve) => {
        const requisicao = { headers: { authorization } };
        middleware(requisicao, {}, (erro) => resolve({ erro, requisicao }));
    });
}

test('recusa requisição sem token Bearer', async () => {
    const prisma = { sessao: { findUnique: async () => null } };
    const resultado = await executar(criarAutenticacao(prisma, () => agora));
    assert.equal(resultado.erro.status, 401);
    assert.equal(resultado.erro.codigo, 'NAO_AUTENTICADO');
});

test('consulta somente o hash do token e disponibiliza o usuário', async () => {
    let consulta;
    const prisma = { sessao: { findUnique: async (argumento) => {
        consulta = argumento;
        return {
            usuarioId: 4, revogadaEm: null,
            validadeSessao: new Date('2026-09-25T12:00:00.000Z'),
            usuario: { statusConta: 'ativa' }
        };
    } } };
    const resultado = await executar(criarAutenticacao(prisma, () => agora), 'Bearer token-secreto');
    assert.equal(resultado.erro, undefined);
    assert.deepEqual(resultado.requisicao.usuario, { id: 4 });
    assert.equal(consulta.where.tokenSessaoHash, hashToken('token-secreto'));
    assert.notEqual(consulta.where.tokenSessaoHash, 'token-secreto');
});

test('recusa sessão expirada, revogada ou com conta inativa', async () => {
    const criarPrisma = (sessao) => ({ sessao: { findUnique: async () => sessao } });
    const base = { usuarioId: 1, revogadaEm: null, validadeSessao: new Date('2026-09-25T00:00:00.000Z'), usuario: { statusConta: 'ativa' } };
    const casos = [
        { ...base, validadeSessao: new Date('2026-09-23T00:00:00.000Z') },
        { ...base, revogadaEm: agora },
        { ...base, usuario: { statusConta: 'suspensa' } }
    ];
    for (const sessao of casos) {
        const resultado = await executar(criarAutenticacao(criarPrisma(sessao), () => agora), 'Bearer token');
        assert.equal(resultado.erro.codigo, 'SESSAO_INVALIDA');
    }
});
