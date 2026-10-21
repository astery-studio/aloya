import { criarAccountService } from './services/account.service.js';
import { criarAccountDeletionService } from './services/accountDeletion.service.js';
import { criarAccountValidator } from './validators/account.validator.js';
import { criarAccountDeletionValidator } from './validators/accountDeletion.validator.js';
import { criarAccountController } from './controllers/account.controller.js';
import { criarAccountDeletionController } from './controllers/accountDeletion.controller.js';

function criarSettingsModule({ prisma, passwordService, parentalConsentService, dateUtils, now } = {}) {
    const accountService = criarAccountService({ prisma, passwordService, parentalConsentService, dateUtils, now });
    const accountDeletionService = criarAccountDeletionService({ prisma, passwordService, now });
    const accountValidator = criarAccountValidator({ dateUtils });
    const accountDeletionValidator = criarAccountDeletionValidator();
    const accountController = criarAccountController({ accountService, accountValidator });
    const accountDeletionController = criarAccountDeletionController({ accountDeletionService, accountDeletionValidator });

    return Object.freeze({ accountService, accountDeletionService, accountValidator, accountDeletionValidator, accountController, accountDeletionController });
}

export { criarSettingsModule };
