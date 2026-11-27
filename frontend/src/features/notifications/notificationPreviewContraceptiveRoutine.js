export const nomeAnticoncepcional = 'Pílula Aurora';
const horario = '20:00';
const tituloUsoPendente = 'Confirmação de uso pendente';

export const exemplosDeRotina = {
    'anticoncepcional.rotina.horario': [
        `Hora de tomar ${nomeAnticoncepcional}`,
        `O horário programado para o uso do seu anticoncepcional é agora, às ${horario}. Não se esqueça de registrar a confirmação no Aloya.`
    ],
    'anticoncepcional.rotina.inicioPausa': [
        'Início da pausa do anticoncepcional',
        `Hoje começa a pausa programada para ${nomeAnticoncepcional}. Você pode conferir a agenda no Aloya.`
    ],
    'anticoncepcional.rotina.fimPausa': [
        'Fim da pausa do anticoncepcional',
        `Hoje é o último dia da pausa de ${nomeAnticoncepcional}. Confira no Aloya quando retomar o uso.`
    ],
    'anticoncepcional.rotina.retomada': [
        'Retomada do anticoncepcional',
        `Sua agenda indica que hoje é dia de retomar o uso de ${nomeAnticoncepcional}. Confira o horário no Aloya.`
    ],

    'anticoncepcional.naoConfirmado.aviso': [
        tituloUsoPendente,
        `O uso de ${nomeAnticoncepcional} às ${horario} ainda não foi confirmado no Aloya. Restam 4 horas do prazo definido para registro.`
    ],
    'anticoncepcional.naoConfirmado.moderados': [
        tituloUsoPendente,
        `O uso de ${nomeAnticoncepcional} ainda aguarda confirmação. Restam 3 horas do prazo definido para registro. Você pode atualizar o registro no Aloya.`
    ],
    'anticoncepcional.naoConfirmado.criticos': [
        tituloUsoPendente,
        `A confirmação de ${nomeAnticoncepcional} continua pendente no Aloya. Restam 2 horas do prazo definido para registro.`
    ],
    'anticoncepcional.naoConfirmado.fimJanela': [
        tituloUsoPendente,
        `O uso de ${nomeAnticoncepcional} às ${horario} ainda não foi confirmado no Aloya. O prazo deste lembrete terminou. Você pode conferir o registro no app.`
    ]
};
