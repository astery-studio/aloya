import {
    dataHoraNoFuso,
    dataLocalNoFuso
} from '../contraceptives/validators/contraceptiveUsage.validator.js';

export const diaMs = 86400000;
export const somarDias = (data, dias) =>
    new Date(Date.parse(data) + dias * diaMs).toISOString().slice(0, 10);
const tipos = { ciclo: 'mudanca_fase', anticoncepcional: 'anticoncepcional' };

export async function criarContextoPlanejamento(
    prisma,
    usuarioId,
    preferencia,
    agora,
    autoriza,
    fusoAlternativo
) {
    const dispositivo = await prisma.dispositivoPush.findFirst({
        where: { usuarioId, invalidadoEm: null },
        orderBy: [{ atualizadoEm: 'desc' }, { id: 'asc' }],
        select: { fuso: true }
    });

    const fuso = dispositivo?.fuso ?? fusoAlternativo;
    if (!fuso) return null;

    const hoje = dataLocalNoFuso(agora, fuso);
    const amanha = somarDias(hoje, 1);
    const horizonte = somarDias(hoje, 7);
    const horario = preferencia?.horarioLembreteDiario ?? '20:00';
    const resultado = [];

    function porDia(
        evento,
        data,
        { origemId = null, horarioLocal = horario, ocorrencia = data, tipoOrigem, expira } = {}
    ) {
        if (!data || data < hoje || data > horizonte || !autoriza(evento)) return;

        const dataHoraProgramada = dataHoraNoFuso(data, horarioLocal, fuso);
        if (!dataHoraProgramada) return;

        const expiraEm =
            expira ??
            dataHoraNoFuso(somarDias(data, 1), '00:00', fuso) ??
            new Date(+dataHoraProgramada + diaMs);
        resultado.push({
            usuarioId,
            evento,
            ocorrencia,
            origemId,
            dataHoraProgramada,
            expiraEm,
            tipoOrigem: tipoOrigem ?? tipos[evento.split('.')[0]]
        });
    }

    return { hoje, amanha, horizonte, fuso, porDia, resultado };
}
