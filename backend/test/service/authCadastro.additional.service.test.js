import test from 'node:test';
import assert from 'node:assert/strict';
import { criarAuthService } from '../../src/services/auth.service.js';

test('consulta disponibilidade sem expor dados da conta', async () => {
    const consultas = [];
    const service = criarAuthService({ prisma: { usuario: {
        async findUnique(argumentos) {
            consultas.push(argumentos);
            return null;
        }
    } } });
    assert.deepEqual(await service.verificarEmailDisponivel('carla@email.com'), {
        disponivel: true
    });
    assert.deepEqual(consultas, [{
        where: { email: 'carla@email.com' }, select: { id: true }
    }]);
});

test('converte colisão concorrente do Prisma em conflito público', async () => {
    const service = criarAuthService({
        prisma: {
            usuario: { findUnique: async () => null },
            async $transaction() {
                throw Object.assign(new Error('detalhe interno'), { code: 'P2002' });
            }
        },
        passwordService: {
            gerarHash: async () => ({ senhaHash: 'hash-seguro' })
        }
    });
    await assert.rejects(
        service.cadastrar({ email: 'carla@email.com', senha: 'segura123' }),
        (erro) => erro.status === 409 &&
            erro.codigo === 'EMAIL_JA_CADASTRADO' &&
            !erro.message.includes('interno')
    );
});
