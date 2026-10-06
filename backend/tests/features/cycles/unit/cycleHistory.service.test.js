//Testa a orquestração, a numeração e a segurança da resposta do histórico.
import test from 'node:test';
import assert from 'node:assert/strict';

import {criarCycleHistoryService} from '../../../../src/features/cycles/cycleHistory.service.js';
import {criarCursorHistorico} from '../../../../src/features/cycles/cycleHistory.validator.js';

const dataMaisRecente = new Date('2026-09-04T00:00:00.000Z');
const dataIntermediaria = new Date('2026-08-07T00:00:00.000Z');
const dataMaisAntiga = new Date('2026-07-08T00:00:00.000Z');

//Cria um registro interno semelhante ao devolvido pelo Prisma.
function criarRegistro({id, dataInicio, dataFim = new Date('2026-09-08T00:00:00.000Z'), classificacao = 'normal'}) {
    return {
        id,
        usuarioId: 99,
        dataInicio,
        dataFim,
        duracaoMenstruacao: 5,
        duracaoCiclo: 28,
        classificacao,
        ehCicloInicial: false,
        segredoInterno: 'não pode aparecer'
    };
}

//Cria dependências controladas e registra os argumentos enviados pelo service.
function criarDependencias({pagina, quantidadeCiclos = 3, quantidadePercorrida = 0, erroListagem, erroContagem, erroPosicao} = {}) {
    const chamadas = {
        listar: [],
        contar: [],
        contarAteCursor: []
    };

    const repository = {
        async listarPagina(argumentos) {
            chamadas.listar.push(argumentos);

            if (erroListagem) {
                throw erroListagem;
            }

            return pagina ?? {
                registros: [],
                temMais: false,
                proximoCursor: null
            };
        },

        async contarDoUsuario(usuarioId) {
            chamadas.contar.push(usuarioId);

            if (erroContagem) {
                throw erroContagem;
            }

            return quantidadeCiclos;
        },

        async contarAteCursor(usuarioId, cursor) {
            chamadas.contarAteCursor.push({
                usuarioId,
                cursor
            });

            if (erroPosicao) {
                throw erroPosicao;
            }

            return quantidadePercorrida;
        }
    };

    return {
        service: criarCycleHistoryService({repository}),
        chamadas
    };
}

test('usa limite padrão e numera a primeira página do ciclo mais recente ao mais antigo', async () => {
    const {service, chamadas} = criarDependencias({
        quantidadeCiclos: 3,
        pagina: {
            registros: [
                criarRegistro({
                    id: 3,
                    dataInicio: dataMaisRecente
                }),
                criarRegistro({
                    id: 2,
                    dataInicio: dataIntermediaria
                })
            ],
            temMais: true,
            proximoCursor: 'cursor-seguro'
        }
    });

    const resultado = await service.listarHistorico({
        usuarioId: 7
    });

    assert.deepEqual(resultado.ciclos.map(ciclo => ciclo.numero), [3, 2]);
    assert.equal(chamadas.listar[0].limite, 20);
    assert.equal(chamadas.listar[0].cursor, null);
    assert.equal(chamadas.listar[0].usuarioId, 7);
});

test('numera corretamente uma página carregada depois do cursor', async () => {
    const cursorCodificado = criarCursorHistorico({
        dataInicio: dataIntermediaria,
        id: 2
    });

    const {service, chamadas} = criarDependencias({
        quantidadeCiclos: 5,
        quantidadePercorrida: 2,
        pagina: {
            registros: [
                criarRegistro({
                    id: 1,
                    dataInicio: dataMaisAntiga
                })
            ],
            temMais: false,
            proximoCursor: null
        }
    });

    const resultado = await service.listarHistorico({
        usuarioId: 7,
        consulta: {
            limit: '2',
            cursor: cursorCodificado
        }
    });

    assert.equal(resultado.ciclos[0].numero, 3);
    assert.equal(chamadas.listar[0].limite, 2);
    assert.deepEqual(chamadas.listar[0].cursor, {
        dataInicio: dataIntermediaria,
        id: 2
    });

    assert.deepEqual(chamadas.contarAteCursor[0], {
        usuarioId: 7,
        cursor: {
            dataInicio: dataIntermediaria,
            id: 2
        }
    });
});

test('devolve o contrato público sem dados internos do usuário', async () => {
    const {service} = criarDependencias({
        quantidadeCiclos: 1,
        pagina: {
            registros: [
                criarRegistro({
                    id: 4,
                    dataInicio: dataMaisRecente,
                    classificacao: 'irregular'
                })
            ],
            temMais: false,
            proximoCursor: null
        }
    });

    const resultado = await service.listarHistorico({
        usuarioId: 7
    });

    assert.deepEqual(resultado.ciclos[0], {
        id: 4,
        numero: 1,
        dataInicio: '2026-09-04',
        dataFim: '2026-09-08',
        diasMenstruais: 5,
        duracaoDias: 28,
        status: 'concluido',
        classificacao: 'irregular',
        estimativaIncerta: true,
        cicloInicial: false
    });

    assert.equal('usuarioId' in resultado.ciclos[0], false);
    assert.equal('segredoInterno' in resultado.ciclos[0], false);
});

test('devolve informações de paginação e quantidade total', async () => {
    const {service} = criarDependencias({
        quantidadeCiclos: 25,
        pagina: {
            registros: [
                criarRegistro({
                    id: 25,
                    dataInicio: dataMaisRecente
                })
            ],
            temMais: true,
            proximoCursor: 'proxima-pagina'
        }
    });

    const resultado = await service.listarHistorico({
        usuarioId: 7,
        consulta: {
            limit: '1'
        }
    });

    assert.deepEqual(resultado.paginacao, {
        limite: 1,
        temMais: true,
        proximoCursor: 'proxima-pagina'
    });

    assert.equal(resultado.quantidadeCiclos, 25);
});

test('devolve estado vazio sem inventar ciclos ou resumo estatístico', async () => {
    const {service} = criarDependencias({
        quantidadeCiclos: 0,
        pagina: {
            registros: [],
            temMais: false,
            proximoCursor: null
        }
    });

    const resultado = await service.listarHistorico({
        usuarioId: 7
    });

    assert.deepEqual(resultado, {
        ciclos: [],
        quantidadeCiclos: 0,
        paginacao: {
            limite: 20,
            temMais: false,
            proximoCursor: null
        }
    });

    assert.equal('resumo' in resultado, false);
});

test('valida a consulta antes de acessar o repositório', async () => {
    const {service, chamadas} = criarDependencias();

    await assert.rejects(service.listarHistorico({
        usuarioId: 7,
        consulta: {
            limit: '0'
        }
    }), {
        status: 400,
        codigo: 'LIMITE_HISTORICO_INVALIDO'
    });

    assert.equal(chamadas.listar.length, 0);
    assert.equal(chamadas.contar.length, 0);
    assert.equal(chamadas.contarAteCursor.length, 0);
});

test('rejeita usuário inválido antes de acessar o repositório', async () => {
    const {service, chamadas} = criarDependencias();

    await assert.rejects(service.listarHistorico({
        usuarioId: '7'
    }), {
        name: 'TypeError',
        message: 'O identificador da pessoa usuária é inválido.'
    });

    assert.equal(chamadas.listar.length, 0);
    assert.equal(chamadas.contar.length, 0);
    assert.equal(chamadas.contarAteCursor.length, 0);
});

test('rejeita quando a posição é maior que o total de ciclos', async () => {
    const {service} = criarDependencias({
        quantidadeCiclos: 2,
        quantidadePercorrida: 3
    });

    await assert.rejects(service.listarHistorico({
        usuarioId: 7
    }), {
        name: 'TypeError',
        message: 'A posição da página no histórico é inconsistente.'
    });
});

test('rejeita quando a página ultrapassa a quantidade restante', async () => {
    const {service} = criarDependencias({
        quantidadeCiclos: 2,
        quantidadePercorrida: 1,
        pagina: {
            registros: [
                criarRegistro({
                    id: 2,
                    dataInicio: dataIntermediaria
                }),
                criarRegistro({
                    id: 1,
                    dataInicio: dataMaisAntiga
                })
            ],
            temMais: false,
            proximoCursor: null
        }
    });

    await assert.rejects(service.listarHistorico({
        usuarioId: 7
    }), {
        name: 'TypeError',
        message: 'A posição da página no histórico é inconsistente.'
    });
});

test('rejeita página interna sem lista de registros', async () => {
    const {service} = criarDependencias({
        pagina: {
            temMais: false,
            proximoCursor: null
        }
    });

    await assert.rejects(service.listarHistorico({
        usuarioId: 7
    }), {
        name: 'TypeError',
        message: 'A página interna do histórico é inválida.'
    });
});

test('rejeita página intermediária sem próximo cursor', async () => {
    const {service} = criarDependencias({
        pagina: {
            registros: [
                criarRegistro({
                    id: 3,
                    dataInicio: dataMaisRecente
                })
            ],
            temMais: true,
            proximoCursor: null
        }
    });

    await assert.rejects(service.listarHistorico({
        usuarioId: 7
    }), {
        name: 'TypeError',
        message: 'A página interna do histórico é inválida.'
    });
});

test('rejeita quantidade total inválida', async () => {
    const {service} = criarDependencias({
        quantidadeCiclos: -1
    });

    await assert.rejects(service.listarHistorico({
        usuarioId: 7
    }), {
        name: 'TypeError',
        message: 'A quantidade do histórico é inválida.'
    });
});

test('rejeita quantidade percorrida inválida', async () => {
    const {service} = criarDependencias({
        quantidadePercorrida: 1.5
    });

    await assert.rejects(service.listarHistorico({
        usuarioId: 7
    }), {
        name: 'TypeError',
        message: 'A quantidade do histórico é inválida.'
    });
});

test('propaga falha do repositório sem substituir o erro original', async () => {
    const erroDoBanco = new Error('Falha simulada.');
    const {service} = criarDependencias({
        erroListagem: erroDoBanco
    });

    await assert.rejects(service.listarHistorico({
        usuarioId: 7
    }), erroDoBanco);
});

test('rejeita repositório incompleto', () => {
    assert.throws(() => criarCycleHistoryService({
        repository: {
            async listarPagina() {
                return {};
            }
        }
    }), {
        name: 'TypeError',
        message: 'O repositório do histórico de ciclos é inválido.'
    });
});