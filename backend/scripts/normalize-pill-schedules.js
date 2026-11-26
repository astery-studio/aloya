import { prisma } from '../src/shared/config/prisma.js';
import { normalizarHorariosPilula } from '../src/features/contraceptives/services/normalizePillSchedule.service.js';

try {
    const total = await normalizarHorariosPilula(prisma);
    console.log(`Cadastros de pílula normalizados: ${total}.`);
} finally {
    await prisma.$disconnect();
}
