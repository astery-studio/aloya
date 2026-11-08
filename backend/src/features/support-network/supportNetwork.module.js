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
import { criarContactInvitationResponseService } from './services/contactInvitationResponse.service.js';
import { criarContactRegistrationValidator } from './validators/contactRegistration.validator.js';
import { criarContactInvitationResponseController } from './controllers/contactInvitationResponse.controller.js';
import { criarSupportContactService } from './services/supportContact.service.js';
import { criarSupportContactController } from './controllers/supportContact.controller.js';
import { criarSupportContactValidator } from './validators/supportContact.validator.js';
import { criarContactInvitationResendService } from './services/contactInvitationResend.service.js';
import { criarContactLinkService } from './services/contactLink.service.js';
import { criarContactLinkValidator } from './validators/contactLink.validator.js';
import { criarContactLinkController } from './controllers/contactLink.controller.js';

function criarSupportNetworkModule({
    prisma,
    crypto,
    emailService,
    invitationBaseUrl,
    passwordService,
    now
} = {}) {
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
    const contactRegistrationValidator = criarContactRegistrationValidator({ now });
    const contactInvitationResponseService = criarContactInvitationResponseService({
        prisma,
        tokenService: contactInvitationTokenService,
        passwordService,
        now
    });
    const contactInvitationResponseController = criarContactInvitationResponseController({
        service: contactInvitationResponseService,
        invitationValidator: contactInvitationValidator,
        registrationValidator: contactRegistrationValidator
    });
    const supportContactService = criarSupportContactService({ prisma, now });
    const supportContactValidator = criarSupportContactValidator();
    const contactInvitationResendService = criarContactInvitationResendService({
        prisma,
        tokenService: contactInvitationTokenService,
        emailService,
        now
    });
    const supportContactController = criarSupportContactController({
        service: supportContactService,
        resendService: contactInvitationResendService,
        validator: supportContactValidator
    });
    const contactLinkService = criarContactLinkService({ prisma, now });
    const contactLinkValidator = criarContactLinkValidator();
    const contactLinkController = criarContactLinkController({
        service: contactLinkService,
        contactValidator: supportContactValidator,
        linkValidator: contactLinkValidator
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
        contactInvitationController,
        contactRegistrationValidator,
        contactInvitationResponseService,
        contactInvitationResponseController,
        supportContactService,
        supportContactValidator,
        contactInvitationResendService,
        supportContactController,
        contactLinkService,
        contactLinkValidator,
        contactLinkController
    });
}

export { criarSupportNetworkModule };
