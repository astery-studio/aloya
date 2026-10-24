//Testa as consultas enxutas e isoladas por usuária usadas pelo calendário.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCalendarRepository } from '../../../../src/features/calendar/repositories/calendar.repository.js';

const inicioMes = new Date('2026-10-01T00:00:00.000Z');
const fimMesExclusivo = new Date('2026-11-01T00:00:00.000Z');

function criarPrisma({usuario = null, registrosDoMes = []} = {}) {
    const chamadas = {
        usuario: [],
        registrosCiclo: []
    };

    return {
        chamadas,
        usuario: {
            async findUnique(argumentos) {
                chamadas.usuario.push(argumentos);
                return usuario;
            }
        },
        registroCiclo: {
            async findMany(argumentos) {
                chamadas.registrosCiclo.push(argumentos);
                return registrosDoMes;
            }
        }
    };
}

test('rejeita configuração sem as operações obrigatórias do Prisma', () => {
    for (const prisma of [undefined, null, {}, {usuario: {findUnique() {}}}]) {
        assert.throws(
            () => criarCalendarRepository({prisma}),
            {
                name: 'TypeError',
                message: 'Não foi possível configurar o repositório do calendário.'
            }
        );
    }
});

test('busca somente os parâmetros, a contagem e sete ciclos necessários', async () => {
    const usuario = {
        duracaoCicloInformada: 28,
        duracaoMenstruacaoInformada: 5,
        duracaoLuteaInformada: 14,
        _count: {
            registrosCiclo: 2
        },
        registrosCiclo: []
    };
    const prisma = criarPrisma({usuario});
    const repository = criarCalendarRepository({prisma});

    await repository.buscarDadosDoMes({
        usuarioId: 12,
        inicioMes,
        fimMesExclusivo
    });

    assert.equal(prisma.chamadas.usuario.length, 1);
    assert.deepEqual(prisma.chamadas.usuario[0], {
        where: {id: 12},
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
                take: 7,
                select: {
                    id: true,
                    dataInicio: true,
                    dataFim: true
                }
            }
        }
    });
});

test('filtra os dias menstruais pela usuária autenticada e pelo mês', async () => {
    const prisma = criarPrisma();
    const repository = criarCalendarRepository({prisma});

    await repository.buscarDadosDoMes({
        usuarioId: 27,
        inicioMes,
        fimMesExclusivo
    });

    assert.equal(prisma.chamadas.registrosCiclo.length, 1);
    assert.deepEqual(prisma.chamadas.registrosCiclo[0], {
        where: {
            usuarioId: 27,
            diasMenstruacao: {
                some: {
                    data: {
                        gte: inicioMes,
                        lt: fimMesExclusivo
                    }
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
                    data: {
                        gte: inicioMes,
                        lt: fimMesExclusivo
                    }
                },
                orderBy: {
                    data: 'asc'
                },
                select: {
                    data: true
                }
            }
        }
    });
});

test('apresenta os dias do mês com o identificador do ciclo editável', async () => {
    const prisma = criarPrisma({
        usuario: {
            duracaoCicloInformada: 28,
            duracaoMenstruacaoInformada: 5,
            duracaoLuteaInformada: 14,
            _count: {
                registrosCiclo: 2
            },
            registrosCiclo: []
        },
        registrosDoMes: [
            {
                id: 18,
                diasMenstruacao: [
                    {data: new Date('2026-10-01T00:00:00.000Z')},
                    {data: new Date('2026-10-02T00:00:00.000Z')}
                ]
            },
            {
                id: 19,
                diasMenstruacao: [
                    {data: new Date('2026-10-29T00:00:00.000Z')}
                ]
            }
        ]
    });
    const repository = criarCalendarRepository({prisma});

    const resultado = await repository.buscarDadosDoMes({
        usuarioId: 8,
        inicioMes,
        fimMesExclusivo
    });

    assert.deepEqual(resultado.diasMenstruacao, [
        {
            data: new Date('2026-10-01T00:00:00.000Z'),
            registroCicloId: 18
        },
        {
            data: new Date('2026-10-02T00:00:00.000Z'),
            registroCicloId: 18
        },
        {
            data: new Date('2026-10-29T00:00:00.000Z'),
            registroCicloId: 19
        }
    ]);
});

test('retorna uma coleção vazia quando o mês não possui menstruação registrada', async () => {
    const prisma = criarPrisma({
        usuario: {
            duracaoCicloInformada: null,
            duracaoMenstruacaoInformada: null,
            duracaoLuteaInformada: 14,
            _count: {
                registrosCiclo: 1
            },
            registrosCiclo: []
        }
    });
    const repository = criarCalendarRepository({prisma});

    const resultado = await repository.buscarDadosDoMes({
        usuarioId: 3,
        inicioMes,
        fimMesExclusivo
    });

    assert.deepEqual(resultado.diasMenstruacao, []);
    assert.equal(resultado.usuario._count.registrosCiclo, 1);
});
