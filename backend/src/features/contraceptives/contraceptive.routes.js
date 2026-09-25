import { Router } from 'express';

function criarRotasAnticoncepcionais({ autenticar, controller }) {
    const rotas = Router();
    rotas.use(autenticar);
    rotas.get('/', controller.listar);
    rotas.post('/', controller.cadastrar);
    return rotas;
}

export { criarRotasAnticoncepcionais };
