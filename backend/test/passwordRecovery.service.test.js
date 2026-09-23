import test from 'node:test';
import assert from 'node:assert/strict';
import { criarPasswordRecoveryService } from '../src/services/passwordRecovery.service.js';

function criarService(usuario = null, recuperacao = null) {
    const chamadas = { transacao: [], email: [] };
    const prisma = {
        usuario: {
            findUnique: async () => usuario,
            update: (args) => ({ operacao: 'usuario', args })
        },
        recuperacaoSenha: {
            updateMany: (args) => ({ operacao: 'revogar', args }),
            create: (args) => ({ operacao: 'criar', args }),
            findUnique: async () => recuperacao,
            update: (args) => ({ operacao: 'usar', args })
        },
        sessao: {
            updateMany: (args) => ({ operacao: 'sessoes', args })
        },
        async $transaction(operacoes) {
            chamadas.transacao.push(operacoes);
        }
    };
    const tokenService = {
        gerarTokenRecuperacao: () => ({
            token: 'jwt', tokenHash: 'hash',
            validadeToken: new Date('2026-09-23T12:00:00Z')
        }),
        validarTokenRecuperacao: () => ({ usuarioId: 7 }),
        gerarHashToken: () => 'hash'
    };
    const emailService = {
        async enviarEmailRecuperacaoSenha(dados) {
            chamadas.email.push(dados);
        }
    };
    const service = criarPasswordRecoveryService({
        prisma, tokenService, emailService,
        passwordService: { gerarHash: async () => ({ senhaHash: 'hash-senha' }) },
        baseUrl: 'aloya://reset-password',
        now: () => new Date('2026-09-23T10:00:00Z'),
        logger: { error() {} }
    });
    return { service, chamadas };
}

test('mantém resposta neutra quando o e-mail não existe', async () => {
    const { service, chamadas } = criarService();
    const resposta = await service.solicitar('ausente@email.com');
    assert.match(resposta.mensagem, /Se este e-mail estiver cadastrado/);
    assert.equal(chamadas.transacao.length, 0);
    assert.equal(chamadas.email.length, 0);
});

test('revoga link anterior e envia somente o novo token', async () => {
    const usuario = { id: 7, email: 'carla@email.com' };
    const { service, chamadas } = criarService(usuario);

    const resposta = await service.solicitar(usuario.email);

    assert.match(resposta.mensagem, /Se este e-mail estiver cadastrado/);
    assert.equal(chamadas.transacao.length, 1);
    assert.equal(chamadas.transacao[0][0].operacao, 'revogar');
    assert.deepEqual(
        chamadas.transacao[0][0].args.where,
        { usuarioId: 7, statusLink: 'pendente' }
    );
    assert.equal(chamadas.transacao[0][1].operacao, 'criar');
    assert.deepEqual(chamadas.email, [{
        email: 'carla@email.com',
        linkRedefinicao: 'aloya://reset-password?token=jwt'
    }]);
});

test('redefine senha, utiliza o link e revoga sessões', async () => {
    const recuperacao = {
        id: 9, usuarioId: 7, statusLink: 'pendente',
        validadeToken: new Date('2026-09-23T11:00:00Z')
    };
    const { service, chamadas } = criarService(null, recuperacao);

    const resposta = await service.redefinir({ token: 'jwt', senha: 'nova-senha' });

    assert.match(resposta.mensagem, /Senha redefinida com sucesso/);
    const operacoes = chamadas.transacao[0];
    assert.deepEqual(
        operacoes.map(({ operacao }) => operacao),
        ['usuario', 'usar', 'sessoes']
    );
    assert.equal(operacoes[0].args.data.senhaHash, 'hash-senha');
    assert.equal(operacoes[1].args.data.statusLink, 'usado');
});
