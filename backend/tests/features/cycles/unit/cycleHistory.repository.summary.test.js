//Testa a consulta pequena e isolada usada pelo resumo do histórico.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarCycleHistoryRepository
} from '../../../../src/features/cycles/repositories/cycleHistory.repository.js';

function criarDependencias({registros = []} = {}) {
    const chamadas = [];

    const prisma = {
        registroCiclo: {
            async findMany(argumentos) {
                chamadas.push(argumentos);
                return registros;
            },

            async count() {
                return 0;
            }
        }
    };

    return {
        repository:
            criarCycleHistoryRepository({
                prisma
            }),
        chamadas
    };
}

test('busca somente sete registros recentes da conta autenticada', async () => {
    const registros = [{
        dataInicio:
            new Date(
                '2026-09-04T00:00:00.000Z'
            ),
        dataFim:
            new Date(
                '2026-09-08T00:00:00.000Z'
            ),
        duracaoMenstruacao: 5
    }];

    const {
        repository,
        chamadas
    } = criarDependencias({
        registros
    });

    const resultado =
        await repository.listarParaResumo(7);

    assert.deepEqual(
        resultado,
        registros
    );

    assert.deepEqual(
        chamadas[0],
        {
            where: {
                usuarioId: 7
            },
            orderBy: [
                {
                    dataInicio: 'desc'
                },
                {
                    id: 'desc'
                }
            ],
            take: 7,
            select: {
                dataInicio: true,
                dataFim: true,
                duracaoMenstruacao: true
            }
        }
    );
});

test('rejeita usuário inválido antes de consultar o banco', async () => {
    const {
        repository,
        chamadas
    } = criarDependencias();

    await assert.rejects(
        repository.listarParaResumo('7'),
        {
            name: 'TypeError',
            message:
                'O identificador da pessoa usuária é inválido.'
        }
    );

    assert.equal(
        chamadas.length,
        0
    );
});

test('rejeita resposta inesperada do banco', async () => {
    const prisma = {
        registroCiclo: {
            async findMany() {
                return null;
            },

            async count() {
                return 0;
            }
        }
    };

    const repository =
        criarCycleHistoryRepository({
            prisma
        });

    await assert.rejects(
        repository.listarParaResumo(7),
        {
            name: 'TypeError',
            message:
                'A consulta do resumo de ciclos retornou um resultado inválido.'
        }
    );
});