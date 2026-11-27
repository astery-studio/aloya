import { permiteHistorico } from '../cycles/utils/cycleRegistration.js';

export async function podeProcessarRedeDeApoio(prisma, aviso, agora) {
    const { usuarioId, evento, origemId } = aviso;
    if (evento === 'redeApoio.ciclo.registro') {
        const ciclo = await prisma.registroCiclo.findUnique({
            where: { id: origemId },
            select: { usuarioId: true }
        });
        if (!ciclo) return false;
        const vinculos = await prisma.vinculoRedeApoio.findMany({
            where: {
                titularId: ciclo.usuarioId,
                contatoId: usuarioId,
                status: 'ativo',
                titular: { statusConta: 'ativa' }
            },
            include: { categoria: true }
        });
        return vinculos.some(permiteHistorico);
    }
    if (evento.startsWith('redeApoio.convites.')) {
        if (evento === 'redeApoio.convites.contaExcluida') return !origemId;
        const vinculo = await prisma.vinculoRedeApoio.findUnique({ where: { id: origemId } });
        if (evento.endsWith('.acessoRevogado'))
            return !vinculo || (vinculo.contatoId === usuarioId && vinculo.status === 'revogado');
        if (!vinculo) return false;
        const tipo = evento.split('.').at(-1);
        if (tipo === 'respondido')
            return (
                vinculo.titularId === usuarioId &&
                Boolean(vinculo.dataResposta) &&
                aviso.ocorrencia === `${vinculo.id}:${vinculo.dataResposta.toISOString()}`
            );
        if (vinculo.contatoId !== usuarioId) return false;
        if (tipo === 'acessoAtualizado') return vinculo.status === 'ativo';
        if (['proximoExpiracao', 'expirado'].includes(tipo)) {
            return (
                vinculo.status === 'pendente' &&
                aviso.ocorrencia === `${vinculo.id}:${vinculo.dataExpiracao?.toISOString()}` &&
                (tipo === 'expirado'
                    ? vinculo.dataExpiracao <= agora
                    : vinculo.dataExpiracao > agora)
            );
        }
        return (
            ['recebido', 'renovado'].includes(tipo) &&
            vinculo.status === 'pendente' &&
            vinculo.dataExpiracao > agora &&
            aviso.ocorrencia === `${vinculo.id}:${vinculo.dataEnvio.toISOString()}`
        );
    }
    if (evento.startsWith('redeApoio.consentimento.')) {
        const consentimento = await prisma.consentimentoParental.findUnique({
            where: { id: origemId }
        });
        if (consentimento?.titularMenorId !== usuarioId) return false;
        return evento.endsWith('.confirmado')
            ? consentimento.statusConsentimento === 'liberado'
            : evento.endsWith('.expirado') &&
                  aviso.ocorrencia === consentimento.validadeLink.toISOString() &&
                  ['pendente', 'expirado'].includes(consentimento.statusConsentimento) &&
                  consentimento.validadeLink <= agora;
    }
    return null;
}
