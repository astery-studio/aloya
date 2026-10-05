import { formatarData } from './prediction.calendar.js';
import { calcularPrevisao } from './prediction.js';
import { CONFIG_PREVISAO } from './prediction.config.js';

function criarPredictionService({ prisma, agora = () => new Date() }) {
    async function buscar(usuarioId) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                duracaoCicloInformada: true,
                duracaoMenstruacaoInformada: true,
                duracaoLuteaInformada: true,
                registrosCiclo: {
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
        const instanteGeracao = agora();
        const dataReferencia = formatarData(instanteGeracao);

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
