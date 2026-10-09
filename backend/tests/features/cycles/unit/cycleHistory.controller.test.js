//Testa a resposta HTTP, o isolamento da conta e o tratamento seguro de erros do histórico.
import test from 'node:test';
import assert from 'node:assert/strict';

import {criarCycleHistoryController} from '../../../../src/features/cycles/controllers/cycleHistory.controller.js';

//Cria uma resposta Express controlada para inspecionar status, corpo e cabeçalhos.
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

//Cria uma resposta válida semelhante àquela devolvida pelo service.
function criarResultado() {
    return {
        ciclos: [
            {
                id: 3,
                numero: 3,
                dataInicio: '2026-09-04',
                dataFim: '2026-09-08',
                diasMenstruais: 5,
                duracaoDias: 28,
                status: 'concluido',
                classificacao: 'normal',
                estimativaIncerta: false,
                cicloInicial: false
            }
        ],
        quantidadeCiclos: 3,
        paginacao: {
            limite: 20,
            temMais: false,
            proximoCursor: null
        }
    };
}

test('lista o histórico usando somente a identidade da sessão', async () => {
    let argumentosRecebidos;
    const resultado = criarResultado();

    const controller = criarCycleHistoryController({
        cycleHistoryService: {
            async listarHistorico(argumentos) {
                argumentosRecebidos = argumentos;
                return resultado;
            }
        }
    });

    const res = criarRespostaMock();

    await controller.listarHistorico({
        usuario: {
            id: 7
        },
        query: {
            limit: '20'
        },
        body: {
            usuarioId: 999
        }
    }, res, assert.fail);

    assert.deepEqual(argumentosRecebidos, {
        usuarioId: 7,
        consulta: {
            limit: '20'
        }
    });

    assert.equal(res.statusRecebido, 200);
    assert.deepEqual(res.corpoRecebido, resultado);
});

test('impede que dados sensíveis do histórico sejam armazenados em cache', async () => {
    const controller = criarCycleHistoryController({
        cycleHistoryService: {
            async listarHistorico() {
                return criarResultado();
            }
        }
    });

    const res = criarRespostaMock();

    await controller.listarHistorico({
        usuario: {
            id: 7
        },
        query: {}
    }, res, assert.fail);

    assert.equal(res.cabecalhos['Cache-Control'], 'no-store');
    assert.equal(res.cabecalhos.Pragma, 'no-cache');
});

test('devolve corretamente um histórico vazio', async () => {
    const resultadoVazio = {
        ciclos: [],
        quantidadeCiclos: 0,
        paginacao: {
            limite: 20,
            temMais: false,
            proximoCursor: null
        }
    };

    const controller = criarCycleHistoryController({
        cycleHistoryService: {
            async listarHistorico() {
                return resultadoVazio;
            }
        }
    });

    const res = criarRespostaMock();

    await controller.listarHistorico({
        usuario: {
            id: 7
        },
        query: {}
    }, res, assert.fail);

    assert.equal(res.statusRecebido, 200);
    assert.deepEqual(res.corpoRecebido, resultadoVazio);
});

test('encaminha erro conhecido sem substituir sua mensagem', async () => {
    const erroConhecido = new Error('O cursor informado é inválido.');
    erroConhecido.status = 400;
    erroConhecido.codigo = 'CURSOR_HISTORICO_INVALIDO';

    const controller = criarCycleHistoryController({
        cycleHistoryService: {
            async listarHistorico() {
                throw erroConhecido;
            }
        }
    });

    let erroRecebido;

    await controller.listarHistorico({
        usuario: {
            id: 7
        },
        query: {
            cursor: 'invalido'
        }
    }, criarRespostaMock(), erro => {
        erroRecebido = erro;
    });

    assert.equal(erroRecebido, erroConhecido);
    assert.equal(erroRecebido.mensagemUsuario, undefined);
});

test('define a mensagem exigida para uma falha interna inesperada', async () => {
    const erroInterno = new Error('Detalhes privados do banco.');

    const controller = criarCycleHistoryController({
        cycleHistoryService: {
            async listarHistorico() {
                throw erroInterno;
            }
        }
    });

    let erroRecebido;

    await controller.listarHistorico({
        usuario: {
            id: 7
        },
        query: {}
    }, criarRespostaMock(), erro => {
        erroRecebido = erro;
    });

    assert.equal(erroRecebido, erroInterno);
    assert.equal(erroRecebido.mensagemUsuario, 'Não foi possível carregar seu histórico de ciclos. Tente novamente.');
    assert.equal(erroRecebido.status, undefined);
});

test('trata uma sessão ausente como erro interno sem responder diretamente', async () => {
    const controller = criarCycleHistoryController({
        cycleHistoryService: {
            async listarHistorico() {
                assert.fail('O service não deveria ser chamado.');
            }
        }
    });

    let erroRecebido;

    await controller.listarHistorico({
        query: {}
    }, criarRespostaMock(), erro => {
        erroRecebido = erro;
    });

    assert.equal(erroRecebido instanceof TypeError, true);
    assert.equal(erroRecebido.mensagemUsuario, 'Não foi possível carregar seu histórico de ciclos. Tente novamente.');
});

test('rejeita a criação do controller sem service válido', () => {
    assert.throws(() => criarCycleHistoryController(), {
        name: 'TypeError',
        message: 'O service do histórico de ciclos é inválido.'
    });

    assert.throws(() => criarCycleHistoryController({
        cycleHistoryService: {}
    }), {
        name: 'TypeError',
        message: 'O service do histórico de ciclos é inválido.'
    });
});