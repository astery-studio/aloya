//Configura e inicia a API HTTP da aplicação.
import express from 'express';
import { criarCycleRegistrationRoutes } from '../../features/cycles/routes/cycleRegistration.routes.js';
import helmet from 'helmet';

import { env } from '../config/env.js';

import { criarContainer } from '../config/container.js';

import { criarAuthRoutes } from '../../features/auth/routes/auth.routes.js';

import { criarRotasAnticoncepcionais } from '../../features/contraceptives/routes/contraceptive.routes.js';

import { criarCalendarRoutes } from '../../features/calendar/routes/calendar.routes.js';

import { criarCycleHistoryRoutes } from '../../features/cycles/routes/cycleHistory.routes.js';

import { criarCycleRemovalRoutes } from '../../features/cycles/routes/cycleRemoval.routes.js';
import { criarCycleEditRoutes } from '../../features/cycles/routes/cycleEdit.routes.js';

import { criarPredictionRoutes } from '../../features/cycles/routes/prediction.routes.js';

import { criarPermissionCategoryRoutes } from '../../features/support-network/routes/permissionCategory.routes.js';

import { criarAccountRoutes } from '../../features/settings/routes/account.routes.js';
import { criarCycleParametersRoutes } from '../../features/settings/routes/cycleParameters.routes.js';

import { criarLogoutRoutes } from '../../features/auth/routes/logout.routes.js';

import { rotaNaoEncontrada, tratarErros } from '../middleware/error.middleware.js';

const app = express();
const container = criarContainer();

//O Cloudflare Tunnel conecta ao backend por localhost; só confiamos nesse proxy.
app.set('trust proxy', 'loopback');
app.disable('x-powered-by');
app.use(helmet());

app.use(
    express.json({
        limit: '32kb',
        strict: true
    })
);

app.use(
    '/auth',
    criarLogoutRoutes({
        Router: express.Router,
        authMiddleware: container.authMiddleware,
        logoutController: container.logoutController
    })
);

app.use(
    '/auth',
    criarAuthRoutes({
        authController: container.authController,
        passwordRecoveryController: container.passwordRecoveryController,
        authMiddleware: container.authMiddleware,
        cadastroRateLimit: container.cadastroRateLimit,
        emailRateLimit: container.emailRateLimit,
        loginRateLimit: container.loginRateLimit,
        contaLoginRateLimit: container.contaLoginRateLimit
    })
);

app.use(
    '/users',
    criarAccountRoutes({
        Router: express.Router,
        accountController: container.accountController,
        authMiddleware: container.authMiddleware,
        configuracoesContaRateLimit: container.configuracoesContaRateLimit,
        alteracaoSenhaRateLimit: container.alteracaoSenhaRateLimit,
        accountDeletionController: container.accountDeletionController,
        exclusaoContaRateLimit: container.exclusaoContaRateLimit
    })
);

app.use(
    '/users/me',
    criarCycleParametersRoutes({
        Router: express.Router,
        authMiddleware: container.authMiddleware,
        controller: container.cycleParametersController,
        rateLimit: container.configuracoesContaRateLimit
    })
);

app.use(
    '/api/anticoncepcionais',
    criarRotasAnticoncepcionais({
        autenticar: container.authMiddleware.autenticar,
        controller: container.contraceptiveController,
        usoController: container.contraceptiveUsageController,
        edicaoRateLimit: container.edicaoAnticoncepcionalRateLimit,
        remocaoRateLimit: container.remocaoAnticoncepcionalRateLimit
    })
);

app.use(
    '/api/cycles',
    criarCalendarRoutes({
        Router: express.Router,
        authMiddleware: container.authMiddleware,
        calendarController: container.calendarController
    })
);

app.use(
    '/api/cycles',
    criarCycleHistoryRoutes({
        Router: express.Router,
        authMiddleware: container.authMiddleware,
        cycleHistoryController: container.cycleHistoryController
    })
);

app.use(
    '/api/cycles',
    criarCycleRemovalRoutes({
        Router: express.Router,
        authMiddleware: container.authMiddleware,
        cycleRemovalController: container.cycleRemovalController
    })
);

app.use(
    '/api/cycles',
    criarCycleEditRoutes({
        Router: express.Router,
        authMiddleware: container.authMiddleware,
        controller: container.cycleEditController
    })
);

app.use(
    '/cycles',
    criarPredictionRoutes({
        Router: express.Router,
        autenticar: container.authMiddleware.autenticar,
        controller: container.predictionController
    })
);

app.use(
    '/support-network',
    criarPermissionCategoryRoutes({
        Router: express.Router,
        authMiddleware: container.authMiddleware,
        parentalConsentMiddleware: container.parentalConsentMiddleware,
        permissionCategoryRateLimit: container.permissionCategoryRateLimit,
        permissionCategoryUpdateRateLimit: container.permissionCategoryUpdateRateLimit,
        permissionCategoryDeletionRateLimit: container.permissionCategoryDeletionRateLimit,
        permissionCategoryController: container.permissionCategoryController,
        permissionCategoryDeletionController: container.permissionCategoryDeletionController
    })
);

app.use(
    '/api/cycles',
    criarCycleRegistrationRoutes({
        Router: express.Router,
        authMiddleware: container.authMiddleware,
        controller: container.cycleRegistrationController
    })
);

app.use(rotaNaoEncontrada);
app.use(tratarErros);

const servidor = app.listen(env.port);

servidor.once('listening', () => {
    console.log(`API executando na porta ${env.port}.`);
});

servidor.once('error', (erro) => {
    if (erro.code === 'EADDRINUSE') {
        console.error(`Não foi possível iniciar a API: a porta ${env.port} já está em uso.`);
        console.error(
            'Encerre o processo que está usando essa porta ou defina outra porta pela variável PORT.'
        );
    } else {
        console.error('Não foi possível iniciar a API.', erro);
    }

    process.exitCode = 1;
});
