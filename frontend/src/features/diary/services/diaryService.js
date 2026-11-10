import { endpoints } from '../../../shared/services/api/endpoints';

const MENSAGEM_CARREGAMENTO = 'Não foi possível carregar o Diário. Tente novamente.';
const MENSAGEM_SALVAMENTO = 'Não foi possível salvar o registro. Tente novamente.';

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

    return Object.freeze({ buscarCatalogo, criarRegistro });
}

export { criarDiaryService, validarCatalogo, validarRegistro };
