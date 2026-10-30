import { criarCycleRegistrationRepository } from './repositories/cycleRegistration.repository.js';
import { criarCycleRegistrationService } from './services/cycleRegistration.service.js';
import { criarCycleRegistrationController } from './controllers/cycleRegistration.controller.js';
import { criarCycleSharingService } from './services/cycleSharing.service.js';

function criarCycleRegistrationModule({ prisma, agora } = {}) {
    const repository = criarCycleRegistrationRepository({ prisma });
    const service = criarCycleRegistrationService({ repository, agora });
    const sharingService = criarCycleSharingService({ prisma });
    const controller = criarCycleRegistrationController({ service, sharingService });
    return { repository, service, controller, sharingService };
}

export { criarCycleRegistrationModule };
