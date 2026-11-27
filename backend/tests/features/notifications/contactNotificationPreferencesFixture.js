import express from 'express';
import { criarNotificationPreferencesRoutes } from '../../../src/features/notifications/notificationPreferences.routes.js';
import { criarNotificationPreferencesService } from '../../../src/features/notifications/notificationPreferences.service.js';
import { tratarErros } from '../../../src/shared/middleware/error.middleware.js';
import { criarBanco } from './pushWorkerFixture.js';

export async function prepararApiContato(t) {
    const prisma = await criarBanco(t);
    const service = criarNotificationPreferencesService(prisma);
    await prisma.usuario.update({ where: { id: 2 }, data: { papel: 'contato_apoio' } });
    const categoria = await prisma.categoriaPermissao.create({
        data: {
            titularId: 1,
            nome: 'Rede',
            nomeNormalizado: 'rede',
            conjuntoDadosVisiveis: ['geral.dicas', 'energia.sono', 'geral.anticoncepcionais']
        }
    });
    await prisma.vinculoRedeApoio.create({
        data: {
            titularId: 1,
            contatoId: 2,
            categoriaId: categoria.id,
            status: 'ativo',
            emailConvidado: 'conta-2@example.com',
            permissoesIndividuais: ['corpo.pele', 'geral.historico_ciclo']
        }
    });

    const app = express();
    app.use(express.json());
    app.use(
        criarNotificationPreferencesRoutes({
            Router: express.Router,
            service,
            rateLimit: (_req, _res, next) => next(),
            autenticar: async (req, res, next) => {
                const id = Number(req.get('authorization'));
                const usuario = await prisma.usuario.findUnique({ where: { id } });
                if (!usuario) return res.sendStatus(401);
                req.usuario = usuario;
                return next();
            }
        })
    );
    app.use(tratarErros);
    const server = app.listen(0, '127.0.0.1');
    t.after(() => new Promise((resolve) => server.close(resolve)));
    await new Promise((resolve, reject) => server.once('listening', resolve).once('error', reject));
    const chamar = (path, id, dados, method = dados ? 'PATCH' : 'GET') =>
        fetch(`http://127.0.0.1:${server.address().port}${path}`, {
            method,
            headers: { authorization: String(id), 'content-type': 'application/json' },
            body: dados && JSON.stringify(dados)
        });

    return { prisma, service, categoria, chamar };
}
