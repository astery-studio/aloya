import assert from 'node:assert/strict';
import test from 'node:test';
import { criarCycleRegistrationController } from '../../../../src/features/cycles/controllers/cycleRegistration.controller.js';
import { criarCycleRegistrationRoutes } from '../../../../src/features/cycles/routes/cycleRegistration.routes.js';
import { criarCycleRegistrationRepository } from '../../../../src/features/cycles/repositories/cycleRegistration.repository.js';
import { criarCycleSharingService } from '../../../../src/features/cycles/services/cycleSharing.service.js';

test('valida dependências e classifica concorrência para retentativa', async () => {
    assert.throws(() => criarCycleRegistrationRepository({ prisma: {} }), TypeError);
    assert.throws(() => criarCycleRegistrationController({ service: {} }), TypeError);
    assert.throws(() => criarCycleRegistrationRoutes({}), TypeError);
    assert.throws(() => criarCycleSharingService({ prisma: {} }), TypeError);
    const sharing = criarCycleSharingService({
        prisma: {
            $transaction() {
                throw new Error('Não deve consultar.');
            }
        }
    });
    for (const contatoId of [undefined, 0, -1, '1'])
        await assert.rejects(() => sharing.buscar({ contatoId, titularId: '1' }), { status: 401 });
    for (const antesDe of ['0', 'abc', '-1', '9007199254740992'])
        await assert.rejects(() => sharing.buscar({ contatoId: 1, titularId: '2', antesDe }), {
            status: 422
        });
    for (const code of ['P2002', 'P2034', 'P1008', 'P2028']) {
        const repository = criarCycleRegistrationRepository({
            prisma: {
                async $transaction() {
                    throw { code };
                }
            }
        });
        await assert.rejects(() => repository.registrar({}), {
            status: 409,
            codigo: 'CONCORRENCIA_REGISTRO_MENSTRUAL'
        });
    }
});

test('controller usa a sessão, preserva erros e responde sem cache', async () => {
    const erro = new Error('Interno');
    let recebido;
    const controller = criarCycleRegistrationController({
        service: {
            async registrar(dados) {
                recebido = dados;
                return { repetida: true };
            }
        },
        sharingService: {
            async buscar() {
                throw erro;
            }
        }
    });
    const res = {
        set() {
            return this;
        },
        status(code) {
            assert.equal(code, 200);
            return this;
        },
        json(valor) {
            return valor;
        }
    };
    const result = await controller.registrar(
        { usuario: { id: 7 }, body: { data: '2026-01-01' }, get: () => 'idempotencia' },
