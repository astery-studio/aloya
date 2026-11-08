import { criarPermissionCategoryService } from './services/permissionCategory.service.js';
import { criarPermissionCategoryValidator } from './validators/permissionCategory.validator.js';
import { criarPermissionCategoryController } from './controllers/permissionCategory.controller.js';
import { criarPermissionCategoryDeletionService } from './services/permissionCategoryDeletion.service.js';
import { criarPermissionCategoryDeletionValidator } from './validators/permissionCategoryDeletion.validator.js';
import { criarPermissionCategoryDeletionController } from './controllers/permissionCategoryDeletion.controller.js';
import { criarContactInvitationValidator } from './validators/contactInvitation.validator.js';
import { criarContactInvitationPermissionService } from './services/contactInvitationPermission.service.js';
import { criarContactInvitationTokenService } from './services/contactInvitationToken.service.js';
import { criarContactInvitationService } from './services/contactInvitation.service.js';
import { criarContactInvitationController } from './controllers/contactInvitation.controller.js';

function criarSupportNetworkModule({ prisma, crypto, emailService, invitationBaseUrl, now } = {}) {
    const permissionCategoryService = criarPermissionCategoryService({ prisma });
    const permissionCategoryValidator = criarPermissionCategoryValidator();
    const permissionCategoryController = criarPermissionCategoryController({
        permissionCategoryService,
        permissionCategoryValidator
    });
    const permissionCategoryDeletionService = criarPermissionCategoryDeletionService({ prisma });
    const permissionCategoryDeletionValidator = criarPermissionCategoryDeletionValidator();
    const permissionCategoryDeletionController = criarPermissionCategoryDeletionController({
        permissionCategoryDeletionService,
        permissionCategoryDeletionValidator,
        permissionCategoryValidator
    });
    const contactInvitationValidator = criarContactInvitationValidator();
    const contactInvitationPermissionService = criarContactInvitationPermissionService({ prisma });
    const contactInvitationTokenService = criarContactInvitationTokenService({
        crypto,
        baseUrl: invitationBaseUrl,
        now
    });
    const contactInvitationService = criarContactInvitationService({
        prisma,
        permissionService: contactInvitationPermissionService,
        tokenService: contactInvitationTokenService,
        emailService
    });
    const contactInvitationController = criarContactInvitationController({
        service: contactInvitationService,
        validator: contactInvitationValidator
    });

    return Object.freeze({
        permissionCategoryService,
        permissionCategoryValidator,
        permissionCategoryController,
        permissionCategoryDeletionService,
        permissionCategoryDeletionValidator,
        permissionCategoryDeletionController,
        contactInvitationValidator,
        contactInvitationPermissionService,
        contactInvitationTokenService,
        contactInvitationService,
        contactInvitationController
    });
}

export { criarSupportNetworkModule };
