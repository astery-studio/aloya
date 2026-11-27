import { normalizarPagina } from '../../cycles/services/cycleHistoryService';
import { normalizarAnticoncepcionalAcompanhamento } from '../../contraceptives/services/contraceptiveService';
import { fusoDoDispositivo } from '../../contraceptives/utils/contraceptiveTrackingAdapter';
import { normalizarFiltrosDiario } from '../../diary/utils/diaryFilters';
import { endpoints } from '../../../shared/services/api/endpoints';

function validarId(id) {
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new TypeError('Identificador do acompanhamento inválido.');
    }
    return id;
}

function criarSharedSupportService({ requisicaoAutenticada }) {
    return {
        async consultar(vinculoId, recurso = '', { signal, parametros } = {}) {
            const consulta = new URLSearchParams(parametros).toString();
            const sufixo = consulta ? `?${consulta}` : '';
            const resposta = await requisicaoAutenticada({
                caminho: `${endpoints.contatosRecebidos}/${validarId(vinculoId)}/shared${recurso}${sufixo}`,
                signal
            });

            if (!resposta?.dados || !Array.isArray(resposta.permissoes)) {
                throw new Error('Não foi possível carregar os dados compartilhados.');
            }

            return resposta;
        }
    };
}

function criarConsultasCompartilhadas(consultar) {
    return {
        fase: ({ signal }) => consultar('/fase', { signal }),
        async anticoncepcionais({ signal }) {
            const { itens } = await consultar('/anticoncepcionais', {
                signal,
                parametros: { fusoHorario: fusoDoDispositivo() }
            });
            return itens.map(normalizarAnticoncepcionalAcompanhamento);
        },
        calendario: {
            buscarMes: ({ mes, signal }) =>
                consultar('/calendario', { signal, parametros: { mes } })
        },
        historico: {
            async listarPagina({ limite, cursor, signal }) {
                const parametros = { limit: String(limite), ...(cursor && { cursor }) };
                const dados = await consultar('/ciclos', { signal, parametros });
                return normalizarPagina(dados, limite, { compartilhado: true });
            }
        },
        diario: {
            buscarCatalogo: ({ signal } = {}) => consultar('/diario/catalogo', { signal }),
            buscarDetalhe: (id, { signal }) => consultar(`/diario/${validarId(id)}`, { signal }),
            listarHistorico({ filtros, cursor, signal }) {
                const { dataInicio, dataFim, categorias, fases } = normalizarFiltrosDiario(filtros);
                const parametros = {
                    ...(cursor && { cursor }),
                    ...(dataInicio && { dataInicio }),
                    ...(dataFim && { dataFim }),
                    ...(categorias.length && { categorias: categorias.join(',') }),
                    ...(fases.length && { fases: fases.join(',') })
                };
                return consultar('/diario', { parametros, signal });
            }
        }
    };
}

export { criarConsultasCompartilhadas, criarSharedSupportService };
