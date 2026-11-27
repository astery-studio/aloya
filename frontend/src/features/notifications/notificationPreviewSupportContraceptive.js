import { nomeAnticoncepcional as anticoncepcional } from './notificationPreviewContraceptiveRoutine';

export const nome = 'Alex';
const horario = '20:00';
const tituloUsoPendente = `Uso pendente — anticoncepcional de ${nome}`;

export const exemplosDeAnticoncepcionalCompartilhado = {
    'redeApoio.anticoncepcional.horario': [
        `Horário do anticoncepcional de ${nome}`,
        `O uso de ${anticoncepcional} está previsto para ${horario} na agenda que ${nome} compartilhou com você.`
    ],
    'redeApoio.anticoncepcional.naoConfirmado': [
        tituloUsoPendente,
        `O uso de ${anticoncepcional} às ${horario} ainda não foi confirmado no Aloya. Restam 4 horas do prazo do lembrete.`
    ],
    'redeApoio.anticoncepcional.moderados': [
        tituloUsoPendente,
        `O registro de ${anticoncepcional} na agenda de ${nome} ainda aguarda confirmação. Restam 3 horas do prazo do lembrete.`
    ],
    'redeApoio.anticoncepcional.criticos': [
        tituloUsoPendente,
        `O uso de ${anticoncepcional} ainda está sem confirmação no Aloya. Restam 2 horas do prazo do lembrete.`
    ],
    'redeApoio.anticoncepcional.fimJanela': [
        tituloUsoPendente,
        `O prazo do lembrete terminou e o uso de ${anticoncepcional} segue sem confirmação no Aloya. Você pode conferir o registro compartilhado.`
    ],
    'redeApoio.anticoncepcional.aplicacoesTrocas': [
        `Aplicação do anticoncepcional de ${nome}`,
        `A aplicação de Injetável Aurora está prevista para 28 de novembro na agenda compartilhada por ${nome}.`
    ],
    'redeApoio.anticoncepcional.aplicacoesTrocas.troca': [
        `Troca do anticoncepcional de ${nome}`,
        `A troca de Adesivo Aurora está prevista para 28 de novembro na agenda compartilhada por ${nome}.`
    ]
};
