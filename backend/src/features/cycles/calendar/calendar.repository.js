//Busca somente os dados necessários para montar um mês do calendário.
import { CONFIG_PREVISAO } from '../prediction.config.js';

function validarDependencias(prisma) {
    const possuiUsuario = typeof prisma?.usuario?.findUnique === 'function';
    const possuiRegistroCiclo = typeof prisma?.registroCiclo?.findMany === 'function';

    if (!possuiUsuario || !possuiRegistroCiclo) {
        throw new TypeError('Não foi possível configurar o repositório do calendário.');
    }
}

function criarCalendarRepository({prisma} = {}) {
    validarDependencias(prisma);

    async function buscarDadosDoMes({usuarioId, inicioMes, fimMesExclusivo}) {
        const intervaloData = {
            gte: inicioMes,
            lt: fimMesExclusivo
        };

        const [usuario, registrosDoMes] = await Promise.all([
            prisma.usuario.findUnique({
                where: {id: usuarioId},
                select: {
                    duracaoCicloInformada: true,
                    duracaoMenstruacaoInformada: true,
                    duracaoLuteaInformada: true,
                    _count: {
                        select: {
                            registrosCiclo: true
                        }
                    },
                    registrosCiclo: {
                        where: {
                            dataInicio: {lt: fimMesExclusivo}
                        },
                        orderBy: [
                            {dataInicio: 'desc'},
                            {id: 'desc'}
                        ],
                        take: CONFIG_PREVISAO.maximoIntervalos + 1,
                        select: {
                            id: true,
                            dataInicio: true,
                            dataFim: true
                        }
                    }
                }
            }),
            prisma.registroCiclo.findMany({
                where: {
                    usuarioId,
                    diasMenstruacao: {
                        some: {
                            data: intervaloData
                        }
                    }
                },
                orderBy: {
                    dataInicio: 'asc'
                },
                select: {
                    id: true,
                    diasMenstruacao: {
                        where: {
                            data: intervaloData
                        },
                        orderBy: {
                            data: 'asc'
                        },
                        select: {
                            data: true
                        }
                    }
                }
            })
        ]);

        const diasMenstruacao = registrosDoMes.flatMap((registro) => (
            registro.diasMenstruacao.map(({data}) => ({
                data,
                registroCicloId: registro.id
            }))
        ));

        return {
            usuario,
            diasMenstruacao
        };
    }

    return {buscarDadosDoMes};
}

export { criarCalendarRepository };