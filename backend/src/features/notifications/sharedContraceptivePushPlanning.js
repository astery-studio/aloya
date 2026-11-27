import { permiteNotificacao } from './notificationEvents.service.js';
import { planejarConta } from './notificationPlanner.js';
function tipoCompartilhado(evento) {
    if (evento === 'anticoncepcional.rotina.horario') return 'horario';
    if (evento.startsWith('anticoncepcional.naoConfirmado.')) {
        return {
            aviso: 'naoConfirmado',
            moderados: 'moderados',
            criticos: 'criticos',
            fimJanela: 'fimJanela'
        }[evento.split('.').at(-1)];
    }
    return /^(anticoncepcional\.(injetavel|adesivo|anel|diu)\.)/.test(evento)
        ? 'aplicacoesTrocas'
        : undefined;
}

export async function agendarAnticoncepcionalCompartilhado({
    prisma,
    vinculo,
    permissoes,
    preferencia,
    agora,
    fuso,
    usuarioId,
    inserir
}) {
    const titularId = vinculo.titularId;
    if (
        permissoes.includes('geral.anticoncepcionais') &&
        permissoes.includes('geral.alerta_anticoncepcional')
    ) {
        const autoriza = (evento) => {
            const tipo = tipoCompartilhado(evento);
            return tipo && permiteNotificacao(preferencia, `redeApoio.anticoncepcional.${tipo}`);
        };
        if (
            [
                'horario',
                'naoConfirmado',
                'moderados',
                'criticos',
                'fimJanela',
                'aplicacoesTrocas'
            ].some((tipo) => permiteNotificacao(preferencia, `redeApoio.anticoncepcional.${tipo}`))
        ) {
            const agendados = await planejarConta(
                prisma,
                titularId,
                vinculo.titular.preferenciaNotificacao,
                agora,
                { autoriza, fusoAlternativo: fuso }
            );
            for (const aviso of agendados)
                inserir({
                    ...aviso,
                    usuarioId,
                    tipoOrigem: 'rede_apoio',
                    evento: `redeApoio.anticoncepcional.${tipoCompartilhado(aviso.evento)}`,
                    ocorrencia: `${aviso.evento}:${aviso.ocorrencia}`
                });
        }
    }
}
