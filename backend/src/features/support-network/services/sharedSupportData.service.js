import { validarConsultaHistorico } from '../../cycles/validators/cycleHistory.validator.js';
import { lerIdCompartilhado, negarAcessoCompartilhado } from './sharedSupportAccess.service.js';

function criarSharedSupportData({
    prisma,
    calendarService,
    currentCycleService,
    cycleHistoryService,
    contraceptiveService
}) {
    function resumo({ nomeTitular }) {
        return { nomeTitular };
    }

    async function fase({ titularId }) {
        const { faseAtual } = await currentCycleService.buscarEstadoAtual({ usuarioId: titularId });
        return { faseAtual };
    }

    function dicas() {
        return { fases: ['menstrual', 'folicular', 'ovulatoria', 'lutea'] };
    }

    async function historico({ titularId }, consulta) {
        const { cursor } = validarConsultaHistorico(consulta);
        if (cursor) {
            const registro = await prisma.registroCiclo.findFirst({
                where: {
                    id: lerIdCompartilhado(cursor.id),
                    usuarioId: titularId,
                    dataInicio: cursor.dataInicio
                },
                select: { id: true }
            });
            if (!registro) negarAcessoCompartilhado();
        }

        const resultado = await cycleHistoryService.listarHistorico({
            usuarioId: titularId,
            consulta
        });
        const { cicloMedioDias, menstruacaoMediaDias, quantidadeCiclos } = resultado.resumo;
        return { ...resultado, resumo: { cicloMedioDias, menstruacaoMediaDias, quantidadeCiclos } };
    }

    async function calendario({ titularId, permissoes }, { mes }) {
        const calendario = await calendarService.buscarMes({ usuarioId: titularId, mes });
        const permitePrevisoes = permissoes.includes('geral.fase_atual');
        const periodos = permitePrevisoes ? calendario.previsao?.periodos : null;

        return {
            mes: calendario.mes,
            possuiCiclos: calendario.possuiCiclos,
            diasMenstruacao: calendario.diasMenstruacao.map(({ data }) => data),
            permitePrevisoes,
            previsao: periodos
                ? {
                      periodos: periodos.map(
                          ({
                              previsto,
                              faseMenstrual,
                              faseFolicular,
                              ovulacao,
                              faseLutea,
                              janelaFertil,
                              menstruacaoPrevista
                          }) => ({
                              previsto,
                              faseMenstrual,
                              faseFolicular,
                              ovulacao,
                              faseLutea,
                              janelaFertil,
                              menstruacaoPrevista
                          })
                      )
                  }
                : null
        };
    }

    async function anticoncepcionais({ titularId, permissoes }, { fusoHorario }) {
        const podeVerAlerta = permissoes.includes('geral.alerta_anticoncepcional');
        const itens = await contraceptiveService.listar(titularId, {
            incluirRemovidos: true,
            fusoHorario
        });
        return {
            itens: itens.map((item) => ({
                id: item.id,
                nome: item.nome,
                tipo: item.tipo,
                ativo: item.ativo,
                horarios: item.horarios,
                ...(podeVerAlerta && { intensidadeAlerta: item.intensidadeAlerta }),
                dataValidade: item.dataValidade,
                validadeExpirada: item.validadeExpirada,
                validadeRestante: item.validadeRestante,
                proximoUsoPrevisto: item.proximoUsoPrevisto,
                statusUltimoUso: item.statusUltimoUso,
                usosHoje: (item.usosHoje ?? []).map(
                    ({ id, data, horario, status, confirmadoEm, foraDoPrazo, atrasado }) => ({
                        id,
                        data,
                        horario,
                        status,
                        confirmadoEm,
                        foraDoPrazo,
                        atrasado
                    })
                ),
                historico: item.historico
            }))
        };
    }

    return { resumo, fase, dicas, historico, calendario, anticoncepcionais };
}

export { criarSharedSupportData };
