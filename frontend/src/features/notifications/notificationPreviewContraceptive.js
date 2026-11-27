import { exemplosDeRotina, nomeAnticoncepcional } from './notificationPreviewContraceptiveRoutine';

const dataTroca = '16 de novembro';
const dataValidade = '30 de novembro';
const nomeInjetavel = 'Injetável Aurora';
const dataAplicacao = '28 de novembro';
const nomeAdesivo = 'Adesivo Aurora';

export const exemplosContraceptive = {
    ...exemplosDeRotina,

    'anticoncepcional.injetavel.proxima': [
        'Próxima aplicação do anticoncepcional',
        `Sua próxima aplicação de ${nomeInjetavel} está marcada para ${dataAplicacao}. Você pode conferir o horário na agenda do Aloya.`
    ],
    'anticoncepcional.injetavel.hoje': [
        'Aplicação do anticoncepcional hoje',
        `A aplicação de ${nomeInjetavel} está marcada para hoje, ${dataAplicacao}. Você pode conferir o horário na agenda do Aloya.`
    ],
    'anticoncepcional.adesivo.troca': [
        'Troca do adesivo anticoncepcional',
        `Sua agenda indica a troca de ${nomeAdesivo} por um novo adesivo hoje, sem iniciar a pausa.`
    ],
    'anticoncepcional.adesivo.retirada': [
        'Retirada do adesivo anticoncepcional',
        `A retirada de ${nomeAdesivo} está programada para hoje e marca o início da pausa. Confira no Aloya quando retomar o uso.`
    ],
    'anticoncepcional.adesivo.novo': [
        'Novo adesivo anticoncepcional após a pausa',
        `A pausa programada terminou. Sua agenda indica que hoje é dia de colocar um novo ${nomeAdesivo}.`
    ],
    'anticoncepcional.anel.retirada': [
        null,
        'Hoje é o dia previsto para retirar o anel. Confira sua agenda no Aloya.'
    ],
    'anticoncepcional.anel.insercao': [
        null,
        'Hoje é a data prevista para colocar o anel após a pausa.'
    ],
    'anticoncepcional.anel.troca': [
        null,
        'A troca do seu anel está prevista para hoje. Confira os detalhes no Aloya.'
    ],

    'anticoncepcional.diu.proxima': [
        'A troca do seu DIU está se aproximando',
        `A data prevista para a troca do seu DIU hormonal é ${dataTroca}. Faltam 7 dias para a data de validade.`
    ],
    'anticoncepcional.diu.data': [
        'Lembrete de troca do DIU hormonal',
        `A data prevista para a troca do seu DIU hormonal é ${dataTroca}. Restam 2 dias para a data de validade.`
    ],
    'anticoncepcional.validade.proxima': [
        'Seu anticoncepcional está perto de vencer',
        `A data de validade de ${nomeAnticoncepcional} é ${dataValidade}. Você pode conferir os detalhes no Aloya.`
    ],
    'anticoncepcional.validade.atingida': [
        'Seu anticoncepcional chegou à data de validade',
        `A data de validade de ${nomeAnticoncepcional} é ${dataValidade}. Você pode conferir os detalhes no Aloya.`
    ]
};
