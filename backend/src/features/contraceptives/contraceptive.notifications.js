//Sincroniza somente as notificações futuras afetadas pela edição de um anticoncepcional.
import { obterFrequencia } from './contraceptive.constants.js';
import { calcularProximoUso } from './contraceptive.schedule.js';

//Recebe duas datas opcionais e informa se representam o mesmo instante.
function datasSaoIguais(dataAtual, dataNova) {
    if (dataAtual === null && dataNova === null) return true;
    if (!(dataAtual instanceof Date) || !(dataNova instanceof Date)) return false;
    return dataAtual.getTime() === dataNova.getTime();
}

//Recebe dois valores JSON e informa se possuem o mesmo conteúdo.
function valoresJsonSaoIguais(valorAtual, valorNovo) {
    return JSON.stringify(valorAtual) === JSON.stringify(valorNovo);
}

//Informa se algum campo capaz de alterar a agenda futura foi modificado.
function agendaFoiAlterada(registroAtual, dadosNovos) {
    return registroAtual.tipo !== dadosNovos.tipo
        || !valoresJsonSaoIguais(registroAtual.horariosProgramados, dadosNovos.horariosProgramados)
        || registroAtual.frequencia !== dadosNovos.frequencia
        || !datasSaoIguais(registroAtual.dataInicioUso, dadosNovos.dataInicioUso)
        || !valoresJsonSaoIguais(registroAtual.periodosPausa, dadosNovos.periodosPausa)
        || !datasSaoIguais(registroAtual.dataValidade, dadosNovos.dataValidade);
}

//Calcula a próxima notificação e impede agendamento posterior à validade.
function calcularProximaNotificacao(dadosNovos, agora) {
    const regra = obterFrequencia(dadosNovos.tipo, dadosNovos.frequencia);

    if (!regra || !(dadosNovos.dataInicioUso instanceof Date) || !Array.isArray(dadosNovos.horariosProgramados) || dadosNovos.horariosProgramados.length === 0) {
        return null;
    }

    const proximoUso = calcularProximoUso({
        horarios: dadosNovos.horariosProgramados,
        dataPrimeiroUso: dadosNovos.dataInicioUso,
        regra,
        periodosPausa: dadosNovos.periodosPausa
    }, agora);

    if (!proximoUso) return null;

    if (dadosNovos.dataValidade instanceof Date) {
        const dataDoUso = proximoUso.toISOString().slice(0, 10);
        const dataValidade = dadosNovos.dataValidade.toISOString().slice(0, 10);

        if (dataDoUso > dataValidade) return null;
    }

    return proximoUso;
}

//Atualiza intensidade ou recria a próxima notificação sem tocar em alertas já iniciados.
async function sincronizarNotificacoesEdicao({
    transacao,
    usuarioId,
    anticoncepcionalId,
    registroAtual,
    dadosNovos,
    agora
}) {
    const alterouAgenda = agendaFoiAlterada(registroAtual, dadosNovos);
    const alterouIntensidade = registroAtual.nivelIntensidadeAlerta !== dadosNovos.nivelIntensidadeAlerta;

    if (!alterouAgenda && !alterouIntensidade) return;

    const filtroNotificacoesFuturas = {
        usuarioId,
        tipoOrigem: 'anticoncepcional',
        origemId: anticoncepcionalId,
        statusEnvio: 'agendada',
        dataHoraDisparo: null,
        dataHoraProgramada: {
            gt: agora
        }
    };

    if (!alterouAgenda) {
        await transacao.notificacao.updateMany({
            where: filtroNotificacoesFuturas,
            data: {
                intensidadeAlerta: dadosNovos.nivelIntensidadeAlerta
            }
        });

        return;
    }

    await transacao.notificacao.updateMany({
        where: filtroNotificacoesFuturas,
        data: {
            statusEnvio: 'cancelada'
        }
    });

    const proximaNotificacao = calcularProximaNotificacao(dadosNovos, agora);

    if (!proximaNotificacao) return;

    await transacao.notificacao.create({
        data: {
            usuarioId,
            tipoOrigem: 'anticoncepcional',
            origemId: anticoncepcionalId,
            dataHoraProgramada: proximaNotificacao,
            dataHoraDisparo: null,
            intensidadeAlerta: dadosNovos.nivelIntensidadeAlerta,
            statusEnvio: 'agendada'
        }
    });
}

export {
    agendaFoiAlterada,
    calcularProximaNotificacao,
    sincronizarNotificacoesEdicao
};