import {
    dataLocalNoFuso,
    dataHoraNoFuso
} from '../contraceptives/validators/contraceptiveUsage.validator.js';
import { agendarAnticoncepcionalCompartilhado } from './sharedContraceptivePushPlanning.js';
import { agendarResumosCompartilhados } from './sharedSummaryPushPlanning.js';
import { agendarDicasCompartilhadas } from './sharedCareTipPlanning.js';

const diaMs = 86400000;

export async function planejarCompartilhadas(prisma, usuarioId, preferencia, agora) {
    const aparelho = await prisma.dispositivoPush.findFirst({
        where: { usuarioId, invalidadoEm: null },
        orderBy: [{ atualizadoEm: 'desc' }, { id: 'asc' }],
        select: { fuso: true }
    });

    if (!aparelho) return [];

    const { fuso } = aparelho;
    const dataLocal = dataLocalNoFuso(agora, fuso);
    const data = new Date(dataLocal);
    const segunda = new Date(
        +data +
            (data.getUTCDay() === 0 ? 1 : data.getUTCDay() === 1 ? 0 : 8 - data.getUTCDay()) * diaMs
    );
    const inicio = new Date(+segunda - 7 * diaMs);
    const horaResumo = dataHoraNoFuso(segunda.toISOString().slice(0, 10), '20:00', fuso);

    const vinculos = await prisma.vinculoRedeApoio.findMany({
        where: { contatoId: usuarioId, status: 'ativo', titular: { statusConta: 'ativa' } },
        include: {
            categoria: true,
            titular: {
                select: {
                    preferenciaNotificacao: true,
                    dataNascimento: true,
                    consentimentoParental: { select: { statusConsentimento: true } }
                }
            }
        }
    });

    const candidatos = new Map();
    const inserir = (aviso) => candidatos.set(`${aviso.evento}|${aviso.ocorrencia}`, aviso);

    for (const vinculo of vinculos) {
        const permissoes = vinculo.categoria
            ? vinculo.categoria.conjuntoDadosVisiveis
            : vinculo.permissoesIndividuais;
        if (!Array.isArray(permissoes)) continue;

        await agendarDicasCompartilhadas({
            prisma,
            vinculo,
            permissoes,
            preferencia,
            agora,
            hoje: dataLocal,
            fuso,
            usuarioId,
            inserir
        });

        await agendarAnticoncepcionalCompartilhado({
            prisma,
            vinculo,
            permissoes,
            preferencia,
            agora,
            fuso,
            usuarioId,
            inserir
        });

        if (!horaResumo) continue;
        await agendarResumosCompartilhados({
            prisma,
            vinculo,
            permissoes,
            preferencia,
            usuarioId,
            inicio,
            segunda,
            horaResumo,
            inserir
        });
    }

    return [...candidatos.values()];
}
