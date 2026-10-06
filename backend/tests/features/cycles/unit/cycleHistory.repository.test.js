//Testa o isolamento por conta, a ordenação e a paginação do repositório de ciclos.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarCycleHistoryRepository
} from '../../../../src/features/cycles/cycleHistory.repository.js';

import {
    decodificarCursorHistorico
} from '../../../../src/features/cycles/cycleHistory.validator.js';

const dataMaisRecente =
    new Date('2026-09-04T00:00:00.000Z');

const dataIntermediaria =
    new Date('2026-08-07T00:00:00.000Z');

const dataMaisAntiga =
    new Date('2026-07-08T00:00:00.000Z');

//Cria um registro compatível com os campos selecionados pelo repositório.
function criarRegistro({
    id,
    dataInicio
}) {
    return {
        id,
        dataInicio,
        dataFim:
            new Date(dataInicio.getTime() + 345600000),
        duracaoMenstruacao: 5,
        duracaoCiclo: 28,
        classificacao: 'normal',
        ehCicloInicial: false
    };
}

//Cria um Prisma controlado e registra todas as consultas realizadas.
function criarDependencias({
    registros = [],
    erro
} = {}) {
    const chamadas = [];

    const prisma = {
        registroCiclo: {
            async findMany(argumentos) {
                chamadas.push(argumentos);

                if (erro) {
                    throw erro;
                }

                return registros;
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

test('consulta somente os ciclos da conta autenticada', async () => {
    const {
        repository,
        chamadas
    } = criarDependencias();

    await repository.listarPagina({
        usuarioId: 7,
        limite: 20
    });

    assert.deepEqual(
        chamadas[0].where,
        {
            usuarioId: 7
        }
    );

    assert.equal(
        'usuarioId' in chamadas[0].select,
        false
    );
});

test('ordena por data e id em ordem decrescente', async () => {
    const {
        repository,
        chamadas
    } = criarDependencias();

    await repository.listarPagina({
        usuarioId: 7,
        limite: 20
    });

    assert.deepEqual(
        chamadas[0].orderBy,
        [
            {
                dataInicio: 'desc'
            },
            {
                id: 'desc'
            }
        ]
    );
});

test('seleciona somente os campos necessários', async () => {
    const {
        repository,
        chamadas
    } = criarDependencias();

    await repository.listarPagina({
        usuarioId: 7,
        limite: 20
    });

    assert.deepEqual(
        chamadas[0].select,
        {
            id: true,
            dataInicio: true,
            dataFim: true,
            duracaoMenstruacao: true,
            duracaoCiclo: true,
            classificacao: true,
            ehCicloInicial: true
        }
    );
});

test('busca somente um registro adicional para detectar próxima página', async () => {
    const {
        repository,
        chamadas
    } = criarDependencias();

    await repository.listarPagina({
        usuarioId: 7,
        limite: 20
    });

    assert.equal(
        chamadas[0].take,
        21
    );
});

test('remove o registro adicional da resposta', async () => {
    const registros = [
        criarRegistro({
            id: 3,
            dataInicio: dataMaisRecente
        }),
        criarRegistro({
            id: 2,
            dataInicio: dataIntermediaria
        }),
        criarRegistro({
            id: 1,
            dataInicio: dataMaisAntiga
        })
    ];

    const {
        repository
    } = criarDependencias({
        registros
    });

    const resultado =
        await repository.listarPagina({
            usuarioId: 7,
            limite: 2
        });

    assert.deepEqual(
        resultado.registros,
        registros.slice(0, 2)
    );

    assert.equal(
        resultado.temMais,
        true
    );
});

test('cria o próximo cursor a partir do último item devolvido', async () => {
    const registros = [
        criarRegistro({
            id: 3,
            dataInicio: dataMaisRecente
        }),
        criarRegistro({
            id: 2,
            dataInicio: dataIntermediaria
        }),
        criarRegistro({
            id: 1,
            dataInicio: dataMaisAntiga
        })
    ];

    const {
        repository
    } = criarDependencias({
        registros
    });

    const resultado =
        await repository.listarPagina({
            usuarioId: 7,
            limite: 2
        });

    assert.deepEqual(
        decodificarCursorHistorico(
            resultado.proximoCursor
        ),
        {
            dataInicio: dataIntermediaria,
            id: 2
        }
    );
});

test('não cria próximo cursor quando a página é final', async () => {
    const registros = [
        criarRegistro({
            id: 1,
            dataInicio: dataMaisAntiga
        })
    ];

    const {
        repository
    } = criarDependencias({
        registros
    });

    const resultado =
        await repository.listarPagina({
            usuarioId: 7,
            limite: 20
        });

    assert.equal(
        resultado.temMais,
        false
    );

    assert.equal(
        resultado.proximoCursor,
        null
    );
});

test('devolve página vazia sem criar cursor', async () => {
    const {
        repository
    } = criarDependencias();

    const resultado =
        await repository.listarPagina({
            usuarioId: 7,
            limite: 20
        });

    assert.deepEqual(
        resultado,
        {
            registros: [],
            temMais: false,
            proximoCursor: null
        }
    );
});

test('aplica data e id do cursor sem remover o filtro da conta', async () => {
    const {
        repository,
        chamadas
    } = criarDependencias();

    await repository.listarPagina({
        usuarioId: 7,
        limite: 20,
        cursor: {
            dataInicio: dataIntermediaria,
            id: 2
        }
    });

    assert.deepEqual(
        chamadas[0].where,
        {
            usuarioId: 7,
            OR: [
                {
                    dataInicio: {
                        lt: dataIntermediaria
                    }
                },
                {
                    dataInicio:
                        dataIntermediaria,
                    id: {
                        lt: 2
                    }
                }
            ]
        }
    );
});

test('rejeita identificador de usuário inválido antes do banco', async () => {
    const {
        repository,
        chamadas
    } = criarDependencias();

    await assert.rejects(
        repository.listarPagina({
            usuarioId: '7',
            limite: 20
        }),
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

test('rejeita limite interno inválido antes do banco', async () => {
    const {
        repository,
        chamadas
    } = criarDependencias();

    await assert.rejects(
        repository.listarPagina({
            usuarioId: 7,
            limite: 51
        }),
        {
            name: 'TypeError',
            message:
                'O limite interno da página é inválido.'
        }
    );

    assert.equal(
        chamadas.length,
        0
    );
});

test('rejeita cursor interno inválido antes do banco', async () => {
    const {
        repository,
        chamadas
    } = criarDependencias();

    await assert.rejects(
        repository.listarPagina({
            usuarioId: 7,
            limite: 20,
            cursor: {
                dataInicio: '2026-08-07',
                id: 2
            }
        }),
        {
            name: 'TypeError',
            message:
                'O cursor interno da página é inválido.'
        }
    );

    assert.equal(
        chamadas.length,
        0
    );
});

test('propaga falha do banco sem substituí-la', async () => {
    const erroDoBanco =
        new Error('Falha simulada no banco.');

    const {
        repository
    } = criarDependencias({
        erro: erroDoBanco
    });

    await assert.rejects(
        repository.listarPagina({
            usuarioId: 7,
            limite: 20
        }),
        erroDoBanco
    );
});

test('rejeita Prisma sem a operação necessária', () => {
    assert.throws(
        () => criarCycleHistoryRepository({
            prisma: {}
        }),
        {
            name: 'TypeError',
            message:
                'O Prisma do histórico de ciclos é inválido.'
        }
    );
});

test('rejeita retorno inesperado do Prisma', async () => {
    const {
        repository
    } = criarDependencias({
        registros: null
    });

    await assert.rejects(
        repository.listarPagina({
            usuarioId: 7,
            limite: 20
        }),
        {
            name: 'TypeError',
            message:
                'A consulta do histórico retornou um resultado inválido.'
        }
    );
});