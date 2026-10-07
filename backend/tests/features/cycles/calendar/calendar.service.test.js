//Testa a montagem segura e compacta dos dados mensais do calendário.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCalendarService } from '../../../../src/features/cycles/calendar/calendar.service.js';

function criarRepository(resultado) {
    const chamadas = [];

    return {
        chamadas,
        async buscarDadosDoMes(argumentos) {
            chamadas.push(argumentos);
            return resultado;
        }
    };
}

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

test('rejeita configuração sem repositório válido', () => {
    for (const repository of [undefined, null, {}, {buscarDadosDoMes: true}]) {
        assert.throws(
            () => criarCalendarService({repository}),
            {
                name: 'TypeError',
                message: 'Não foi possível configurar o serviço do calendário.'
            }
        );
    }
});

test('rejeita sessão inválida antes de consultar o repositório', async () => {
    const repository = criarRepository();
    const service = criarCalendarService({repository});

    for (const usuarioId of [undefined, null, 0, -1, 1.5, '1']) {
        await assert.rejects(
            () => service.buscarMes({
                usuarioId,
                mes: '2026-10'
            }),
            {
                status: 401,
                codigo: 'SESSAO_INVALIDA'
            }
        );
    }

    assert.equal(repository.chamadas.length, 0);
});

test('rejeita mês inválido antes de consultar o repositório', async () => {
    const repository = criarRepository();
    const service = criarCalendarService({repository});

    await assert.rejects(
        () => service.buscarMes({
            usuarioId: 7,
            mes: '2026-13'
        }),
        {
            status: 422,
            codigo: 'MES_CALENDARIO_INVALIDO'
        }
    );

    assert.equal(repository.chamadas.length, 0);
});

test('consulta o mês usando limites UTC exclusivos', async () => {
    const repository = criarRepository({
        usuario: criarUsuario(),
        diasMenstruacao: []
    });
    const service = criarCalendarService({repository});

    await service.buscarMes({
        usuarioId: 7,
        mes: '2026-10'
    });

    assert.equal(repository.chamadas.length, 1);
    assert.equal(repository.chamadas[0].usuarioId, 7);
    assert.equal(
        repository.chamadas[0].inicioMes.toISOString(),
        '2026-10-01T00:00:00.000Z'
    );
    assert.equal(
        repository.chamadas[0].fimMesExclusivo.toISOString(),
        '2026-11-01T00:00:00.000Z'
    );
});

test('não revela se a identidade autenticada não possui conta', async () => {
    const repository = criarRepository({
        usuario: null,
        diasMenstruacao: []
    });
    const service = criarCalendarService({repository});

    await assert.rejects(
        () => service.buscarMes({
            usuarioId: 999,
            mes: '2026-10'
        }),
        {
            status: 404,
            codigo: 'USUARIO_NAO_ENCONTRADO'
        }
    );
});

test('retorna estado vazio somente quando a conta não possui ciclos', async () => {
    const repository = criarRepository({
        usuario: criarUsuario(),
        diasMenstruacao: []
    });
    const service = criarCalendarService({repository});

    const resultado = await service.buscarMes({
        usuarioId: 4,
        mes: '2026-10'
    });

    assert.deepEqual(resultado, {
        mes: '2026-10',
        possuiCiclos: false,
        diasMenstruacao: [],
        previsao: null
    });
});

test('não mostra estado vazio quando existem ciclos fora do mês solicitado', async () => {
    const repository = criarRepository({
        usuario: criarUsuario({
            quantidadeCiclos: 2
        }),
        diasMenstruacao: []
    });
    const service = criarCalendarService({repository});

    const resultado = await service.buscarMes({
        usuarioId: 4,
        mes: '2020-01'
    });

    assert.deepEqual(resultado, {
        mes: '2020-01',
        possuiCiclos: true,
        diasMenstruacao: [],
        previsao: null
    });
});

test('normaliza dias menstruais e mantém o ciclo disponível para edição', async () => {
    const repository = criarRepository({
        usuario: criarUsuario({
            quantidadeCiclos: 1,
            registrosCiclo: [
                {
                    id: 18,
                    dataInicio: new Date('2026-10-01T00:00:00.000Z'),
                    dataFim: new Date('2026-10-05T00:00:00.000Z')
                }
            ]
        }),
        diasMenstruacao: [
            {
                data: new Date('2026-10-03T00:00:00.000Z'),
                registroCicloId: 18
            },
            {
                data: new Date('2026-10-01T00:00:00.000Z'),
                registroCicloId: 18
            },
            {
                data: new Date('2026-10-01T00:00:00.000Z'),
                registroCicloId: 18
            }
        ]
    });
    const service = criarCalendarService({repository});

    const resultado = await service.buscarMes({
        usuarioId: 4,
        mes: '2026-10'
    });

    assert.deepEqual(resultado.diasMenstruacao, [
        {
            data: '2026-10-01',
            registroCicloId: 18
        },
        {
            data: '2026-10-03',
            registroCicloId: 18
        }
    ]);
});

test('recorta as fases e previsões para o mês solicitado', async () => {
    const repository = criarRepository({
        usuario: criarUsuario({
            quantidadeCiclos: 2,
            registrosCiclo: [
                {
                    id: 2,
                    dataInicio: new Date('2026-09-29T00:00:00.000Z'),
                    dataFim: new Date('2026-10-03T00:00:00.000Z')
                },
                {
                    id: 1,
                    dataInicio: new Date('2026-09-01T00:00:00.000Z'),
                    dataFim: new Date('2026-09-05T00:00:00.000Z')
                }
            ]
        }),
        diasMenstruacao: []
    });
    const service = criarCalendarService({repository});

    const resultado = await service.buscarMes({
        usuarioId: 4,
        mes: '2026-10'
    });

    assert.deepEqual(resultado.previsao, {
        status: 'PREVISAO_ULTRAPASSADA',
        nivelConfianca: 'BAIXA',
        faseMenstrual: {
            inicio: '2026-10-01',
            fim: '2026-10-03'
        },
        faseFolicular: {
            inicio: '2026-10-04',
            fim: '2026-10-11'
        },
        ovulacao: '2026-10-12',
        faseLutea: {
            inicio: '2026-10-13',
            fim: '2026-10-26'
        },
        janelaFertil: {
            inicio: '2026-10-07',
            fim: '2026-10-12'
        },
        menstruacaoPrevista: {
            inicio: '2026-10-27',
            fim: '2026-10-31'
        },
        versaoAlgoritmo: '1.0.0'
    });
});

test('rejeita dados internos inconsistentes em vez de mascarar a falha', async () => {
    const repository = criarRepository({
        usuario: {
            ...criarUsuario(),
            _count: {
                registrosCiclo: -1
            }
        },
        diasMenstruacao: []
    });
    const service = criarCalendarService({repository});

    await assert.rejects(
        () => service.buscarMes({
            usuarioId: 4,
            mes: '2026-10'
        }),
        {
            name: 'TypeError',
            message: 'Os dados do calendário são inválidos.'
        }
    );
});