import { calcularIdade } from '../../shared/utils/date.utils.js';
import { criarPredictionService } from '../cycles/services/prediction.service.js';
import { dataHoraNoFuso } from '../contraceptives/validators/contraceptiveUsage.validator.js';
import { diaMs, somarDias } from './notificationPlanningContext.js';
import { permiteNotificacao } from './notificationEvents.service.js';

const evento = 'redeApoio.dicas.apoio';

export async function agendarDicasCompartilhadas({
    prisma,
    vinculo,
    permissoes,
    preferencia,
    agora,
    hoje,
    fuso,
    usuarioId,
    inserir
}) {
    if (!permissoes.includes('geral.dicas') || !permiteNotificacao(preferencia, evento)) return;

    const idade = calcularIdade(vinculo.titular.dataNascimento, agora);
    if (
        idade === null ||
        (idade < 16 && vinculo.titular.consentimentoParental?.statusConsentimento !== 'liberado')
    )
        return;

    const previsao = await criarPredictionService({
        prisma,
        agora: () => new Date(`${hoje}T12:00:00Z`)
    }).buscar(vinculo.titularId);
    const fases = previsao.fasesEstimadas;
    const inicioCiclo = fases?.menstrual?.inicio;
    if (!inicioCiclo) return;

    const horizonte = somarDias(hoje, 7);

    for (const [chave, datas] of Object.entries(fases)) {
        const fase = chave === 'folicularPosMenstrual' ? 'folicular' : chave;
        const inicio = datas.inicio ?? datas.data;
        const fim = datas.fim ?? inicio;
        const dia = inicio === fim ? inicio : somarDias(inicio, 1);
        if (dia < hoje || dia > horizonte || dia > fim) continue;

        const dataHoraProgramada = dataHoraNoFuso(dia, '20:00', fuso);
        if (!dataHoraProgramada) continue;

        inserir({
            usuarioId,
            evento,
            tipoOrigem: 'rede_apoio',
            origemId: vinculo.id,
            ocorrencia: `${vinculo.id}:${fase}:${inicioCiclo}`,
            dataHoraProgramada,
            expiraEm:
                dataHoraNoFuso(somarDias(dia, 1), '00:00', fuso) ??
                new Date(+dataHoraProgramada + diaMs)
        });
    }
}
