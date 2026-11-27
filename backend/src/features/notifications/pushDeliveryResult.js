const minuto = 60000;
const somar = (data, ms) => new Date(+data + ms);
const temporarios = new Set(['Temporario', 'MessageRateExceeded']);
const errosConhecidos = new Set([
    'Temporario',
    'DeviceNotRegistered',
    'MessageTooBig',
    'MessageRateExceeded',
    'MismatchSenderId',
    'InvalidCredentials',
    'RequisicaoRecusada'
]);

export async function registrarResultado(
    prisma,
    entrega,
    resposta,
    agora,
    verificandoRecibo = false
) {
    let dados;
    if (resposta?.status === 'ok' && (verificandoRecibo || resposta.id)) {
        dados = verificandoRecibo
            ? { status: 'encaminhada', erro: null }
            : {
                  status: 'aceita',
                  ticket: resposta.id,
                  aceitaEm: agora,
                  proximaTentativa: somar(agora, 15 * minuto),
                  erro: null
              };
    } else {
        const codigo = resposta?.details?.error;
        const erro = errosConhecidos.has(codigo) ? codigo : 'RespostaIndeterminada';
        if (verificandoRecibo && (!resposta || temporarios.has(erro))) {
            dados = { proximaTentativa: somar(agora, 15 * minuto) };
        } else if (!verificandoRecibo && temporarios.has(erro) && entrega.tentativas < 5) {
            dados = {
                status: 'pendente',
                erro,
                proximaTentativa: somar(agora, 2 ** entrega.tentativas * minuto)
            };
        } else {
            dados = { status: 'falha', erro };
        }
        if (erro === 'DeviceNotRegistered')
            await prisma.dispositivoPush.updateMany({
                where: { id: entrega.dispositivoId, vinculo: entrega.vinculo },
                data: { invalidadoEm: agora }
            });
    }
    await prisma.entregaPush.update({ where: { id: entrega.id }, data: dados });
}
