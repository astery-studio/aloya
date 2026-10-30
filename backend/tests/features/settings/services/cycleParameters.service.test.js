import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleParametersService } from '../../../../src/features/settings/services/cycleParameters.service.js';

function montarService(parametros) {
    const chamadas = { recalculos: [] };
    const prisma = {
        usuario: {
            findUnique: async () => parametros,
            update: async ({ data }) => {
                chamadas.atualizacao = data;
                return data;
            }
        }
    };
    const service = criarCycleParametersService({
        prisma,
        recalcularPrevisoes: async (usuarioId) => chamadas.recalculos.push(usuarioId)
    });
    return { service, chamadas };
}

test('apresenta os valores padrão quando não existem parâmetros manuais', async () => {
    const { service } = montarService({
        duracaoCicloInformada: null,
        duracaoMenstruacaoInformada: null,
        duracaoLuteaInformada: null
    });

    assert.deepEqual(await service.buscar(7), {
        duracaoCicloInformada: 28,
        duracaoMenstruacaoInformada: 5,
        duracaoLuteaInformada: 14
    });
});

test('rejeita consulta de usuário inexistente', async () => {
    const service = criarCycleParametersService({
        prisma: { usuario: { findUnique: async () => null } },
        recalcularPrevisoes: async () => {}
    });
    await assert.rejects(() => service.buscar(999), {
        status: 404,
        codigo: 'USUARIO_NAO_ENCONTRADO'
    });
});

test('rejeita salvamento sem alteração real', async () => {
    const atuais = {
        duracaoCicloInformada: 28,
        duracaoMenstruacaoInformada: 5,
        duracaoLuteaInformada: 14
    };
    const { service } = montarService(atuais);

    await assert.rejects(service.atualizar(7, atuais), {
        codigo: 'NENHUMA_ALTERACAO',
        status: 422
    });
});

test('salva pelo usuário autenticado e dispara o recálculo', async () => {
    const { service, chamadas } = montarService({
        duracaoCicloInformada: 28,
        duracaoMenstruacaoInformada: 5,
        duracaoLuteaInformada: 14
    });
    const novos = {
        duracaoCicloInformada: 30,
        duracaoMenstruacaoInformada: 6,
        duracaoLuteaInformada: 13
    };

    assert.deepEqual(await service.atualizar(7, novos), novos);
    assert.deepEqual(chamadas.atualizacao, novos);
    assert.deepEqual(chamadas.recalculos, [7]);
});
