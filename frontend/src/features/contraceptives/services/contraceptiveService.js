//Centraliza as operações autenticadas de listagem, cadastro, edição e remoção de anticoncepcionais.
import { endpoints } from '../../../shared/services/api/endpoints';

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

//Recebe a função autenticada e retorna as operações disponíveis para anticoncepcionais.
function criarContraceptiveService({ requisicaoAutenticada }) {
    //Busca somente os anticoncepcionais ativos da pessoa autenticada.
    async function listar({ signal } = {}) {
        const resposta = await requisicaoAutenticada({
            caminho: endpoints.anticoncepcionais,
            ...(signal ? { signal } : {})
        });

        return (resposta.anticoncepcionais ?? []).map(normalizarAnticoncepcional);
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

    return Object.freeze({
        listar,
        cadastrar,
        editar,
        remover
    });
}

export {
    criarCaminhoAnticoncepcional,
    criarContraceptiveService,
    criarCorpoCadastro,
    normalizarAnticoncepcional
};