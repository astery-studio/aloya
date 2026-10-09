import { adicionarDias } from './utils/calendar.js';

function estimarFases({ inicioCiclo, fimMenstrual, proximoInicio, duracaoLutea }) {
    const inicioLutea = adicionarDias(proximoInicio, -duracaoLutea);
    const ovulacao = adicionarDias(inicioLutea, -1);

    if (fimMenstrual >= ovulacao) {
        return {
            fases: null,
            janelaFertil: null,
            motivo: 'INTERVALOS_DE_FASE_INCOMPATIVEIS'
        };
    }

    return {
        fases: {
            menstrual: { inicio: inicioCiclo, fim: fimMenstrual },
            folicularPosMenstrual: {
                inicio: adicionarDias(fimMenstrual, 1),
                fim: adicionarDias(ovulacao, -1)
            },
            ovulatoria: { data: ovulacao },
            lutea: {
                inicio: inicioLutea,
                fim: adicionarDias(proximoInicio, -1)
            }
        },
        janelaFertil: {
            inicio: adicionarDias(ovulacao, -5),
            fim: ovulacao
        },
        motivo: null
    };
}

export { estimarFases };
