import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationResponseService } from '../../../../src/features/support-network/services/contactInvitationResponse.service.js';

const token = 'a'.repeat(43);
const convite = {
    id: 8,
    emailConvidado: 'contato@email.com',
    status: 'pendente',
    dataExpiracao: new Date('2026-11-09T12:00:00.000Z'),
    titular: { nome: 'Julia' },
    categoria: null
};

function criarCenario({ existente = null, atualizados = 1 } = {}) {
    const criacoes = [];
    const atualizacoes = [];
    const tx = {
        usuario: {
            async findUnique() {
                return existente;
            },
            async create(operacao) {
                criacoes.push(operacao);
                return {
                    id: 25,
                    nome: operacao.data.nome,
                    email: operacao.data.email,
                    papel: operacao.data.papel
                };
            }
        },
        vinculoRedeApoio: {
            async updateMany(operacao) {
                atualizacoes.push(operacao);
                return { count: atualizados };
            }
        }
    };
    const prisma = {
        vinculoRedeApoio: { async findUnique() { return convite; } },
        async $transaction(callback) { return callback(tx); }
    };
    const service = criarContactInvitationResponseService({
        prisma,
        tokenService: { calcularHash: () => 'hash-seguro' },
        passwordService: { async gerarHash() { return { senhaHash: 'senha-hash' }; } },
        now: () => new Date('2026-11-08T12:00:00.000Z')
    });
    return { service, criacoes, atualizacoes };
}

test('cria conta de contato usando o e-mail imutável do convite', async () => {
    const { service, criacoes, atualizacoes } = criarCenario();
    const resultado = await service.cadastrarContato(token, {
        nome: 'Maria Silva',
        dataNascimento: new Date('1995-02-28T00:00:00.000Z'),
        senha: 'senha segura'
    });

    assert.equal(criacoes[0].data.email, 'contato@email.com');
    assert.equal(criacoes[0].data.papel, 'contato_apoio');
    assert.equal(criacoes[0].data.statusConta, 'ativa');
    assert.equal(criacoes[0].data.emailConfirmadoEm.toISOString(), '2026-11-08T12:00:00.000Z');
    assert.equal(atualizacoes[0].data.contatoId, 25);
    assert.equal(resultado.usuario.email, 'contato@email.com');
    assert.equal('senhaHash' in resultado.usuario, false);
});

test('não substitui conta existente nem aceita convite alterado durante o cadastro', async () => {
    await assert.rejects(
        () =>
            criarCenario({ existente: { id: 4 } }).service.cadastrarContato(token, {
                nome: 'Maria',
                dataNascimento: new Date('1995-01-01'),
                senha: 'senha segura'
            }),
        { status: 409, codigo: 'CONTA_JA_CADASTRADA' }
    );

    await assert.rejects(
        () =>
            criarCenario({ atualizados: 0 }).service.cadastrarContato(token, {
                nome: 'Maria',
                dataNascimento: new Date('1995-01-01'),
                senha: 'senha segura'
            }),
        { status: 410, codigo: 'CONVITE_INDISPONIVEL' }
    );
});
