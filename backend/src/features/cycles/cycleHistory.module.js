import { criarCycleHistoryRepository } from './repositories/cycleHistory.repository.js';
import { criarCycleHistoryService } from './services/cycleHistory.service.js';
import { criarCycleHistoryController } from './controllers/cycleHistory.controller.js';

function criarCycleHistoryModule({ prisma } = {}) {
    const cycleHistoryRepository = criarCycleHistoryRepository({ prisma });
    const cycleHistoryService = criarCycleHistoryService({ repository: cycleHistoryRepository });
    const cycleHistoryController = criarCycleHistoryController({ cycleHistoryService });
    return Object.freeze({ cycleHistoryRepository, cycleHistoryService, cycleHistoryController });
}

export { criarCycleHistoryModule };
