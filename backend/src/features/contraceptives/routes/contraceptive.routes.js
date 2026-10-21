//Registra as rotas autenticadas de cadastro, listagem, edição e remoção de anticoncepcionais.
import { Router } from 'express';
import { criarRotasUsosAnticoncepcionais } from './contraceptiveUsage.routes.js';

//Recebe autenticação, limites e controller e devolve o roteador protegido.
function criarRotasAnticoncepcionais({
    autenticar,
    controller,
    usoController,
    edicaoRateLimit,
    usoRateLimit = edicaoRateLimit,
    remocaoRateLimit = edicaoRateLimit
}) {
    const rotas = Router();

    rotas.use(autenticar);
    if (usoController) {
        rotas.use(criarRotasUsosAnticoncepcionais({ controller: usoController, rateLimit: usoRateLimit }));
    }
    rotas.get('/', controller.listar);
    rotas.post('/', controller.cadastrar);
    rotas.put('/:id', edicaoRateLimit, controller.editar);
    rotas.delete('/:id', remocaoRateLimit, controller.remover);

    return rotas;
}

export { criarRotasAnticoncepcionais };
