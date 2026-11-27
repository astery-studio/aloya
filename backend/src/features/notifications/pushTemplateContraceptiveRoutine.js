export const lembretesDeRotina = {
    'anticoncepcional.rotina.inicioPausa': [
        'Início da pausa do anticoncepcional',
        (nome) =>
            `Hoje começa a pausa programada para ${nome}. Você pode conferir a agenda no Aloya.`
    ],
    'anticoncepcional.rotina.fimPausa': [
        'Fim da pausa do anticoncepcional',
        (nome) => `Hoje é o último dia da pausa de ${nome}. Confira no Aloya quando retomar o uso.`
    ],
    'anticoncepcional.rotina.retomada': [
        'Retomada do anticoncepcional',
        (nome) =>
            `Sua agenda indica que hoje é dia de retomar o uso de ${nome}. Confira o horário no Aloya.`
    ],
    'anticoncepcional.adesivo.troca': [
        'Troca do adesivo anticoncepcional',
        (nome) =>
            `Sua agenda indica a troca de ${nome} por um novo adesivo hoje, sem iniciar a pausa.`
    ],
    'anticoncepcional.adesivo.retirada': [
        'Retirada do adesivo anticoncepcional',
        (nome) =>
            `A retirada de ${nome} está programada para hoje e marca o início da pausa. Confira no Aloya quando retomar o uso.`
    ],
    'anticoncepcional.adesivo.novo': [
        'Novo adesivo anticoncepcional após a pausa',
        (nome) =>
            `A pausa programada terminou. Sua agenda indica que hoje é dia de colocar um novo ${nome}.`
    ]
};
