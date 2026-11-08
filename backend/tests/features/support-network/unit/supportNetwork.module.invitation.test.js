import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';

import { criarSupportNetworkModule } from '../../../../src/features/support-network/supportNetwork.module.js';

test('compõe todas as camadas necessárias para convites', () => {
    const prisma = {
        vinculoRedeApoio: { findUnique: async () => null },
        $transaction: async (callback) => callback({})
    };
    const emailService = { enviarConviteRedeApoio: async () => {} };
    const modulo = criarSupportNetworkModule({
        prisma,
        crypto,
        emailService,
        passwordService: { gerarHash: async () => ({ senhaHash: 'hash' }) },
        invitationBaseUrl: 'aloya://support-network/invitation'
    });

    assert.equal(typeof modulo.contactInvitationValidator.validarCriacaoConvite, 'function');
    assert.equal(typeof modulo.contactInvitationPermissionService.resolverCategoria, 'function');
    assert.equal(typeof modulo.contactInvitationTokenService.emitir, 'function');
    assert.equal(typeof modulo.contactInvitationService.criarConvite, 'function');
    assert.equal(typeof modulo.contactInvitationController.criarConvite, 'function');
    assert.equal(typeof modulo.contactRegistrationValidator.validar, 'function');
    assert.equal(typeof modulo.contactInvitationResponseService.consultar, 'function');
    assert.equal(typeof modulo.contactInvitationResponseController.responder, 'function');
    assert.equal(typeof modulo.supportContactService.listar, 'function');
    assert.equal(typeof modulo.supportContactValidator.validarContatoId, 'function');
    assert.equal(typeof modulo.contactInvitationResendService.reenviar, 'function');
    assert.equal(typeof modulo.supportContactController.listar, 'function');
    assert.equal(typeof modulo.supportContactController.reenviarConvite, 'function');
});
