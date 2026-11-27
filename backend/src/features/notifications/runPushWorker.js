import { setTimeout as esperar } from 'node:timers/promises';
import { prisma } from '../../shared/config/prisma.js';
import { planejarExpiracoes } from './notificationExpirations.js';
import { planejarConta, reconciliarAgendamentos } from './notificationPlanner.js';
import { planejarCompartilhadas } from './sharedPushPlanner.js';
import { criarExpoPushProvider } from './pushProvider.js';
import { criarPushWorker } from './pushWorker.js';
import { inicializarCatalogoNotificacao } from './notificationCatalog.service.js';
if (process.env.PUSH_ENABLED !== 'true')
    throw new Error('Configure PUSH_ENABLED=true para iniciar o worker.');
const worker = criarPushWorker({
    prisma,
    provider: criarExpoPushProvider({ token: process.env.EXPO_PUSH_ACCESS_TOKEN })
});
let encerrar = false;
let cursor = 0;
process.once('SIGINT', () => {
    encerrar = true;
});
process.once('SIGTERM', () => {
    encerrar = true;
});
try {
    await inicializarCatalogoNotificacao(prisma);
    while (!encerrar) {
        try {
            const contas = await prisma.usuario.findMany({
                where: {
                    id: { gt: cursor },
                    statusConta: 'ativa',
                    dispositivosPush: { some: { invalidadoEm: null } }
                },
                take: 25,
                orderBy: { id: 'asc' },
                select: { id: true, preferenciaNotificacao: true }
            });
            for (const conta of contas) {
                cursor = conta.id;
                try {
                    const agora = new Date();
                    const [proprias, compartilhadas] = await Promise.all([
                        planejarConta(prisma, conta.id, conta.preferenciaNotificacao, agora),
                        planejarCompartilhadas(
                            prisma,
                            conta.id,
                            conta.preferenciaNotificacao,
                            agora
                        )
                    ]);
                    await reconciliarAgendamentos(prisma, conta.id, [
                        ...proprias,
                        ...compartilhadas
                    ]);
                    await planejarExpiracoes(prisma, conta.id, conta.preferenciaNotificacao, agora);
                } catch {
                    console.error(JSON.stringify({ evento: 'push_planejamento_falhou' }));
                }
            }
            if (contas.length < 25) cursor = 0;
            await worker.processar();
        } catch {
            console.error(JSON.stringify({ evento: 'push_processamento_falhou' }));
        }
        if (!encerrar) await esperar(15000);
    }
} finally {
    await prisma.$disconnect();
}
