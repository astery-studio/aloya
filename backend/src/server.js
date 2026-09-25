import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { criarContainer } from './config/container.js';
import { criarAuthRoutes } from './routes/auth.routes.js';
import { criarAccountRoutes } from './routes/account.routes.js';
import { criarLogoutRoutes } from './routes/logout.routes.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/error.middleware.js';

const app = express();
const container = criarContainer();

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
        passwordRecoveryController:
            container.passwordRecoveryController,
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

app.use(rotaNaoEncontrada);
app.use(tratarErros);

app.listen(env.port, () => {
    console.log(`API executando na porta ${env.port}.`);
});
