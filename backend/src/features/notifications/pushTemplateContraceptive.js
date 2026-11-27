import { lerPoliticaDeAlertas } from './contraceptivePushPolicy.js';

function dataEmPortugues(data) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC'
    }).format(data);
}
export async function renderizarAnticoncepcional(prisma, aviso, agora) {
    const { evento, origemId, ocorrencia } = aviso;
    if (evento.startsWith('anticoncepcional.')) {
        const metodo = await prisma.anticoncepcional.findFirst({
            where: { id: origemId, usuarioId: aviso.usuarioId, ativo: true },
            select: { nome: true, dataValidade: true }
        });
        if (!metodo) return undefined;
        if (evento === 'anticoncepcional.rotina.horario') {
            const horario = ocorrencia.slice(-5);
            return {
                title: `Hora de tomar ${metodo.nome}`,
                body: `O horário programado para o uso do seu anticoncepcional é agora, às ${horario}. Não se esqueça de registrar a confirmação no Aloya.`
            };
        }
        if (evento.startsWith('anticoncepcional.diu.') && metodo.dataValidade) {
            const proxima = evento.endsWith('.proxima');
            return {
                title: proxima
                    ? 'A troca do seu DIU está se aproximando'
                    : 'Lembrete de troca do DIU hormonal',
                body: `A data prevista para a troca do seu DIU hormonal é ${dataEmPortugues(metodo.dataValidade)}. ${proxima ? 'Faltam 7 dias para a data de validade.' : 'A data de validade é hoje.'}`
            };
        }
        if (evento.startsWith('anticoncepcional.naoConfirmado.')) {
            const titulos = {
                aviso: `Lembrete: ${metodo.nome}`,
                moderados: 'Acompanhamento do seu anticoncepcional',
                criticos: 'Lembrete de confirmação',
                fimJanela: 'Confirmação de uso pendente'
            };
            const fase = evento.split('.').at(-1);
            const [, , horas, minutos, atrasoProgramado] = ocorrencia.split(':');
            const limite = lerPoliticaDeAlertas().get(origemId)?.at(-1)?.atraso;
            const restante = Math.max(
                0,
                Math.ceil(
                    (+aviso.dataHoraProgramada - +agora) / 60000 + limite - Number(atrasoProgramado)
                )
            );
            const prazo =
                Number.isFinite(restante) && fase !== 'fimJanela'
                    ? ` Restam ${Math.floor(restante / 60)} h e ${restante % 60} min do prazo definido para registro.`
                    : '';
            return {
                title: titulos[fase],
                body: `O uso programado para ${horas}:${minutos} ainda não foi confirmado no Aloya.${prazo} Abra o aplicativo para conferir o registro.`
            };
        }
    }
}
