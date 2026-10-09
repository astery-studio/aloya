import { Router } from 'express';

function criarRotasUsosAnticoncepcionais({ controller, rateLimit }) {
    const rotas = Router();
    rotas.put('/:id/usos', rateLimit, controller.definirConfirmacao);
    return rotas;
}

export { criarRotasUsosAnticoncepcionais };
