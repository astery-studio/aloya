//Registra as rotas autenticadas de cadastro, listagem e edição de anticoncepcionais.
import { Router } from 'express';

//Recebe autenticação, limite de edição e controller e devolve o roteador protegido.
function criarRotasAnticoncepcionais({autenticar, controller, edicaoRateLimit}) {
    const rotas = Router();

    rotas.use(autenticar);
    rotas.get('/', controller.listar);
    rotas.post('/', controller.cadastrar);
    rotas.put('/:id', edicaoRateLimit, controller.editar);

    return rotas;
}

export { criarRotasAnticoncepcionais };