//Testa autorização, concorrência, histórico e cancelamento de alertas na remoção do anticoncepcional.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContraceptiveService } from '../../../../src/features/contraceptives/contraceptive.service.js';

const agora = new Date('2026-10-02T18:00:00.000Z');
const atualizadoEm = new Date('2026-10-02T12:00:00.000Z');

//Cria um registro ativo semelhante ao retornado pelo Prisma.
function criarRegistro(alteracoes = {}) {
    return {
        id: 7,
        usuarioId: 3,
        atualizadoEm,
        ativo: true,
        removidoEm: null,
        ...alteracoes
    };
}

//Cria uma transação falsa e registra todas as operações solicitadas pelo service.
function criarPrisma({
    registroAtual = criarRegistro(),
    quantidadeAtualizada = 1,
    erroNotificacao = null
} = {}) {
    const chamadas = [];

    const transacao = {
        anticoncepcional: {
            async findFirst(argumentos) {
                chamadas.push({
                    operacao: 'anticoncepcional.findFirst',
                    argumentos
                });

                return registroAtual;
            },

            async updateMany(argumentos) {
                chamadas.push({
                    operacao: 'anticoncepcional.updateMany',
                    argumentos
                });

                return {
                    count: quantidadeAtualizada
                };
            }
        },

        notificacao: {
            async updateMany(argumentos) {
                chamadas.push({
                    operacao: 'notificacao.updateMany',
                    argumentos
                });

                if (erroNotificacao) throw erroNotificacao;

                return {
                    count: 3
                };
            }
        },

        usoAnticoncepcional: {
            async deleteMany(argumentos) {
                chamadas.push({
                    operacao: 'usoAnticoncepcional.deleteMany',
                    argumentos
                });

                throw new Error('O histórico de usos não pode ser apagado.');
            },

            async updateMany(argumentos) {
                chamadas.push({
                    operacao: 'usoAnticoncepcional.updateMany',
                    argumentos
                });

                throw new Error('O histórico de usos não pode ser alterado durante a remoção.');
            }
        }
    };

    return {
        chamadas,

        async $transaction(operacao) {
            chamadas.push({
                operacao: '$transaction'
            });

            return operacao(transacao);
        }
    };
}

//Executa uma operação assíncrona e devolve o erro lançado.
async function capturarErro(acao) {
    try {
        await acao();
        return null;
    } catch (erro) {
        return erro;
    }
}

test('remove logicamente somente o anticoncepcional ativo da usuária autenticada', async () => {
    const prisma = criarPrisma();
    const service = criarContraceptiveService(prisma, () => agora);

    const resultado = await service.remover(3, '7');

    const consulta = prisma.chamadas.find(
        (chamada) => chamada.operacao === 'anticoncepcional.findFirst'
    );

    const atualizacao = prisma.chamadas.find(
        (chamada) => chamada.operacao === 'anticoncepcional.updateMany'
    );

    assert.deepEqual(consulta.argumentos, {
        where: {
            id: 7,
            usuarioId: 3,
            ativo: true
        },
        select: {
            id: true,
            atualizadoEm: true
        }
    });

    assert.deepEqual(atualizacao.argumentos, {
        where: {
            id: 7,
            usuarioId: 3,
            ativo: true,
            atualizadoEm
        },
        data: {
            ativo: false,
            removidoEm: agora
        }
    });

    assert.deepEqual(resultado, {
        id: 7
    });
});

test('cancela todos os reenvios agendados sem alterar notificações já enviadas', async () => {
    const prisma = criarPrisma();
    const service = criarContraceptiveService(prisma, () => agora);

    await service.remover(3, '7');

    const cancelamento = prisma.chamadas.find(
        (chamada) => chamada.operacao === 'notificacao.updateMany'
    );

    assert.deepEqual(cancelamento.argumentos, {
        where: {
            usuarioId: 3,
            tipoOrigem: 'anticoncepcional',
            origemId: 7,
            statusEnvio: 'agendada'
        },
        data: {
            statusEnvio: 'cancelada'
        }
    });

    assert.equal(
        Object.hasOwn(cancelamento.argumentos.where, 'dataHoraProgramada'),
        false
    );

    assert.equal(
        Object.hasOwn(cancelamento.argumentos.where, 'intensidadeAlerta'),
        false
    );
});

test('preserva todos os usos registrados no histórico', async () => {
    const prisma = criarPrisma();
    const service = criarContraceptiveService(prisma, () => agora);

    await service.remover(3, '7');

    assert.equal(
        prisma.chamadas.some(
            (chamada) => chamada.operacao.startsWith('usoAnticoncepcional.')
        ),
        false
    );
});

test('não revela anticoncepcional inexistente, removido ou pertencente a outra usuária', async () => {
    const prisma = criarPrisma({
        registroAtual: null
    });

    const service = criarContraceptiveService(prisma, () => agora);
    const erro = await capturarErro(() => service.remover(3, '99'));

    assert.equal(erro?.status, 404);
    assert.equal(erro?.codigo, 'ANTICONCEPCIONAL_NAO_ENCONTRADO');

    assert.equal(
        prisma.chamadas.some(
            (chamada) => chamada.operacao === 'anticoncepcional.updateMany'
        ),
        false
    );

    assert.equal(
        prisma.chamadas.some(
            (chamada) => chamada.operacao === 'notificacao.updateMany'
        ),
        false
    );
});

test('impede remoção concorrente quando o anticoncepcional muda durante a transação', async () => {
    const prisma = criarPrisma({
        quantidadeAtualizada: 0
    });

    const service = criarContraceptiveService(prisma, () => agora);
    const erro = await capturarErro(() => service.remover(3, '7'));

    assert.equal(erro?.status, 409);
    assert.equal(erro?.codigo, 'CONFLITO_REMOCAO');

    assert.equal(
        prisma.chamadas.some(
            (chamada) => chamada.operacao === 'notificacao.updateMany'
        ),
        false
    );
});

test('valida o identificador antes de abrir a transação', async () => {
    const prisma = criarPrisma();
    const service = criarContraceptiveService(prisma, () => agora);

    const erroTexto = await capturarErro(() => service.remover(3, '../7'));
    const erroZero = await capturarErro(() => service.remover(3, '0'));
    const erroExcessivo = await capturarErro(() => service.remover(3, '9007199254740992'));

    assert.equal(erroTexto?.codigo, 'ID_ANTICONCEPCIONAL_INVALIDO');
    assert.equal(erroZero?.codigo, 'ID_ANTICONCEPCIONAL_INVALIDO');
    assert.equal(erroExcessivo?.codigo, 'ID_ANTICONCEPCIONAL_INVALIDO');
    assert.deepEqual(prisma.chamadas, []);
});

test('interrompe a transação quando o cancelamento das notificações falha', async () => {
    const falha = new Error('Falha simulada ao cancelar notificações.');

    const prisma = criarPrisma({
        erroNotificacao: falha
    });

    const service = criarContraceptiveService(prisma, () => agora);

    await assert.rejects(
        () => service.remover(3, '7'),
        (erro) => erro === falha
    );

    assert.deepEqual(
        prisma.chamadas.map((chamada) => chamada.operacao),
        [
            '$transaction',
            'anticoncepcional.findFirst',
            'anticoncepcional.updateMany',
            'notificacao.updateMany'
        ]
    );
});