import express from 'express';

import { criarCycleParametersController } from '../../../../src/features/settings/controllers/cycleParameters.controller.js';
import { criarCycleParametersRoutes } from '../../../../src/features/settings/routes/cycleParameters.routes.js';
import { criarCycleParametersService } from '../../../../src/features/settings/services/cycleParameters.service.js';
import { criarCycleParametersValidator } from '../../../../src/features/settings/validators/cycleParameters.validator.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

async function comApi(executar) {
    let parametros = {
        duracaoCicloInformada: null,
        duracaoMenstruacaoInformada: null,
        duracaoLuteaInformada: null
    };
    const estado = { recalculos: 0 };
    const prisma = {
        usuario: {
            findUnique: async () => parametros,
            update: async ({ data }) => {
                parametros = data;
                return parametros;
            }
        }
    };
    const service = criarCycleParametersService({
        prisma,
        recalcularPrevisoes: async () => {
            estado.recalculos += 1;
        }
    });
    const controller = criarCycleParametersController({
        service,
        validator: criarCycleParametersValidator()
    });
    const authMiddleware = {
        autenticar(req, _res, next) {
            if (req.headers.authorization !== 'Bearer token') {
                const erro = new Error('Autenticação necessária.');
                erro.status = 401;
                return next(erro);
            }
            req.usuario = { id: 7 };
            return next();
        }
    };
    const app = express();
    app.use(express.json());
    app.use(
        '/users/me',
        criarCycleParametersRoutes({
            Router: express.Router,
            authMiddleware,
            controller,
            rateLimit: (_req, _res, next) => next()
        })
    );
    app.use(tratarErros);
    const servidor = app.listen(0);
    await new Promise((resolve) => servidor.once('listening', resolve));

    try {
        const url = `http://127.0.0.1:${servidor.address().port}/users/me/cycle-parameters`;
        await executar({ url, estado });
    } finally {
        await new Promise((resolve) => servidor.close(resolve));
    }
}

export { comApi };
