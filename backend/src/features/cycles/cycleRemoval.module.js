import { criarCycleRemovalController } from './controllers/cycleRemoval.controller.js';
import { criarCycleRemovalRepository } from './repositories/cycleRemoval.repository.js';
import { criarCycleRemovalService } from './services/cycleRemoval.service.js';

function criarCycleRemovalModule({ prisma, thermalRecalculation } = {}) {
    const repository = criarCycleRemovalRepository({ prisma, thermalRecalculation });
    const service = criarCycleRemovalService({ repository });
    const controller = criarCycleRemovalController({ cycleRemovalService: service });

    return Object.freeze({ repository, service, controller });
}

export { criarCycleRemovalModule };
