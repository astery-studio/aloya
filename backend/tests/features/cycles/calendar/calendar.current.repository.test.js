//Testa a consulta enxuta usada para mostrar o estado atual na Home.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCalendarRepository } from '../../../../src/features/cycles/calendar/calendar.repository.js';

test('busca o estado atual sem consultar os dias do calendário', async () => {
    const chamadas = {
        usuario: [],
        registrosCiclo: []
    };
    const usuario = {
        duracaoCicloInformada: 28,
        duracaoMenstruacaoInformada: 5,
        duracaoLuteaInformada: 14,
        _count: {
            registrosCiclo: 3
        },
        registrosCiclo: []
    };
    const prisma = {
        usuario: {
            async findUnique(argumentos) {
                chamadas.usuario.push(argumentos);
                return usuario;
            }
        },
        registroCiclo: {
            async findMany(argumentos) {
                chamadas.registrosCiclo.push(argumentos);
                return [];
            }
        }
    };
    const repository = criarCalendarRepository({prisma});
    const fimReferenciaExclusivo = new Date(
        '2026-10-08T00:00:00.000Z'
    );

    const resultado = await repository.buscarDadosAtuais({
        usuarioId: 9,
        fimReferenciaExclusivo
    });

    assert.equal(resultado, usuario);
    assert.equal(chamadas.usuario.length, 1);
    assert.equal(chamadas.registrosCiclo.length, 0);
    assert.deepEqual(chamadas.usuario[0], {
        where: {id: 9},
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
                    dataInicio: {
                        lt: fimReferenciaExclusivo
                    }
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

test('devolve null quando a conta autenticada não existe', async () => {
    const prisma = {
        usuario: {
            async findUnique() {
                return null;
            }
        },
        registroCiclo: {
            async findMany() {
                assert.fail(
                    'A consulta mensal não deveria ser executada.'
                );
            }
        }
    };
    const repository = criarCalendarRepository({prisma});

    const resultado = await repository.buscarDadosAtuais({
        usuarioId: 999,
        fimReferenciaExclusivo: new Date(
            '2026-10-08T00:00:00.000Z'
        )
    });

    assert.equal(resultado, null);
});