//Testa a resposta HTTP segura do estado atual exibido na Home.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCurrentCycleController } from '../../../../src/features/cycles/calendar/calendar.current.controller.js';

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

function criarEstadoAtual() {
    return {
        possuiCiclos: true,
        dataReferencia: '2026-10-10',
        diaDoCiclo: 12,
        faseAtual: 'FOLICULAR',
        estaNaJanelaFertil: true,
        proximoInicioEstimado: '2026-10-27',
        nivelConfianca: 'BAIXA',
        statusPrevisao: 'DISPONIVEL'
    };
}

test('rejeita configuração sem service válido', () => {
    for (const currentCycleService of [
        undefined,
        null,
        {},
        {buscarEstadoAtual: true}
    ]) {
        assert.throws(
            () => criarCurrentCycleController({
                currentCycleService
            }),
            {
                name: 'TypeError',
                message: 'Não foi possível configurar o controller do estado atual.'
            }
        );
    }
});

test('usa somente a identidade autenticada', async () => {
    let argumentosRecebidos = null;
    const estadoAtual = criarEstadoAtual();
    const controller = criarCurrentCycleController({
        currentCycleService: {
            async buscarEstadoAtual(argumentos) {
                argumentosRecebidos = argumentos;
                return estadoAtual;
            }
        }
    });
    const resposta = criarRespostaMock();

    await controller.buscarEstadoAtual(
        {
            usuario: {
                id: 7
            },
            query: {
                usuarioId: 999
            },
            body: {
                usuarioId: 999
            }
        },
        resposta,
        assert.fail
    );

    assert.deepEqual(argumentosRecebidos, {
        usuarioId: 7
    });
    assert.equal(resposta.statusRecebido, 200);
    assert.deepEqual(resposta.corpoRecebido, {
        estadoAtual
    });
});

test('impede armazenamento HTTP compartilhado dos dados do ciclo', async () => {
    const controller = criarCurrentCycleController({
        currentCycleService: {
            async buscarEstadoAtual() {
                return criarEstadoAtual();
            }
        }
    });
    const resposta = criarRespostaMock();

    await controller.buscarEstadoAtual(
        {
            usuario: {
                id: 7
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

test('preserva erros controlados do service', async () => {
    const erroSessao = new Error('Sessão inválida.');
    erroSessao.status = 401;
    erroSessao.codigo = 'SESSAO_INVALIDA';

    const controller = criarCurrentCycleController({
        currentCycleService: {
            async buscarEstadoAtual() {
                throw erroSessao;
            }
        }
    });
    let erroRecebido = null;

    await controller.buscarEstadoAtual(
        {
            usuario: {
                id: 7
            }
        },
        criarRespostaMock(),
        (erro) => {
            erroRecebido = erro;
        }
    );

    assert.equal(erroRecebido, erroSessao);
    assert.equal(erroRecebido.mensagemUsuario, undefined);
});

test('define mensagem pública segura para falha interna', async () => {
    const erroInterno = new Error('Detalhes privados do banco');

    const controller = criarCurrentCycleController({
        currentCycleService: {
            async buscarEstadoAtual() {
                throw erroInterno;
            }
        }
    });
    let erroRecebido = null;

    await controller.buscarEstadoAtual(
        {
            usuario: {
                id: 7
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
});