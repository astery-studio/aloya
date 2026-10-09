//Testa a sincronização de notificações futuras sem alterar alertas iniciados.
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    calcularProximaNotificacao,
    sincronizarNotificacoesEdicao
} from '../../../../src/features/contraceptives/utils/contraceptive.notifications.js';

const agora = new Date('2026-10-02T07:00:00.000Z');

//Cria o registro atual armazenado no banco.
function criarRegistroAtual(alteracoes = {}) {
    return {
        tipo: 'pilula',
        horariosProgramados: ['08:00'],
        frequencia: 'uso_continuo',
        dataInicioUso: new Date('2026-09-01T00:00:00.000Z'),
        periodosPausa: [],
        dataValidade: null,
        nivelIntensidadeAlerta: 'critico',
        ...alteracoes
    };
}

//Cria os novos dados normalizados que serão persistidos.
function criarDadosNovos(alteracoes = {}) {
    return {
        nome: 'Mercilon',
        tipo: 'pilula',
        horariosProgramados: ['08:00'],
        frequencia: 'uso_continuo',
        dataInicioUso: new Date('2026-09-01T00:00:00.000Z'),
        periodosPausa: [],
        dataValidade: null,
        nivelIntensidadeAlerta: 'critico',
        ...alteracoes
    };
}

//Cria uma transação falsa e registra alterações feitas nas notificações.
function criarTransacao() {
    const chamadas = [];

    return {
        chamadas,
        notificacao: {
            async updateMany(argumentos) {
                chamadas.push({
                    operacao: 'updateMany',
                    argumentos
                });

                return {count: 1};
            },

            async create(argumentos) {
                chamadas.push({
                    operacao: 'create',
                    argumentos
                });

                return {
                    id: 1,
                    ...argumentos.data
                };
            }
        }
    };
}

test('não acessa notificações quando somente o nome muda', async () => {
    const transacao = criarTransacao();

    await sincronizarNotificacoesEdicao({
        transacao,
        usuarioId: 7,
        anticoncepcionalId: 3,
        registroAtual: criarRegistroAtual(),
        dadosNovos: criarDadosNovos({
            nome: 'Novo nome'
        }),
        agora
    });

    assert.deepEqual(transacao.chamadas, []);
});

test('altera somente a intensidade das notificações futuras não disparadas', async () => {
    const transacao = criarTransacao();

    await sincronizarNotificacoesEdicao({
        transacao,
        usuarioId: 7,
        anticoncepcionalId: 3,
        registroAtual: criarRegistroAtual(),
        dadosNovos: criarDadosNovos({
            nivelIntensidadeAlerta: 'moderado'
        }),
        agora
    });

    assert.equal(transacao.chamadas.length, 1);
    assert.equal(transacao.chamadas[0].operacao, 'updateMany');
    assert.deepEqual(transacao.chamadas[0].argumentos.where, {
        usuarioId: 7,
        tipoOrigem: 'anticoncepcional',
        origemId: 3,
        statusEnvio: 'agendada',
        dataHoraDisparo: null,
        dataHoraProgramada: {
            gt: agora
        }
    });
    assert.deepEqual(transacao.chamadas[0].argumentos.data, {
        intensidadeAlerta: 'moderado'
    });
});

test('cancela a agenda futura antiga e cria a próxima notificação', async () => {
    const transacao = criarTransacao();

    await sincronizarNotificacoesEdicao({
        transacao,
        usuarioId: 7,
        anticoncepcionalId: 3,
        registroAtual: criarRegistroAtual(),
        dadosNovos: criarDadosNovos({
            horariosProgramados: ['09:00'],
            nivelIntensidadeAlerta: 'leve'
        }),
        agora
    });

    assert.equal(transacao.chamadas.length, 2);
    assert.equal(transacao.chamadas[0].operacao, 'updateMany');
    assert.deepEqual(transacao.chamadas[0].argumentos.data, {
        statusEnvio: 'cancelada'
    });

    assert.equal(transacao.chamadas[1].operacao, 'create');
    assert.deepEqual(transacao.chamadas[1].argumentos.data, {
        usuarioId: 7,
        tipoOrigem: 'anticoncepcional',
        origemId: 3,
        dataHoraProgramada: new Date('2026-10-02T09:00:00.000Z'),
        dataHoraDisparo: null,
        intensidadeAlerta: 'leve',
        statusEnvio: 'agendada'
    });
});

test('cancela futuras e não cria alerta quando muda para DIU', async () => {
    const transacao = criarTransacao();

    await sincronizarNotificacoesEdicao({
        transacao,
        usuarioId: 7,
        anticoncepcionalId: 3,
        registroAtual: criarRegistroAtual(),
        dadosNovos: criarDadosNovos({
            tipo: 'diu_hormonal',
            horariosProgramados: [],
            frequencia: null,
            dataInicioUso: null,
            dataValidade: new Date('2030-10-02T00:00:00.000Z')
        }),
        agora
    });

    assert.equal(transacao.chamadas.length, 1);
    assert.equal(transacao.chamadas[0].operacao, 'updateMany');
    assert.deepEqual(transacao.chamadas[0].argumentos.data, {
        statusEnvio: 'cancelada'
    });
});

test('não agenda uso posterior à validade do anel', () => {
    const proximaNotificacao = calcularProximaNotificacao(criarDadosNovos({
        tipo: 'anel_vaginal',
        frequencia: 'uso_21_dias',
        horariosProgramados: ['08:00'],
        dataInicioUso: new Date('2026-10-20T00:00:00.000Z'),
        dataValidade: new Date('2026-10-10T00:00:00.000Z')
    }), agora);

    assert.equal(proximaNotificacao, null);
});