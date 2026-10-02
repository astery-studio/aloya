//Registra as rotas autenticadas de cadastro, listagem, edição e remoção de anticoncepcionais.
import { Router } from 'express';

//Recebe autenticação, limites e controller e devolve o roteador protegido.
function criarRotasAnticoncepcionais({
    autenticar,
    controller,
    edicaoRateLimit,
    remocaoRateLimit = edicaoRateLimit
}) {
    const rotas = Router();

    rotas.use(autenticar);
    rotas.get('/', controller.listar);
    rotas.post('/', controller.cadastrar);
    rotas.put('/:id', edicaoRateLimit, controller.editar);
    rotas.delete('/:id', remocaoRateLimit, controller.remover);

    return rotas;
}

export { criarRotasAnticoncepcionais };