import { criarLogoutService } from './services/logout.service.js';
import { criarLogoutController } from './controllers/logout.controller.js';

function criarLogoutModule({ prisma } = {}) {
    const logoutService = criarLogoutService({ prisma });
    const logoutController = criarLogoutController({ logoutService });
    return Object.freeze({ logoutService, logoutController });
}

export { criarLogoutModule };
