import { criarCycleRemovalController } from './controllers/cycleRemoval.controller.js';
import { criarCycleRemovalRepository } from './repositories/cycleRemoval.repository.js';
import { criarCycleRemovalService } from './services/cycleRemoval.service.js';

function criarCycleRemovalModule({ prisma } = {}) {
    const repository = criarCycleRemovalRepository({ prisma });
    const service = criarCycleRemovalService({ repository });
    const controller = criarCycleRemovalController({ cycleRemovalService: service });

    return Object.freeze({ repository, service, controller });
}

export { criarCycleRemovalModule };
