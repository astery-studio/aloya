import { dataCivil } from '../contraceptives/utils/contraceptive.listing.schedule.js';
import { lerPoliticaDeAlertas } from './contraceptivePushPolicy.js';
import { lembretesDeRotina } from './pushTemplateContraceptiveRoutine.js';

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

        const lembreteDeRotina = lembretesDeRotina[evento];
        if (lembreteDeRotina) {
            const [title, mensagem] = lembreteDeRotina;
            return { title, body: mensagem(metodo.nome) };
        }

        if (
            evento === 'anticoncepcional.injetavel.proxima' ||
            evento === 'anticoncepcional.injetavel.hoje'
        ) {
            const data = ocorrencia?.split(':')[1];
            const dia = new Date(`${data}T00:00:00Z`);
            if (!data || dataCivil(dia) !== data) return undefined;

            const dataAplicacao = dataEmPortugues(dia);
            const hoje = evento === 'anticoncepcional.injetavel.hoje';
            const lembrete = hoje
                ? `A aplicação de ${metodo.nome} está marcada para hoje, ${dataAplicacao}.`
                : `Sua próxima aplicação de ${metodo.nome} está marcada para ${dataAplicacao}.`;
            return {
                title: hoje
                    ? 'Aplicação do anticoncepcional hoje'
                    : 'Próxima aplicação do anticoncepcional',
                body: `${lembrete} Você pode conferir o horário na agenda do Aloya.`
            };
        }

        if (evento.startsWith('anticoncepcional.validade.') && metodo.dataValidade) {
            return {
                title:
                    evento === 'anticoncepcional.validade.proxima'
                        ? 'Seu anticoncepcional está perto de vencer'
                        : 'Seu anticoncepcional chegou à data de validade',
                body: `A data de validade de ${metodo.nome} é ${dataEmPortugues(metodo.dataValidade)}. Você pode conferir os detalhes no Aloya.`
            };
        }

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
                fase === 'fimJanela'
                    ? ' O prazo deste lembrete terminou.'
                    : Number.isFinite(restante) && restante > 0
                      ? ` Restam ${Math.floor(restante / 60)} h e ${restante % 60} min do prazo definido para registro.`
                      : '';
            return {
                title: 'Confirmação de uso pendente',
                body: `O uso de ${metodo.nome} às ${horas}:${minutos} ainda não foi confirmado no Aloya.${prazo} Você pode conferir o registro no app.`
            };
        }
    }
}
