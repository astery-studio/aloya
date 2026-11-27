import { AppError } from '../../../shared/errors/AppError.js';
import { CONFIG_PREVISAO } from '../../cycles/constants/prediction.config.js';
import { adicionarDias, paraDataCalendario } from '../../cycles/utils/calendar.js';
import { obterFaseNaData } from '../../cycles/utils/phase.js';
import { calcularPrevisao } from '../../cycles/utils/prediction.js';

function criarDiaryPhaseService({ prisma } = {}) {
    if (!prisma?.usuario?.findUnique) {
        throw new TypeError('Não foi possível configurar a fase do Diário.');
    }

    async function resolver(usuarioId, dataReferencia, cliente = prisma) {
        const usuario = await cliente.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                duracaoCicloInformada: true,
                duracaoMenstruacaoInformada: true,
                duracaoLuteaInformada: true,
                registrosCiclo: {
                    where: {
                        dataInicio: { lt: paraDataCalendario(adicionarDias(dataReferencia, 1)) }
                    },
                    orderBy: [{ dataInicio: 'desc' }, { id: 'desc' }],
                    take: CONFIG_PREVISAO.maximoIntervalos + 1,
                    select: {
                        dataInicio: true,
                        dataFim: true,
                        duracaoMenstruacao: true
                    }
                }
            }
        });

        if (!usuario) {
            throw new AppError('Usuário não encontrado.', 404, 'USUARIO_NAO_ENCONTRADO');
        }

        const { registrosCiclo, ...parametros } = usuario;
        if (registrosCiclo.length === 0) return null;

        const previsao = calcularPrevisao({
            registros: registrosCiclo,
            parametros,
            dataReferencia
        });
        const fase = obterFaseNaData(previsao, dataReferencia);

        return fase?.toLowerCase() ?? null;
    }

    return { resolver };
}

export { criarDiaryPhaseService };
