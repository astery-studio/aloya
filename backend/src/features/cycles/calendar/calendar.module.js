//Compõe as camadas do calendário a partir de uma única dependência do Prisma.
import { criarCalendarController } from './calendar.controller.js';
import { criarCalendarRepository } from './calendar.repository.js';
import { criarCalendarService } from './calendar.service.js';

function criarCalendarModule({prisma} = {}) {
    const calendarRepository = criarCalendarRepository({
        prisma
    });
    const calendarService = criarCalendarService({
        repository: calendarRepository
    });
    const calendarController = criarCalendarController({
        calendarService
    });

    return Object.freeze({
        calendarRepository,
        calendarService,
        calendarController
    });
}

export { criarCalendarModule };