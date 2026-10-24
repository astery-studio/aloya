//Centraliza as operações autenticadas de listagem, cadastro, edição e remoção de anticoncepcionais.
import { endpoints } from '../../../shared/services/api/endpoints';
import { horarioValido } from '../../../shared/utils/validation/isValidTime';
import { partesDaDataUso } from '../utils/usageHistory';
import {
    normalizarAcompanhamentoAnticoncepcional,
    normalizarUsoAcompanhamento
} from '../utils/contraceptiveTrackingAdapter';

//Recebe um registro da API e retorna o formato imutável utilizado pelas telas.
function normalizarAnticoncepcional(registro) {
    const possuiProgramacao = registro.tipo !== 'diu_hormonal';

    return Object.freeze({
        id: String(registro.id),
        nome: registro.nome,
        tipo: registro.tipo,
        intensidadeAlerta: registro.intensidadeAlerta,
        dataValidade: registro.dataValidade,
        programacao: possuiProgramacao ? Object.freeze({
            horarios: Object.freeze([...(registro.horarios ?? [])]),
            frequenciaId: registro.frequenciaId,
            dataPrimeiroUso: registro.dataPrimeiroUso,
            periodosPausa: Object.freeze([...(registro.periodosPausa ?? [])]),
            proximoUsoPrevisto: registro.proximoUsoPrevisto
        }) : null
    });
}

//Recebe um anticoncepcional e retorna somente os campos aceitos pelo backend.
function criarCorpoCadastro(anticoncepcional) {
    return {
        nome: anticoncepcional.nome,
        tipo: anticoncepcional.tipo,
        intensidadeAlerta: anticoncepcional.intensidadeAlerta,
        horarios: anticoncepcional.programacao?.horarios ?? [],
        frequenciaId: anticoncepcional.programacao?.frequenciaId ?? null,
        dataPrimeiroUso: anticoncepcional.programacao?.dataPrimeiroUso ?? null,
        dataValidade: anticoncepcional.dataValidade ?? null
    };
}

//Recebe um identificador e retorna um caminho seguro para acessar somente aquele anticoncepcional.
function criarCaminhoAnticoncepcional(id) {
    const idTexto = typeof id === 'number' ? String(id) : id;
    const idNumerico = Number(idTexto);

    if (typeof idTexto !== 'string' || !/^[1-9]\d*$/.test(idTexto) || !Number.isSafeInteger(idNumerico)) {
        throw new Error('O identificador do anticoncepcional é inválido.');
    }

    return `${endpoints.anticoncepcionais}/${idTexto}`;
}

function normalizarAnticoncepcionalAcompanhamento(registro) {
    return normalizarAcompanhamentoAnticoncepcional(registro, normalizarAnticoncepcional(registro));
}

function validarFusoHorario(fusoHorario) {
    if (fusoHorario !== undefined && (typeof fusoHorario !== 'string' || !fusoHorario.trim())) {
        throw new Error('O fuso horário do uso é inválido.');
    }
}

function criarCorpoUso({ data, horario, confirmar, fusoHorario }) {
    if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data) || !partesDaDataUso(data)) {
        throw new Error('A data programada do uso é inválida.');
    }
    if (!horarioValido(horario)) {
        throw new Error('O horário programado do uso é inválido.');
    }
    if (typeof confirmar !== 'boolean') {
        throw new Error('A confirmação do uso é inválida.');
    }
    validarFusoHorario(fusoHorario);
    return { data, horario, confirmar, ...(fusoHorario !== undefined ? { fusoHorario } : {}) };
}

//Recebe a função autenticada e retorna as operações disponíveis para anticoncepcionais.
function criarContraceptiveService({ requisicaoAutenticada }) {
    // A listagem legada permanece só de ativos; HU-019 pode solicitar os removidos.
    async function listar({ signal, incluirRemovidos = false, fusoHorario } = {}) {
        validarFusoHorario(fusoHorario);
        const parametros = [
            ...(incluirRemovidos === true ? ['incluirRemovidos=true'] : []),
            ...(fusoHorario !== undefined ? [`fusoHorario=${encodeURIComponent(fusoHorario)}`] : [])
        ];
        const resposta = await requisicaoAutenticada({
            caminho: `${endpoints.anticoncepcionais}${parametros.length ? `?${parametros.join('&')}` : ''}`,
            ...(signal ? { signal } : {})
        });

        return (resposta.anticoncepcionais ?? []).map(normalizarAnticoncepcionalAcompanhamento);
    }

    //Cadastra um anticoncepcional enviando somente os campos permitidos.
    async function cadastrar(anticoncepcional) {
        const resposta = await requisicaoAutenticada({
            metodo: 'POST',
            caminho: endpoints.anticoncepcionais,
            corpo: criarCorpoCadastro(anticoncepcional)
        });

        return normalizarAnticoncepcional(resposta.anticoncepcional);
    }

    //Edita um anticoncepcional da pessoa autenticada e retorna o registro atualizado.
    async function editar(id, anticoncepcional) {
        const resposta = await requisicaoAutenticada({
            metodo: 'PUT',
            caminho: criarCaminhoAnticoncepcional(id),
            corpo: criarCorpoCadastro(anticoncepcional)
        });

        return normalizarAnticoncepcional(resposta.anticoncepcional);
    }

    //Remove o anticoncepcional identificado sem enviar corpo ou informações da conta.
    async function remover(id) {
        const caminho = criarCaminhoAnticoncepcional(id);

        await requisicaoAutenticada({
            metodo: 'DELETE',
            caminho
        });

        return Object.freeze({
            id: String(id)
        });
    }

    // Confirma/desmarca somente o horário programado identificado, com timestamp do servidor.
    async function alternarUso({ anticoncepcionalId, data, horario, confirmar, fusoHorario }) {
        const caminho = `${criarCaminhoAnticoncepcional(anticoncepcionalId)}/usos`;
        const corpo = criarCorpoUso({ data, horario, confirmar, fusoHorario });
        const resposta = await requisicaoAutenticada({ metodo: 'PUT', caminho, corpo });
        if (!resposta?.uso || typeof resposta.uso !== 'object' || Array.isArray(resposta.uso)) {
            throw new Error('Não foi possível atualizar o uso do anticoncepcional.');
        }
        return Object.freeze({ uso: normalizarUsoAcompanhamento(resposta.uso) });
    }

    return Object.freeze({
        listar,
        cadastrar,
        editar,
        remover,
        alternarUso
    });
}

export {
    criarCaminhoAnticoncepcional,
    criarContraceptiveService,
    criarCorpoCadastro,
    criarCorpoUso,
    normalizarAnticoncepcional,
    normalizarAnticoncepcionalAcompanhamento
};
