import { criarPermissionCategoryService } from './services/permissionCategory.service.js';
import { criarPermissionCategoryValidator } from './validators/permissionCategory.validator.js';
import { criarPermissionCategoryController } from './controllers/permissionCategory.controller.js';
import { criarPermissionCategoryDeletionService } from './services/permissionCategoryDeletion.service.js';
import { criarPermissionCategoryDeletionValidator } from './validators/permissionCategoryDeletion.validator.js';
import { criarPermissionCategoryDeletionController } from './controllers/permissionCategoryDeletion.controller.js';

function criarSupportNetworkModule({ prisma } = {}) {
    const permissionCategoryService = criarPermissionCategoryService({ prisma });
    const permissionCategoryValidator = criarPermissionCategoryValidator();
    const permissionCategoryController = criarPermissionCategoryController({ permissionCategoryService, permissionCategoryValidator });
    const permissionCategoryDeletionService = criarPermissionCategoryDeletionService({ prisma });
    const permissionCategoryDeletionValidator = criarPermissionCategoryDeletionValidator();
    const permissionCategoryDeletionController = criarPermissionCategoryDeletionController({
        permissionCategoryDeletionService,
        permissionCategoryDeletionValidator,
        permissionCategoryValidator
    });

    return Object.freeze({
        permissionCategoryService,
        permissionCategoryValidator,
        permissionCategoryController,
        permissionCategoryDeletionService,
        permissionCategoryDeletionValidator,
        permissionCategoryDeletionController
    });
}

export { criarSupportNetworkModule };
