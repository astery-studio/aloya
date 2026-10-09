//Testa dia, fase e próxima previsão exibidos na Home.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCurrentCycleService } from '../../../../src/features/calendar/services/calendar.current.service.js';

const agora = () => new Date('2026-10-10T15:00:00.000Z');

function criarUsuario({
    quantidadeCiclos = 0,
    registrosCiclo = []
} = {}) {
    return {
        duracaoCicloInformada: null,
        duracaoMenstruacaoInformada: null,
        duracaoLuteaInformada: 14,
        _count: {
            registrosCiclo: quantidadeCiclos
        },
        registrosCiclo
    };
}

function criarRepository(usuario) {
    const chamadas = [];

    return {
        chamadas,
        async buscarDadosAtuais(argumentos) {
            chamadas.push(argumentos);
            return usuario;
        }
    };
}

test('rejeita dependências inválidas', () => {
    const repository = criarRepository(null);

    assert.throws(
        () => criarCurrentCycleService(),
        {
            name: 'TypeError',
            message: 'Não foi possível configurar o estado atual do ciclo.'
        }
    );

    assert.throws(
        () => criarCurrentCycleService({
            repository,
            agora: null
        }),
        {
            name: 'TypeError',
            message: 'Não foi possível configurar o estado atual do ciclo.'
        }
    );
});

test('rejeita sessão inválida antes de consultar o repositório', async () => {
    const repository = criarRepository(null);
    const service = criarCurrentCycleService({
        repository,
        agora
    });

    for (const usuarioId of [undefined, null, 0, -1, 1.5, '1']) {
        await assert.rejects(
            () => service.buscarEstadoAtual({
                usuarioId
            }),
            {
                status: 401,
                codigo: 'SESSAO_INVALIDA'
            }
        );
    }

    assert.equal(repository.chamadas.length, 0);
});

test('consulta somente ciclos iniciados até o fim do dia atual', async () => {
    const repository = criarRepository(
        criarUsuario()
    );
    const service = criarCurrentCycleService({
        repository,
        agora
    });

    await service.buscarEstadoAtual({
        usuarioId: 7
    });

    assert.equal(repository.chamadas.length, 1);
    assert.equal(
        repository.chamadas[0].usuarioId,
        7
    );
    assert.equal(
        repository.chamadas[0].fimReferenciaExclusivo.toISOString(),
        '2026-10-11T00:00:00.000Z'
    );
});

test('rejeita conta inexistente', async () => {
    const service = criarCurrentCycleService({
        repository: criarRepository(null),
        agora
    });

    await assert.rejects(
        () => service.buscarEstadoAtual({
            usuarioId: 999
        }),
        {
            status: 404,
            codigo: 'USUARIO_NAO_ENCONTRADO'
        }
    );
});

test('omite fase e previsões quando não existem ciclos', async () => {
    const service = criarCurrentCycleService({
        repository: criarRepository(
            criarUsuario()
        ),
        agora
    });

    const resultado = await service.buscarEstadoAtual({
        usuarioId: 7
    });

    assert.deepEqual(resultado, {
        possuiCiclos: false,
        dataReferencia: '2026-10-10',
        diaDoCiclo: null,
        faseAtual: null,
        estaNaJanelaFertil: false,
        proximoInicioEstimado: null,
        nivelConfianca: null,
        statusPrevisao: null
    });
});

test('diferencia conta com ciclos de data anterior ao primeiro registro', async () => {
    const service = criarCurrentCycleService({
        repository: criarRepository(
            criarUsuario({
                quantidadeCiclos: 2
            })
        ),
        agora
    });

    const resultado = await service.buscarEstadoAtual({
        usuarioId: 7
    });

    assert.deepEqual(resultado, {
        possuiCiclos: true,
        dataReferencia: '2026-10-10',
        diaDoCiclo: null,
        faseAtual: null,
        estaNaJanelaFertil: false,
        proximoInicioEstimado: null,
        nivelConfianca: null,
        statusPrevisao: null
    });
});

test('calcula dia, fase, janela fértil e próxima menstruação', async () => {
    const service = criarCurrentCycleService({
        repository: criarRepository(
            criarUsuario({
                quantidadeCiclos: 2,
                registrosCiclo: [
                    {
                        id: 2,
                        dataInicio: new Date(
                            '2026-09-29T00:00:00.000Z'
                        ),
                        dataFim: new Date(
                            '2026-10-03T00:00:00.000Z'
                        )
                    },
                    {
                        id: 1,
                        dataInicio: new Date(
                            '2026-09-01T00:00:00.000Z'
                        ),
                        dataFim: new Date(
                            '2026-09-05T00:00:00.000Z'
                        )
                    }
                ]
            })
        ),
        agora
    });

    const resultado = await service.buscarEstadoAtual({
        usuarioId: 7
    });

    assert.deepEqual(resultado, {
        possuiCiclos: true,
        dataReferencia: '2026-10-10',
        diaDoCiclo: 12,
        faseAtual: 'FOLICULAR',
        estaNaJanelaFertil: true,
        proximoInicioEstimado: '2026-10-27',
        nivelConfianca: 'BAIXA',
        statusPrevisao: 'DISPONIVEL'
    });
});

test('rejeita contagem interna inconsistente', async () => {
    const usuario = criarUsuario();

    usuario._count.registrosCiclo = -1;

    const service = criarCurrentCycleService({
        repository: criarRepository(usuario),
        agora
    });

    await assert.rejects(
        () => service.buscarEstadoAtual({
            usuarioId: 7
        }),
        {
            name: 'TypeError',
            message: 'Os dados do ciclo atual são inválidos.'
        }
    );
});
