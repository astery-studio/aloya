import { STATUS_CONVITE_PENDENTE } from '../constants/contactInvitation.constants.js';

function criarErroConviteIndisponivel() {
    const erro = new Error('Este convite não está mais disponível.');
    erro.status = 410;
    erro.codigo = 'CONVITE_INDISPONIVEL';
    return erro;
}

function criarContactInvitationResponseService({
    prisma,
    tokenService,
    now = () => new Date()
} = {}) {
    if (
        typeof prisma?.vinculoRedeApoio?.findUnique !== 'function' ||
        typeof tokenService?.calcularHash !== 'function' ||
        typeof now !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar a resposta aos convites.');
    }

    async function buscarConvitePendente(token) {
        const tokenHash = tokenService.calcularHash(token);
        if (!tokenHash) throw criarErroConviteIndisponivel();

        const convite = await prisma.vinculoRedeApoio.findUnique({
            where: { tokenConviteHash: tokenHash },
            select: {
                id: true,
                emailConvidado: true,
                status: true,
                dataExpiracao: true,
                categoriaId: true,
                permissoesIndividuais: true,
                titular: { select: { nome: true } },
                categoria: {
                    select: { nome: true, conjuntoDadosVisiveis: true }
                }
            }
        });

        if (
            !convite ||
            convite.status !== STATUS_CONVITE_PENDENTE ||
            !(convite.dataExpiracao instanceof Date) ||
            convite.dataExpiracao <= now()
        ) {
            throw criarErroConviteIndisponivel();
        }

        return { convite, tokenHash };
    }

    async function consultar(token) {
        const { convite } = await buscarConvitePendente(token);
        const porCategoria = Boolean(convite.categoriaId && convite.categoria);

        return Object.freeze({
            titular: { nome: convite.titular.nome },
            tipoPermissao: porCategoria ? 'categoria' : 'individual',
            categoria: porCategoria
                ? {
                      nome: convite.categoria.nome,
                      permissoes: convite.categoria.conjuntoDadosVisiveis
                  }
                : null,
            permissoesIndividuais: porCategoria ? [] : convite.permissoesIndividuais,
            dataExpiracao: convite.dataExpiracao
        });
    }

    return Object.freeze({ buscarConvitePendente, consultar });
}

export {
    criarContactInvitationResponseService,
    criarErroConviteIndisponivel
};
