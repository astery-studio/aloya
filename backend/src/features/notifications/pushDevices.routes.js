import { AppError } from '../../shared/errors/AppError.js';
import { publico, registrarDispositivo } from './pushDeviceRegistration.js';
import { uuid } from './pushDeviceValidation.js';
import { resolverDestinoPush } from './pushDeviceDestination.js';

export { registrarDispositivo } from './pushDeviceRegistration.js';

export function criarPushDevicesRoutes({ Router, prisma, autenticar, rateLimit }) {
    const rotas = Router();

    rotas.use(autenticar, (_req, res, next) => {
        res.set('Cache-Control', 'no-store');
        next();
    });

    rotas.get('/', async (req, res) => {
        const dispositivos = await prisma.dispositivoPush.findMany({
            where: { usuarioId: req.usuario.id, invalidadoEm: null },
            select: publico,
            orderBy: { atualizadoEm: 'desc' },
            take: 100
        });
        return res.json({ dispositivos });
    });

    rotas.post('/', rateLimit, async (req, res) =>
        res.json({ dispositivo: await registrarDispositivo(prisma, req.usuario, req.body) })
    );

    rotas.delete('/:id', rateLimit, async (req, res) => {
        if (!uuid.test(req.params.id)) throw new AppError('Dispositivo inválido.', 422);
        await prisma.dispositivoPush.updateMany({
            where: { id: req.params.id, usuarioId: req.usuario.id, invalidadoEm: null },
            data: { invalidadoEm: new Date() }
        });
        return res.sendStatus(204);
    });

    rotas.get('/destino/:id', (req, res) => resolverDestinoPush(prisma, req, res));

    return rotas;
}
