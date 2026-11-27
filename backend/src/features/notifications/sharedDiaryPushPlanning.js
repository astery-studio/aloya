import { permiteNotificacao } from './notificationEvents.service.js';

const deDiario = {
    ciclo: 'ciclo',
    corpo: 'corpo',
    emocional: 'emocional',
    energia: 'energia',
    vida_intima: 'vidaIntima',
    saude: 'saude'
};
export async function agendarDiarioCompartilhado({
    prisma,
    permissoes,
    preferencia,
    titularId,
    inicio,
    segunda,
    resumo
}) {
    const diarioPermitido = permissoes.filter(
        (item) =>
            deDiario[item.split('.')[0]] &&
            permiteNotificacao(preferencia, `redeApoio.diario.${deDiario[item.split('.')[0]]}`)
    );
    if (!diarioPermitido.length) return;
    const preenchidas = await prisma.registroDiarioCategoria.findMany({
        where: {
            registro: { usuarioId: titularId, dataRegistro: { gte: inicio, lt: segunda } }
        },
        distinct: ['categoriaId'],
        select: { categoriaId: true }
    });
    for (const permissao of diarioPermitido) {
        const [macro, categoria] = permissao.split('.');
        if (preenchidas.some(({ categoriaId }) => categoriaId === categoria))
            resumo(`redeApoio.diario.${deDiario[macro]}`);
    }
}
