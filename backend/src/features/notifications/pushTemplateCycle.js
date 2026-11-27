import { criarPredictionService } from '../cycles/services/prediction.service.js';

const fases = {
    folicular:
        'Seu ciclo entrou na fase folicular. Nesse período, os níveis de estrogênio começam a aumentar e pode ocorrer uma melhora gradual da disposição e da energia.',
    ovulatoria:
        'Você entrou na fase ovulatória! Nesse período, pode ocorrer aumento da libido, da secreção cervical e da disposição.',
    lutea: 'Seu ciclo entrou na fase lútea. É comum observar alterações no humor e mudanças na disposição.',
    menstrual:
        'Um novo ciclo começou! Durante a fase menstrual, podem ocorrer cólicas, cansaço e alterações no fluxo menstrual.'
};
const notaEducativa =
    'As informações são educativas. As manifestações podem variar de pessoa para pessoa e de ciclo para ciclo.';

function dataEmPortugues(data) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC'
    }).format(data);
}
export async function renderizarCiclo(prisma, aviso, agora) {
    const { evento, ocorrencia } = aviso;
    if (evento === 'ciclo.diario.lembrete')
        return {
            title: 'Que tal atualizar seu diário hoje?',
            body: 'Registre como você está se sentindo hoje e acompanhe as mudanças do seu ciclo. Seus registros ajudam a construir um histórico mais completo.'
        };
    if (evento === 'ciclo.menstrual.confirmacao') {
        return {
            title: 'Confirme o início do seu ciclo',
            body: 'A previsão indica que um novo ciclo pode começar hoje. Se a menstruação começou, registre a data no Aloya.'
        };
    }
    if (evento === 'ciclo.menstrual.proxima') {
        const previsao = await criarPredictionService({ prisma, agora: () => agora }).buscar(
            aviso.usuarioId
        );
        if (previsao.proximoInicioEstimado !== ocorrencia) return undefined;
        const data = dataEmPortugues(new Date(ocorrencia));
        const confiabilidade =
            previsao.confiabilidadeMenstrual.nivel === 'ALTA'
                ? 'Confiabilidade alta.'
                : 'Confiabilidade média/baixa. Esta data pode sofrer alterações.';
        return {
            title: 'Seu próximo ciclo está se aproximando',
            body: `A previsão indica início em ${data}. ${confiabilidade}`
        };
    }
    if (evento.startsWith('ciclo.fases.') || evento.startsWith('ciclo.dicas.')) {
        const fase = evento.split('.').at(-1);
        if (fases[fase])
            return {
                title: 'Uma nova fase do seu ciclo começou!',
                body: `${fases[fase]} ${fase === 'menstrual' ? '' : 'A fase é estimada. '}${notaEducativa}`
            };
    }
}
