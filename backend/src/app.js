import cors from 'cors';
import express from 'express';
import { criarPrisma } from './config/prisma.js';
import { criarContraceptiveController } from './features/contraceptives/contraceptive.controller.js';
import { criarRotasAnticoncepcionais } from './features/contraceptives/contraceptive.routes.js';
import { criarContraceptiveService } from './features/contraceptives/contraceptive.service.js';
import { criarAutenticacao } from './middlewares/authenticate.js';
import { tratarErro } from './middlewares/errorHandler.js';

function criarValidadorOrigem(configuracao = process.env.CORS_ORIGINS ?? '') {
    const origensPermitidas = new Set(configuracao.split(',').map((origem) => origem.trim()).filter(Boolean));
    return (origem, concluir) => concluir(null, !origem || origensPermitidas.has(origem));
}

function criarApp({ prisma = criarPrisma(), relogio, origensCors } = {}) {
    const app = express();
    const service = criarContraceptiveService(prisma, relogio);
    const controller = criarContraceptiveController(service);
    const autenticar = criarAutenticacao(prisma, relogio);

    app.use(cors({ origin: criarValidadorOrigem(origensCors) }));
    app.use(express.json({ limit: '100kb' }));
    app.get('/api/saude', (_requisicao, resposta) => resposta.json({ status: 'ok' }));
    app.use('/api/anticoncepcionais', criarRotasAnticoncepcionais({ autenticar, controller }));
    app.use(tratarErro);
    return app;
}

export { criarApp, criarValidadorOrigem };
