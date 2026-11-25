import { Router } from 'express';

function criarRotasUsosAnticoncepcionais({ controller, rateLimit }) {
    const rotas = Router();
    rotas.put('/:id/usos', rateLimit, controller.definirConfirmacao);
    rotas.patch('/:id/usos', rateLimit, controller.corrigirHistorico);
    rotas.patch('/:id/usos/:usoId', rateLimit, controller.corrigirHistorico);
    rotas.delete('/:id/usos/:usoId', rateLimit, controller.apagarRegistroHistorico);
    return rotas;
}

export { criarRotasUsosAnticoncepcionais };
