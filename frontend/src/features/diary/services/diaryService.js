import { endpoints } from '../../../shared/services/api/endpoints';
import { decomporData } from '../utils/diaryDate';

const MENSAGEM_CARREGAMENTO = 'Não foi possível carregar o Diário. Tente novamente.';
const MENSAGEM_SALVAMENTO = 'Não foi possível salvar o registro. Tente novamente.';
const MENSAGEM_HISTORICO = 'Não foi possível carregar seu histórico do Diário. Tente novamente.';
const MENSAGEM_DETALHE = 'Não foi possível carregar este registro. Tente novamente.';
const MENSAGEM_EXCLUSAO =
    'Ocorreu um erro ao excluir registro. Verifique sua conexão e tente novamente.';
const FASES = new Set(['menstrual', 'folicular', 'ovulatoria', 'lutea']);
const CATEGORIAS_SENSIVEIS_NO_RESUMO = new Set([
    'atividade_sexual',
    'autoerotismo',
    'desejo_libido'
]);
const LIMITE_PADRAO = 20;
const TAMANHO_MAXIMO_CURSOR = 4096;
const FASES_RESUMO = Object.freeze({
    menstruacao: 'menstrual',
    menstrual: 'menstrual',
    folicular: 'folicular',
    ovulacao: 'ovulatoria',
    ovulatoria: 'ovulatoria',
    lutea: 'lutea'
});

function erroDeContrato(mensagem, codigo) {
    const erro = new Error(mensagem);
    erro.codigo = codigo;
    erro.mensagemUsuario = mensagem;
    return erro;
}

function validarCatalogo(resposta) {
    if (
        !Number.isSafeInteger(resposta?.versao) ||
        resposta.versao < 0 ||
        !Array.isArray(resposta.macrocategorias)
    ) {
        throw erroDeContrato(MENSAGEM_CARREGAMENTO, 'RESPOSTA_CATALOGO_DIARIO_INVALIDA');
    }
    return resposta;
}

function validarRegistro(resposta) {
    if (
        !Number.isSafeInteger(resposta?.id) ||
        resposta.id <= 0 ||
        typeof resposta.data !== 'string' ||
        !Array.isArray(resposta.categorias)
    ) {
        throw erroDeContrato(MENSAGEM_SALVAMENTO, 'RESPOSTA_REGISTRO_DIARIO_INVALIDA');
    }
    return resposta;
}

function ehObjetoSimples(valor) {
    return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

function validarId(id) {
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new TypeError('O identificador do registro é inválido.');
    }
    return id;
}

// Valida a versão usada pelo If-Match antes de qualquer chamada de exclusão.
function validarVersao(versao) {
    if (!Number.isSafeInteger(versao) || versao < 0) {
        throw new TypeError('A versão do registro é inválida.');
    }
    return versao;
}

// Restringe cursores ao formato e ao tamanho aceitos pelo contrato paginado.
function validarCursor(cursor) {
    if (
        cursor !== null &&
        (typeof cursor !== 'string' ||
            !cursor ||
            cursor.length > TAMANHO_MAXIMO_CURSOR ||
            !/^[A-Za-z0-9_-]+$/u.test(cursor))
    ) {
        throw new TypeError('O cursor do histórico é inválido.');
    }
    return cursor;
}

// Confere se um destaque do resumo é seguro e não pertence à Saúde Sexual.
function validarPrincipal(item) {
    return (
        ehObjetoSimples(item) &&
        typeof item.categoriaId === 'string' &&
        item.categoriaId.length > 0 &&
        !CATEGORIAS_SENSIVEIS_NO_RESUMO.has(item.categoriaId) &&
        typeof item.categoria === 'string' &&
        item.categoria.trim().length > 0 &&
        typeof item.macrocategoriaId === 'string' &&
        item.macrocategoriaId.length > 0 &&
        typeof item.valor === 'string' &&
        item.valor.trim().length > 0
    );
}

// Normaliza e congela um resumo retornado pelo presenter seguro do backend.
function normalizarResumoRegistro(item) {
    const valido =
        ehObjetoSimples(item) &&
        Number.isSafeInteger(item.id) &&
        item.id > 0 &&
        Boolean(decomporData(item.data)) &&
        (item.fase === null || FASES.has(item.fase)) &&
        Array.isArray(item.principais) &&
        item.principais.length <= 3 &&
        item.principais.every(validarPrincipal) &&
        Number.isSafeInteger(item.maisQuantidade) &&
        item.maisQuantidade >= 0 &&
        (item.trechoAnotacao === null || typeof item.trechoAnotacao === 'string') &&
        Number.isSafeInteger(item.versao) &&
        item.versao >= 0;

    if (!valido) throw erroDeContrato(MENSAGEM_HISTORICO, 'RESPOSTA_HISTORICO_DIARIO_INVALIDA');

    return Object.freeze({
        id: item.id,
        data: item.data,
        fase: item.fase,
        principais: Object.freeze(
            item.principais.map((principal) =>
                Object.freeze({
                    categoriaId: principal.categoriaId,
                    categoria: principal.categoria.trim(),
                    valor: principal.valor.trim(),
                    macrocategoriaId: principal.macrocategoriaId
                })
            )
        ),
        maisQuantidade: item.maisQuantidade,
        trechoAnotacao: item.trechoAnotacao?.trim() || null,
        versao: item.versao,
        atualizadoEm: typeof item.atualizadoEm === 'string' ? item.atualizadoEm : null
    });
}

// Valida e congela uma página do histórico baseada em cursor.
function validarPaginaHistorico(resposta) {
    if (
        !ehObjetoSimples(resposta) ||
        !Array.isArray(resposta.itens) ||
        resposta.itens.length > 50 ||
        (resposta.proximoCursor !== null && typeof resposta.proximoCursor !== 'string')
    ) {
        throw erroDeContrato(MENSAGEM_HISTORICO, 'RESPOSTA_HISTORICO_DIARIO_INVALIDA');
    }
    const proximoCursor = validarCursor(resposta.proximoCursor);
    return Object.freeze({
        itens: Object.freeze(resposta.itens.map(normalizarResumoRegistro)),
        proximoCursor
    });
}

// Confere a estrutura de uma categoria autorizada do endpoint de detalhe.
function validarCategoriaDetalhe(categoria) {
    if (
        !ehObjetoSimples(categoria) ||
        typeof categoria.id !== 'string' ||
        !categoria.id ||
        typeof categoria.macrocategoria !== 'string' ||
        !categoria.macrocategoria.trim() ||
        typeof categoria.nome !== 'string' ||
        !categoria.nome.trim()
    ) {
        return false;
    }
    if (categoria.opcoes !== undefined) {
        if (
            !Array.isArray(categoria.opcoes) ||
            !categoria.opcoes.every(
                (opcao) =>
                    ehObjetoSimples(opcao) &&
                    typeof opcao.id === 'string' &&
                    typeof opcao.grupo === 'string' &&
                    typeof opcao.nome === 'string' &&
                    opcao.nome.trim()
            )
        ) {
            return false;
        }
    }
    return true;
}

// Valida o detalhe completo antes de expô-lo aos componentes.
function validarDetalhe(resposta) {
    const cicloValido =
        resposta?.ciclo === null ||
        (ehObjetoSimples(resposta?.ciclo) &&
            Number.isSafeInteger(resposta.ciclo.dia) &&
            resposta.ciclo.dia > 0 &&
            Number.isSafeInteger(resposta.ciclo.numero) &&
            resposta.ciclo.numero > 0);
    const valido =
        ehObjetoSimples(resposta) &&
        Number.isSafeInteger(resposta.id) &&
        resposta.id > 0 &&
        Boolean(decomporData(resposta.data)) &&
        (resposta.fase === null || FASES.has(resposta.fase)) &&
        Number.isSafeInteger(resposta.versao) &&
        resposta.versao >= 0 &&
        cicloValido &&
        Array.isArray(resposta.categorias) &&
        resposta.categorias.every(validarCategoriaDetalhe);
    if (!valido) throw erroDeContrato(MENSAGEM_DETALHE, 'RESPOSTA_DETALHE_DIARIO_INVALIDA');
    return resposta;
}

// Produz o caminho de um registro somente após validar seu identificador.
function criarCaminhoRegistro(id) {
    return `${endpoints.registrosDiario}/${validarId(id)}`;
}

// Valida a agregação não sensível usada para personalizar o cartão superior.
function validarResumoDiario(resposta, faseEsperada) {
    const valido =
        ehObjetoSimples(resposta) &&
        resposta.fase === faseEsperada &&
        Number.isSafeInteger(resposta.diasRegistrados) &&
        resposta.diasRegistrados >= 0 &&
        Number.isSafeInteger(resposta.quantidadeRegistrosFase) &&
        resposta.quantidadeRegistrosFase >= 0 &&
        typeof resposta.informacoesSuficientes === 'boolean' &&
        Array.isArray(resposta.destaques) &&
        resposta.destaques.length <= 3 &&
        resposta.destaques.every(
            (item) =>
                ehObjetoSimples(item) &&
                typeof item.categoriaId === 'string' &&
                !CATEGORIAS_SENSIVEIS_NO_RESUMO.has(item.categoriaId) &&
                (item.grupo === undefined ||
                    item.grupo === null ||
                    typeof item.grupo === 'string') &&
                typeof item.valor === 'string' &&
                item.valor.trim().length > 0 &&
                Number.isSafeInteger(item.ocorrencias) &&
                item.ocorrencias >= 2
        ) &&
        (!resposta.informacoesSuficientes || resposta.destaques.length > 0);
    if (!valido) throw erroDeContrato(MENSAGEM_HISTORICO, 'RESPOSTA_RESUMO_DIARIO_INVALIDA');
    return Object.freeze({
        ...resposta,
        destaques: Object.freeze(
            resposta.destaques.map((item) =>
                Object.freeze({
                    ...item,
                    grupo: typeof item.grupo === 'string' ? item.grupo.trim() : null,
                    valor: item.valor.trim()
                })
            )
        )
    });
}

function criarDiaryService({ requisicaoAutenticada } = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço do Diário.');
    }

    async function buscarCatalogo({ signal } = {}) {
        const resposta = await requisicaoAutenticada({
            metodo: 'GET',
            caminho: endpoints.catalogoDiario,
            ...(signal ? { signal } : {})
        });
        return validarCatalogo(resposta);
    }

    async function criarRegistro(dados) {
        const resposta = await requisicaoAutenticada({
            metodo: 'POST',
            caminho: endpoints.registrosDiario,
            corpo: dados
        });
        return validarRegistro(resposta);
    }

    async function listarHistorico({ limite = LIMITE_PADRAO, cursor = null, signal } = {}) {
        if (!Number.isSafeInteger(limite) || limite < 1 || limite > 50) {
            throw new TypeError('O limite do histórico deve estar entre 1 e 50.');
        }
        validarCursor(cursor);
        const consulta = new URLSearchParams({ limite: String(limite) });
        if (cursor) consulta.set('cursor', cursor);
        const resposta = await requisicaoAutenticada({
            metodo: 'GET',
            caminho: `${endpoints.registrosDiario}?${consulta.toString()}`,
            ...(signal ? { signal } : {})
        });
        return validarPaginaHistorico(resposta);
    }

    async function buscarResumo(fase, { signal } = {}) {
        const faseApi = FASES_RESUMO[fase];
        if (!faseApi) throw new TypeError('A fase do resumo é inválida.');
        const resposta = await requisicaoAutenticada({
            metodo: 'GET',
            caminho: `${endpoints.resumoDiario}?fase=${encodeURIComponent(faseApi)}`,
            ...(signal ? { signal } : {})
        });
        return validarResumoDiario(resposta, faseApi);
    }

    async function buscarDetalhe(id, { signal } = {}) {
        const resposta = await requisicaoAutenticada({
            metodo: 'GET',
            caminho: criarCaminhoRegistro(id),
            ...(signal ? { signal } : {})
        });
        return validarDetalhe(resposta);
    }

    async function excluirRegistro(id, versao, { signal } = {}) {
        const caminho = criarCaminhoRegistro(id);
        const versaoValidada = validarVersao(versao);
        try {
            await requisicaoAutenticada({
                metodo: 'DELETE',
                caminho,
                ifMatch: `"${versaoValidada}"`,
                ...(signal ? { signal } : {})
            });
        } catch (erro) {
            if (erro?.name === 'AbortError' || erro?.status === 401 || erro?.status === 409) {
                throw erro;
            }
            const seguro = new Error(MENSAGEM_EXCLUSAO);
            seguro.codigo = erro?.codigo || 'ERRO_EXCLUSAO_DIARIO';
            seguro.status = erro?.status;
            seguro.mensagemUsuario = MENSAGEM_EXCLUSAO;
            throw seguro;
        }
        return true;
    }

    return Object.freeze({
        buscarCatalogo,
        criarRegistro,
        buscarResumo,
        listarHistorico,
        buscarDetalhe,
        excluirRegistro
    });
}

export {
    criarDiaryService,
    normalizarResumoRegistro,
    validarCatalogo,
    validarDetalhe,
    validarPaginaHistorico,
    validarPrincipal,
    validarRegistro,
    validarResumoDiario
};
