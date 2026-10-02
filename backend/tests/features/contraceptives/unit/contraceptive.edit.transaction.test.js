//Testa se falhas nas notificações interrompem a transação de edição do anticoncepcional.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContraceptiveService } from '../../../../src/features/contraceptives/contraceptive.service.js';

const agora = new Date('2026-10-02T12:00:00.000Z');
const erroNotificacao = new Error('Falha simulada na atualização das notificações.');

//Cria um banco falso que registra a ordem das operações executadas na transação.
function criarPrisma() {
    const operacoes = [];

    const registroAtual = {
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
        criadoEm: new Date('2026-09-01T12:00:00.000Z'),
        atualizadoEm: new Date('2026-10-01T10:00:00.000Z')
    };

    const transacao = {
        anticoncepcional: {
            async findFirst() {
                operacoes.push('anticoncepcional.findFirst');
                return registroAtual;
            },

            async updateMany() {
                operacoes.push('anticoncepcional.updateMany');
                return {count: 1};
            }
        },

        notificacao: {
            async updateMany() {
                operacoes.push('notificacao.updateMany');
                throw erroNotificacao;
            },

            async create() {
                operacoes.push('notificacao.create');
                throw new Error('A criação não deveria ser executada.');
            }
        }
    };

    return {
        operacoes,

        async $transaction(operacao) {
            operacoes.push('$transaction');
            return operacao(transacao);
        }
    };
}

//Cria uma entrada válida que altera somente a intensidade do alerta.
function criarEntrada() {
    return {
        nome: 'Mercilon',
        tipo: 'pilula',
        frequenciaId: 'pilula_continuo',
        horarios: ['08:00'],
        dataPrimeiroUso: '2026-09-01',
        dataValidade: null,
        intensidadeAlerta: 'moderado'
    };
}

test('interrompe a edição quando a sincronização das notificações falha', async () => {
    const prisma = criarPrisma();
    const service = criarContraceptiveService(prisma, () => agora);

    await assert.rejects(
        () => service.editar(3, '7', criarEntrada()),
        (erro) => erro === erroNotificacao
    );

    assert.deepEqual(prisma.operacoes, [
        '$transaction',
        'anticoncepcional.findFirst',
        'anticoncepcional.updateMany',
        'notificacao.updateMany'
    ]);
});

test('não consulta o resultado atualizado depois da falha nas notificações', async () => {
    const prisma = criarPrisma();
    const service = criarContraceptiveService(prisma, () => agora);

    await assert.rejects(
        () => service.editar(3, '7', criarEntrada()),
        (erro) => erro === erroNotificacao
    );

    const quantidadeConsultas = prisma.operacoes.filter(
        (operacao) => operacao === 'anticoncepcional.findFirst'
    ).length;

    assert.equal(quantidadeConsultas, 1);
    assert.equal(prisma.operacoes.includes('notificacao.create'), false);
});