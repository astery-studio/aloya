import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';

import { criarContactInvitationTokenService } from '../../../../src/features/support-network/services/contactInvitationToken.service.js';

test('emite link com token puro e armazena somente seu hash', () => {
    const agora = new Date('2026-11-08T12:00:00.000Z');
    const service = criarContactInvitationTokenService({
        crypto,
        baseUrl: 'aloya://support-network/invitation',
        now: () => agora
    });

    const resultado = service.emitir();
    const token = new URL(resultado.link).searchParams.get('token');
    const hashCalculado = crypto.createHash('sha256').update(token).digest('hex');

    assert.equal(resultado.tokenHash, hashCalculado);
    assert.equal(resultado.link.includes(resultado.tokenHash), false);
    assert.equal(resultado.dataExpiracao.toISOString(), '2026-11-15T12:00:00.000Z');
});

test('cada emissão produz credenciais independentes', () => {
    const service = criarContactInvitationTokenService({
        crypto,
        baseUrl: 'https://aloya.example/invitation'
    });

    assert.notEqual(service.emitir().tokenHash, service.emitir().tokenHash);
});

test('rejeita configuração incompleta ou URL inválida', () => {
    assert.throws(() => criarContactInvitationTokenService(), {
        name: 'TypeError',
        message: 'Não foi possível configurar os tokens de convite.'
    });

    const service = criarContactInvitationTokenService({ crypto, baseUrl: 'URL inválida' });
    assert.throws(() => service.emitir(), { name: 'TypeError' });
});
