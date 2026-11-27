import { criarIntervaloMensal } from '../../calendar/utils/calendar.period.js';
import { validarMesCalendario } from '../../calendar/validators/calendar.validator.js';
import { formatarData } from '../../cycles/utils/calendar.js';
import { validarConsultaHistorico } from '../../cycles/validators/cycleHistory.validator.js';
import { lerIdCompartilhado, negarAcessoCompartilhado } from './sharedSupportAccess.service.js';

function criarSharedSupportData({
    prisma,
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

    async function calendario({ titularId }, { mes }) {
        const mesValidado = validarMesCalendario(mes);
        const { inicioMes, fimMesExclusivo } = criarIntervaloMensal(mesValidado);
        const dias = await prisma.diaMenstruacao.findMany({
            where: {
                registroCiclo: { usuarioId: titularId },
                data: { gte: inicioMes, lt: fimMesExclusivo }
            },
            orderBy: [{ data: 'asc' }, { registroCicloId: 'asc' }],
            select: { data: true }
        });
        return {
            mes: mesValidado.chave,
            diasMenstruacao: [...new Set(dias.map(({ data }) => formatarData(data)))]
        };
    }

    async function anticoncepcionais({ titularId }, { fusoHorario }) {
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
                dataValidade: item.dataValidade,
                validadeExpirada: item.validadeExpirada,
                validadeRestante: item.validadeRestante,
                proximoUsoPrevisto: item.proximoUsoPrevisto,
                statusUltimoUso: item.statusUltimoUso,
                historico: item.historico
            }))
        };
    }

    return { resumo, fase, dicas, historico, calendario, anticoncepcionais };
}

export { criarSharedSupportData };
