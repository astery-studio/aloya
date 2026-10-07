//Testa a resposta HTTP e o uso exclusivo da identidade autenticada no calendário.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCalendarController } from '../../../../src/features/cycles/calendar/calendar.controller.js';

function criarRespostaMock() {
    return {
        statusRecebido: null,
        corpoRecebido: null,
        cabecalhos: {},

        set(nome, valor) {
            this.cabecalhos[nome] = valor;
            return this;
        },

        status(status) {
            this.statusRecebido = status;
            return this;
        },

        json(corpo) {
            this.corpoRecebido = corpo;
            return this;
        }
    };
}

function criarCalendario() {
    return {
        mes: '2026-10',
        possuiCiclos: true,
        diasMenstruacao: [
            {
                data: '2026-10-01',
                registroCicloId: 18
            }
        ],
        previsao: null
    };
}

test('rejeita configuração sem service válido', () => {
    for (const calendarService of [undefined, null, {}, {buscarMes: true}]) {
        assert.throws(
            () => criarCalendarController({calendarService}),
            {
                name: 'TypeError',
                message: 'Não foi possível configurar o controller do calendário.'
            }
        );
    }
});

test('busca o mês usando somente a identidade autenticada', async () => {
    let argumentosRecebidos = null;
    const calendario = criarCalendario();
    const controller = criarCalendarController({
        calendarService: {
            async buscarMes(argumentos) {
                argumentosRecebidos = argumentos;
                return calendario;
            }
        }
    });
    const resposta = criarRespostaMock();

    await controller.buscarMes(
        {
            usuario: {
                id: 7
            },
            query: {
                mes: '2026-10',
                usuarioId: 999
            },
            body: {
                usuarioId: 999
            },
            params: {
                usuarioId: 999
            }
        },
        resposta,
        assert.fail
    );

    assert.deepEqual(argumentosRecebidos, {
        usuarioId: 7,
        mes: '2026-10'
    });
    assert.equal(resposta.statusRecebido, 200);
    assert.deepEqual(resposta.corpoRecebido, {
        calendario
    });
});

test('impede armazenamento HTTP compartilhado de dados sensíveis', async () => {
    const controller = criarCalendarController({
        calendarService: {
            async buscarMes() {
                return criarCalendario();
            }
        }
    });
    const resposta = criarRespostaMock();

    await controller.buscarMes(
        {
            usuario: {
                id: 7
            },
            query: {
                mes: '2026-10'
            }
        },
        resposta,
        assert.fail
    );

    assert.equal(
        resposta.cabecalhos['Cache-Control'],
        'private, no-store'
    );
    assert.equal(
        resposta.cabecalhos.Pragma,
        'no-cache'
    );
});

test('encaminha erros controlados sem substituir sua mensagem', async () => {
    const erroValidacao = new Error('Informe o mês no formato AAAA-MM.');
    erroValidacao.status = 422;
    erroValidacao.codigo = 'MES_CALENDARIO_INVALIDO';

    const controller = criarCalendarController({
        calendarService: {
            async buscarMes() {
                throw erroValidacao;
            }
        }
    });
    let erroRecebido = null;

    await controller.buscarMes(
        {
            usuario: {
                id: 7
            },
            query: {
                mes: '2026-13'
            }
        },
        criarRespostaMock(),
        (erro) => {
            erroRecebido = erro;
        }
    );

    assert.equal(erroRecebido, erroValidacao);
    assert.equal(erroRecebido.mensagemUsuario, undefined);
});

test('define a mensagem pública exigida para erros internos', async () => {
    const erroInterno = new Error('Detalhes privados do banco');

    const controller = criarCalendarController({
        calendarService: {
            async buscarMes() {
                throw erroInterno;
            }
        }
    });
    let erroRecebido = null;

    await controller.buscarMes(
        {
            usuario: {
                id: 7
            },
            query: {
                mes: '2026-10'
            }
        },
        criarRespostaMock(),
        (erro) => {
            erroRecebido = erro;
        }
    );

    assert.equal(erroRecebido, erroInterno);
    assert.equal(
        erroRecebido.mensagemUsuario,
        'Não foi possível carregar os dados do calendário. Tente novamente.'
    );
    assert.equal(erroRecebido.status, undefined);
});