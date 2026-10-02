//Testa autorização, normalização, concorrência, notificações e persistência da edição de anticoncepcionais.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContraceptiveService } from '../../../../src/features/contraceptives/contraceptive.service.js';

const agora = new Date('2026-10-02T12:00:00.000Z');
const atualizadoEm = new Date('2026-10-01T10:00:00.000Z');

//Cria um registro completo semelhante ao retornado pelo Prisma.
function criarRegistro(alteracoes = {}) {
    return {
        id: 7,
        usuarioId: 3,
        nome: 'Mercilon',
        tipo: 'pilula',
        horariosProgramados: ['08:00'],
        frequencia: 'uso_continuo',
        dataInicioUso: new Date('2026-09-01T00:00:00.000Z'),
        periodosPausa: [],
        dataValidade: null,
        nivelIntensidadeAlerta: 'critico',
        ativo: true,
        removidoEm: null,
        criadoEm: new Date('2026-09-01T12:00:00.000Z'),
        atualizadoEm,
        ...alteracoes
    };
}

//Cria o corpo canônico completo enviado pelo formulário de edição.
function criarEntrada(alteracoes = {}) {
    return {
        nome: 'Mercilon',
        tipo: 'pilula',
        frequenciaId: 'pilula_continuo',
        horarios: ['08:00'],
        dataPrimeiroUso: '2026-09-01',
        dataValidade: null,
        intensidadeAlerta: 'critico',
        ...alteracoes
    };
}

//Cria um Prisma falso transacional e registra todas as consultas executadas.
function criarPrisma({registroAtual = criarRegistro(), quantidadeAtualizada = 1} = {}) {
    const chamadas = [];
    let consultas = 0;

    const transacao = {
        anticoncepcional: {
            async findFirst(argumentos) {
                chamadas.push({operacao: 'findFirst', argumentos});
                consultas += 1;

                if (consultas === 1) return registroAtual;
                if (!registroAtual || quantidadeAtualizada !== 1) return null;

                const atualizacao = chamadas.find((chamada) => chamada.operacao === 'updateMany')?.argumentos.data;

                return criarRegistro({
                    ...registroAtual,
                    ...atualizacao,
                    atualizadoEm: agora
                });
            },

            async updateMany(argumentos) {
                chamadas.push({operacao: 'updateMany', argumentos});
                return {count: quantidadeAtualizada};
            }
        },

        notificacao: {
            async updateMany(argumentos) {
                chamadas.push({
                    operacao: 'notificacao.updateMany',
                    argumentos
                });

                return {count: 1};
            },

            async create(argumentos) {
                chamadas.push({
                    operacao: 'notificacao.create',
                    argumentos
                });

                return {
                    id: 1,
                    ...argumentos.data
                };
            }
        }
    };

    return {
        chamadas,

        async $transaction(operacao) {
            chamadas.push({operacao: '$transaction'});
            return operacao(transacao);
        }
    };
}

//Executa uma operação assíncrona e devolve o erro controlado.
async function capturarErro(acao) {
    try {
        await acao();
        return null;
    } catch (erro) {
        return erro;
    }
}

test('edita somente o anticoncepcional ativo pertencente à usuária autenticada', async () => {
    const prisma = criarPrisma();
    const service = criarContraceptiveService(prisma, () => agora);

    const resultado = await service.editar(3, '7', criarEntrada({
        nome: 'Mirena',
        tipo: 'diu_hormonal',
        frequenciaId: 'pilula_continuo',
        horarios: ['08:00'],
        dataValidade: '2030-10-02',
        intensidadeAlerta: 'moderado'
    }));

    const consultaInicial = prisma.chamadas.find((chamada) => chamada.operacao === 'findFirst');
    const atualizacao = prisma.chamadas.find((chamada) => chamada.operacao === 'updateMany');
    const cancelamento = prisma.chamadas.find((chamada) => chamada.operacao === 'notificacao.updateMany');

    assert.deepEqual(consultaInicial.argumentos.where, {
        id: 7,
        usuarioId: 3,
        ativo: true
    });

    assert.deepEqual(atualizacao.argumentos.where, {
        id: 7,
        usuarioId: 3,
        ativo: true,
        atualizadoEm
    });

    assert.equal(atualizacao.argumentos.data.nome, 'Mirena');
    assert.equal(atualizacao.argumentos.data.tipo, 'diu_hormonal');
    assert.deepEqual(atualizacao.argumentos.data.horariosProgramados, []);
    assert.equal(atualizacao.argumentos.data.frequencia, null);
    assert.equal(atualizacao.argumentos.data.dataInicioUso, null);
    assert.deepEqual(atualizacao.argumentos.data.periodosPausa, []);
    assert.equal(atualizacao.argumentos.data.dataValidade.toISOString(), '2030-10-02T00:00:00.000Z');
    assert.equal(atualizacao.argumentos.data.nivelIntensidadeAlerta, 'moderado');

    assert.deepEqual(cancelamento.argumentos.where, {
        usuarioId: 3,
        tipoOrigem: 'anticoncepcional',
        origemId: 7,
        statusEnvio: 'agendada',
        dataHoraDisparo: null,
        dataHoraProgramada: {
            gt: agora
        }
    });

    assert.deepEqual(cancelamento.argumentos.data, {
        statusEnvio: 'cancelada'
    });

    assert.equal(prisma.chamadas.some((chamada) => chamada.operacao === 'notificacao.create'), false);
    assert.equal(resultado.nome, 'Mirena');
    assert.equal(resultado.tipo, 'diu_hormonal');
});

test('não revela nem altera anticoncepcional inexistente, removido ou de outra usuária', async () => {
    const prisma = criarPrisma({registroAtual: null});
    const service = criarContraceptiveService(prisma, () => agora);

    const erro = await capturarErro(() => service.editar(3, '99', criarEntrada({
        nome: 'Novo nome'
    })));

    assert.equal(erro?.status, 404);
    assert.equal(erro?.codigo, 'ANTICONCEPCIONAL_NAO_ENCONTRADO');
    assert.equal(prisma.chamadas.some((chamada) => chamada.operacao === 'updateMany'), false);
    assert.equal(prisma.chamadas.some((chamada) => chamada.operacao === 'notificacao.updateMany'), false);
});

test('rejeita atualização sem alteração real', async () => {
    const prisma = criarPrisma();
    const service = criarContraceptiveService(prisma, () => agora);

    const erro = await capturarErro(() => service.editar(3, '7', criarEntrada()));

    assert.equal(erro?.status, 422);
    assert.equal(erro?.codigo, 'SEM_ALTERACOES');
    assert.equal(prisma.chamadas.some((chamada) => chamada.operacao === 'updateMany'), false);
    assert.equal(prisma.chamadas.some((chamada) => chamada.operacao === 'notificacao.updateMany'), false);
});

test('impede sobrescrita quando o registro muda durante a transação', async () => {
    const prisma = criarPrisma({quantidadeAtualizada: 0});
    const service = criarContraceptiveService(prisma, () => agora);

    const erro = await capturarErro(() => service.editar(3, '7', criarEntrada({
        nome: 'Mercilon atualizado'
    })));

    assert.equal(erro?.status, 409);
    assert.equal(erro?.codigo, 'CONFLITO_EDICAO');

    const atualizacao = prisma.chamadas.find((chamada) => chamada.operacao === 'updateMany');

    assert.deepEqual(atualizacao.argumentos.where, {
        id: 7,
        usuarioId: 3,
        ativo: true,
        atualizadoEm
    });

    assert.equal(prisma.chamadas.some((chamada) => chamada.operacao === 'notificacao.updateMany'), false);
});

test('valida identificador e corpo antes de abrir a transação', async () => {
    const prisma = criarPrisma();
    const service = criarContraceptiveService(prisma, () => agora);

    const erroId = await capturarErro(() => service.editar(3, '../7', criarEntrada()));
    const erroCorpo = await capturarErro(() => service.editar(3, '7', {
        ...criarEntrada(),
        usuarioId: 99
    }));

    assert.equal(erroId?.codigo, 'ID_ANTICONCEPCIONAL_INVALIDO');
    assert.equal(erroCorpo?.codigo, 'CAMPOS_NAO_PERMITIDOS');
    assert.equal(prisma.chamadas.length, 0);
});