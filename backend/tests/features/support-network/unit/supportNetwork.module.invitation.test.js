import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';

import { criarSupportNetworkModule } from '../../../../src/features/support-network/supportNetwork.module.js';

test('compõe todas as camadas necessárias para convites', () => {
    const prisma = {};
    const emailService = { enviarConviteRedeApoio: async () => {} };
    const modulo = criarSupportNetworkModule({
        prisma,
        crypto,
        emailService,
        invitationBaseUrl: 'aloya://support-network/invitation'
    });

    assert.equal(typeof modulo.contactInvitationValidator.validarCriacaoConvite, 'function');
    assert.equal(typeof modulo.contactInvitationPermissionService.resolverCategoria, 'function');
    assert.equal(typeof modulo.contactInvitationTokenService.emitir, 'function');
    assert.equal(typeof modulo.contactInvitationService.criarConvite, 'function');
    assert.equal(typeof modulo.contactInvitationController.criarConvite, 'function');
});
