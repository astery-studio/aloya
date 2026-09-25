import { endpoints } from '../../../services/api/endpoints';

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

function criarContraceptiveService({ requisicaoAutenticada }) {
    async function listar({ signal } = {}) {
        const resposta = await requisicaoAutenticada({
            caminho: endpoints.anticoncepcionais,
            ...(signal ? { signal } : {})
        });

        return (resposta.anticoncepcionais ?? []).map(normalizarAnticoncepcional);
    }

    async function cadastrar(anticoncepcional) {
        const resposta = await requisicaoAutenticada({
            metodo: 'POST',
            caminho: endpoints.anticoncepcionais,
            corpo: criarCorpoCadastro(anticoncepcional)
        });

        return normalizarAnticoncepcional(resposta.anticoncepcional);
    }

    return Object.freeze({ listar, cadastrar });
}

export { criarContraceptiveService, criarCorpoCadastro, normalizarAnticoncepcional };
