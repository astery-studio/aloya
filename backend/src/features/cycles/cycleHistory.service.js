//Organiza a consulta paginada e transforma os ciclos no contrato público da API.
import {apresentarCicloHistorico} from './cycleHistory.presenter.js';
import {validarConsultaHistorico} from './cycleHistory.validator.js';

//Confere se o repositório possui todas as operações necessárias para montar o histórico.
function validarRepository(repository) {
    if (!repository || typeof repository.listarPagina !== 'function' || typeof repository.contarDoUsuario !== 'function' || typeof repository.contarAteCursor !== 'function') {
        throw new TypeError('O repositório do histórico de ciclos é inválido.');
    }
}

//Confere o identificador recebido da sessão antes de iniciar consultas paralelas.
function validarUsuarioId(usuarioId) {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw new TypeError('O identificador da pessoa usuária é inválido.');
    }
}

//Confere se uma quantidade devolvida pelo repositório pode ser usada na numeração.
function validarQuantidade(quantidade) {
    if (!Number.isSafeInteger(quantidade) || quantidade < 0) {
        throw new TypeError('A quantidade do histórico é inválida.');
    }
}

//Confere se a página interna possui o formato esperado pelo service.
function validarPagina(pagina) {
    if (!pagina || typeof pagina !== 'object' || Array.isArray(pagina) || !Array.isArray(pagina.registros) || typeof pagina.temMais !== 'boolean') {
        throw new TypeError('A página interna do histórico é inválida.');
    }

    if (pagina.temMais && (typeof pagina.proximoCursor !== 'string' || !pagina.proximoCursor)) {
        throw new TypeError('A página interna do histórico é inválida.');
    }

    if (!pagina.temMais && pagina.proximoCursor !== null) {
        throw new TypeError('A página interna do histórico é inválida.');
    }

    if (pagina.temMais && pagina.registros.length === 0) {
        throw new TypeError('A página interna do histórico é inválida.');
    }
}

//Cria as operações de negócio responsáveis pela leitura do histórico.
function criarCycleHistoryService({repository} = {}) {
    validarRepository(repository);

    //Valida a consulta, busca os dados necessários e devolve uma página pronta para a API.
    async function listarHistorico({usuarioId, consulta = {}} = {}) {
        validarUsuarioId(usuarioId);

        const {limite, cursor} = validarConsultaHistorico(consulta);

        const [pagina, quantidadeCiclos, quantidadePercorrida] = await Promise.all([
            repository.listarPagina({
                usuarioId,
                limite,
                cursor
            }),
            repository.contarDoUsuario(usuarioId),
            repository.contarAteCursor(usuarioId, cursor)
        ]);

        validarPagina(pagina);
        validarQuantidade(quantidadeCiclos);
        validarQuantidade(quantidadePercorrida);

        if (quantidadePercorrida > quantidadeCiclos || quantidadePercorrida + pagina.registros.length > quantidadeCiclos) {
            throw new TypeError('A posição da página no histórico é inconsistente.');
        }

        const numeroInicial = quantidadeCiclos - quantidadePercorrida;
        const ciclos = pagina.registros.map((registro, indice) => apresentarCicloHistorico(registro, numeroInicial - indice));

        return {
            ciclos,
            quantidadeCiclos,
            paginacao: {
                limite,
                temMais: pagina.temMais,
                proximoCursor: pagina.proximoCursor
            }
        };
    }

    return {
        listarHistorico
    };
}

export {criarCycleHistoryService};