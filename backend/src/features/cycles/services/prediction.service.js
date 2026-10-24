import { formatarData } from '../utils/calendar.js';
import { calcularPrevisao } from '../utils/prediction.js';
import { CONFIG_PREVISAO } from '../constants/prediction.config.js';

function criarPredictionService({ prisma, agora = () => new Date() }) {
    async function buscar(usuarioId) {
        const instanteGeracao = agora();
        const dataReferencia = formatarData(instanteGeracao);
        const fimDataReferencia = new Date(`${dataReferencia}T23:59:59.999Z`);
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                duracaoCicloInformada: true,
                duracaoMenstruacaoInformada: true,
                duracaoLuteaInformada: true,
                registrosCiclo: {
                    where: {
                        dataInicio: { lte: fimDataReferencia }
                    },
                    orderBy: { dataInicio: 'desc' },
                    take: CONFIG_PREVISAO.maximoIntervalos + 1,
                    select: {
                        dataInicio: true,
                        dataFim: true
                    }
                }
            }
        });

        if (!usuario) {
            const erro = new Error('Usuário não encontrado.');
            erro.status = 404;
            erro.codigo = 'USUARIO_NAO_ENCONTRADO';
            throw erro;
        }

        const { registrosCiclo: registros, ...parametros } = usuario;
        return {
            ...calcularPrevisao({
                registros,
                parametros,
                dataReferencia
            }),
            dataGeracao: instanteGeracao.toISOString()
        };
    }

    return { buscar };
}

export { criarPredictionService };
