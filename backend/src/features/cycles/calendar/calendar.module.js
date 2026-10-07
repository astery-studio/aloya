//Compõe as camadas do calendário a partir de uma única dependência do Prisma.
import { criarCalendarController } from './calendar.controller.js';
import { criarCurrentCycleController } from './calendar.current.controller.js';
import { criarCalendarRepository } from './calendar.repository.js';
import { criarCalendarService } from './calendar.service.js';
import { criarCurrentCycleService } from './calendar.current.service.js';

function criarCalendarModule({
    prisma,
    agora
} = {}) {
    const calendarRepository = criarCalendarRepository({
        prisma
    });
    const calendarService = criarCalendarService({
        repository: calendarRepository
    });
    const currentCycleService = criarCurrentCycleService({
        repository: calendarRepository,
        agora
    });
    const calendarController = criarCalendarController({
        calendarService
    });
    const currentCycleController = criarCurrentCycleController({
        currentCycleService
    });

    return Object.freeze({
        calendarRepository,
        calendarService,
        currentCycleService,
        calendarController,
        currentCycleController
    });
}

export { criarCalendarModule };