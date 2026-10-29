import { endpoints } from '../../../shared/services/api/endpoints';

const MENSAGEM_SUCESSO = 'Registro de menstruação excluído com sucesso.';
const FORMATO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

function validarCicloId(cicloId) {
    const texto = typeof cicloId === 'number' ? String(cicloId) : cicloId;

    if (
        typeof texto !== 'string' ||
        !/^[1-9]\d*$/.test(texto) ||
        !Number.isSafeInteger(Number(texto))
    ) {
        throw new TypeError('O ciclo selecionado é inválido.');
    }

    return texto;
}

function validarData(data) {
    const partes = typeof data === 'string' ? FORMATO_DATA.exec(data) : null;

    if (!partes) {
        throw new TypeError('A data do registro é inválida.');
    }

    const [ano, mes, dia] = partes.slice(1).map(Number);
    const dataUtc = new Date(Date.UTC(ano, mes - 1, dia));

    if (
        ano < 1900 ||
        dataUtc.getUTCFullYear() !== ano ||
        dataUtc.getUTCMonth() !== mes - 1 ||
        dataUtc.getUTCDate() !== dia
    ) {
        throw new TypeError('A data do registro é inválida.');
    }

    return data;
}

function validarResposta(resposta) {
    const valida =
        resposta !== null &&
        typeof resposta === 'object' &&
        !Array.isArray(resposta) &&
        resposta.mensagem === MENSAGEM_SUCESSO &&
        typeof resposta.cicloRemovido === 'boolean' &&
        Number.isSafeInteger(resposta.quantidadeCiclos) &&
        resposta.quantidadeCiclos >= 0 &&
        resposta.possuiCiclos === resposta.quantidadeCiclos > 0;

    if (!valida) {
        const erro = new Error('Não foi possível interpretar a resposta da exclusão.');
        erro.codigo = 'RESPOSTA_REMOCAO_INVALIDA';
        erro.mensagemUsuario = erro.message;
        throw erro;
    }

    return Object.freeze({
        mensagem: resposta.mensagem,
        cicloRemovido: resposta.cicloRemovido,
        quantidadeCiclos: resposta.quantidadeCiclos,
        possuiCiclos: resposta.possuiCiclos
    });
}

function criarCycleRemovalService({ requisicaoAutenticada } = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço de remoção de ciclos.');
    }

    async function executar(caminho, signal) {
        const resposta = await requisicaoAutenticada({
            caminho,
            metodo: 'DELETE',
            ...(signal ? { signal } : {})
        });

        return validarResposta(resposta);
    }

    async function removerDia({ cicloId, data, signal } = {}) {
        const id = validarCicloId(cicloId);
        const dia = validarData(data);
        const caminho = `${endpoints.historicoCiclos}/${id}/days/${dia}`;
        return executar(caminho, signal);
    }

    async function excluirCiclo({ cicloId, signal } = {}) {
        const id = validarCicloId(cicloId);
        return executar(`${endpoints.historicoCiclos}/${id}`, signal);
    }

    return Object.freeze({ removerDia, excluirCiclo });
}

export { MENSAGEM_SUCESSO, criarCycleRemovalService, validarCicloId, validarData, validarResposta };
