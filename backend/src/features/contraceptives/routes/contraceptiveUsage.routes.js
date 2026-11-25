import { Router } from 'express';

function criarRotasUsosAnticoncepcionais({ controller, rateLimit }) {
    const rotas = Router();
    rotas.put('/:id/usos', rateLimit, controller.definirConfirmacao);
    rotas.patch('/:id/usos/:usoId', rateLimit, controller.corrigirHistorico);
    return rotas;
}

export { criarRotasUsosAnticoncepcionais };
