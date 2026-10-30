//Busca somente os dados necessários para calendário e estado atual do ciclo.
import { CONFIG_PREVISAO } from '../../cycles/constants/prediction.config.js';

function validarDependencias(prisma) {
    const possuiUsuario = typeof prisma?.usuario?.findUnique === 'function';
    const possuiRegistroCiclo = typeof prisma?.registroCiclo?.findMany === 'function';

    if (!possuiUsuario || !possuiRegistroCiclo) {
        throw new TypeError('Não foi possível configurar o repositório do calendário.');
    }
}

function criarCalendarRepository({ prisma } = {}) {
    validarDependencias(prisma);

    function buscarUsuarioComCiclos(usuarioId, fimReferenciaExclusivo) {
        return prisma.usuario.findUnique({
            where: { id: usuarioId },
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
                        dataInicio: { lt: fimReferenciaExclusivo }
                    },
                    orderBy: [{ dataInicio: 'desc' }, { id: 'desc' }],
                    take: CONFIG_PREVISAO.maximoIntervalos + 1,
                    select: {
                        id: true,
                        dataInicio: true,
                        dataFim: true
                    }
                }
            }
        });
    }

    async function buscarDadosDoMes({ usuarioId, inicioMes, fimMesExclusivo }) {
        const intervaloData = {
            gte: inicioMes,
            lt: fimMesExclusivo
        };

        const [usuario, registrosDoMes, proximosCiclos] = await Promise.all([
            buscarUsuarioComCiclos(usuarioId, fimMesExclusivo),
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
            }),
            prisma.registroCiclo.findMany({
                where: {
                    usuarioId,
                    dataInicio: { gte: fimMesExclusivo }
                },
                orderBy: [{ dataInicio: 'asc' }, { id: 'asc' }],
                take: 1,
                select: {
                    id: true,
                    dataInicio: true,
                    dataFim: true
                }
            })
        ]);

        const diasMenstruacao = registrosDoMes.flatMap((registro) =>
            registro.diasMenstruacao.map(({ data }) => ({
                data,
                registroCicloId: registro.id
            }))
        );

        return {
            usuario,
            diasMenstruacao,
            proximoCicloReal: proximosCiclos[0] ?? null
        };
    }

    async function buscarDadosAtuais({ usuarioId, fimReferenciaExclusivo }) {
        return buscarUsuarioComCiclos(usuarioId, fimReferenciaExclusivo);
    }

    return {
        buscarDadosDoMes,
        buscarDadosAtuais
    };
}

export { criarCalendarRepository };
