import { podeProcessarRedeDeApoio } from './pushSupportEligibility.js';
import { permiteNotificacao } from './notificationEvents.service.js';
import { planejarConta } from './notificationPlanner.js';
import { planejarCompartilhadas } from './sharedPushPlanner.js';

export async function podeProcessar(prisma, aviso, agora, { aoAbrir = false } = {}) {
    const { usuarioId, evento, origemId } = aviso;
    if (
        !evento ||
        aviso.statusEnvio === 'cancelada' ||
        (!aoAbrir && (aviso.expiraEm ?? new Date(+aviso.dataHoraProgramada + 86400000)) <= agora)
    )
        return false;

    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { statusConta: true, preferenciaNotificacao: true }
    });
    if (usuario?.statusConta !== 'ativa') return false;
    if (evento.startsWith('seguranca.'))
        return [
            'seguranca.senha.alterada',
            'seguranca.senha.redefinida',
            'seguranca.senha.recuperacao',
            'seguranca.email.alterado',
            'seguranca.dispositivo.novo'
        ].includes(evento);
    if (aoAbrir && evento.startsWith('ciclo.')) return true;
    if (aoAbrir && evento.startsWith('anticoncepcional.')) {
        return Boolean(
            await prisma.anticoncepcional.count({ where: { id: origemId, usuarioId, ativo: true } })
        );
    }
    if (!permiteNotificacao(usuario.preferenciaNotificacao, evento)) return false;
    if (evento.startsWith('redeApoio.')) {
        const administrativo = await podeProcessarRedeDeApoio(prisma, aviso, agora);
        if (administrativo !== null) return administrativo;
    }

    const candidatos = evento.startsWith('redeApoio.')
        ? await planejarCompartilhadas(prisma, usuarioId, usuario.preferenciaNotificacao, agora)
        : await planejarConta(prisma, usuarioId, usuario.preferenciaNotificacao, agora);
    return candidatos.some(
        (item) =>
            item.evento === evento &&
            item.ocorrencia === aviso.ocorrencia &&
            item.origemId === origemId &&
            +item.dataHoraProgramada === +aviso.dataHoraProgramada
    );
}
