import { criarPermissionCategoryService } from './services/permissionCategory.service.js';
import { criarPermissionCategoryValidator } from './validators/permissionCategory.validator.js';
import { criarPermissionCategoryController } from './controllers/permissionCategory.controller.js';

function criarSupportNetworkModule({ prisma } = {}) {
    const permissionCategoryService = criarPermissionCategoryService({ prisma });
    const permissionCategoryValidator = criarPermissionCategoryValidator();
    const permissionCategoryController = criarPermissionCategoryController({ permissionCategoryService, permissionCategoryValidator });
    return Object.freeze({ permissionCategoryService, permissionCategoryValidator, permissionCategoryController });
}

export { criarSupportNetworkModule };
