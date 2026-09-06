const express = require('express');
const helmet = require('helmet');

const { env } = require('./config/env');
const { criarContainer } = require('./config/container');

const {
    criarAuthRoutes
} = require('./routes/auth.routes');

const {
    rotaNaoEncontrada,
    tratarErros
} = require('./middlewares/error.middleware');

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
    criarAuthRoutes({
        authController: container.authController,
        authMiddleware: container.authMiddleware
    })
);

app.use(rotaNaoEncontrada);
app.use(tratarErros);

app.listen(env.port, () => {
    console.log(`API executando na porta ${env.port}.`);
});