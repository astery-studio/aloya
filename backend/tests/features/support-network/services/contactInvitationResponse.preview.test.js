import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationResponseService } from '../../../../src/features/support-network/services/contactInvitationResponse.service.js';

const token = 'a'.repeat(43);

function criarService(convite) {
    return criarContactInvitationResponseService({
        prisma: {
            vinculoRedeApoio: {
                async findUnique() {
                    return convite;
                }
            }
        },
        tokenService: { calcularHash: () => 'hash' },
        now: () => new Date('2026-11-08T12:00:00.000Z')
    });
}

test('apresenta titular, categoria e conjunto completo de permissões', async () => {
    const service = criarService({
        id: 1,
        emailConvidado: 'contato@email.com',
        status: 'pendente',
        dataExpiracao: new Date('2026-11-09T12:00:00.000Z'),
        categoriaId: 7,
        permissoesIndividuais: [],
        titular: { nome: 'Julia' },
        categoria: {
            nome: 'Profissional',
            conjuntoDadosVisiveis: ['saude.consultas']
        }
    });

    assert.deepEqual(await service.consultar(token), {
        titular: { nome: 'Julia' },
        tipoPermissao: 'categoria',
        categoria: {
            nome: 'Profissional',
            permissoes: ['saude.consultas']
        },
        permissoesIndividuais: [],
        dataExpiracao: new Date('2026-11-09T12:00:00.000Z')
    });
});

test('apresenta a lista detalhada de permissões individuais', async () => {
    const service = criarService({
        id: 2,
        emailConvidado: 'contato@email.com',
        status: 'pendente',
        dataExpiracao: new Date('2026-11-09T12:00:00.000Z'),
        categoriaId: null,
        permissoesIndividuais: ['geral.fase_atual', 'saude.consultas'],
        titular: { nome: 'Julia' },
        categoria: null
    });

    const resultado = await service.consultar(token);
    assert.equal(resultado.tipoPermissao, 'individual');
    assert.equal(resultado.categoria, null);
    assert.deepEqual(resultado.permissoesIndividuais, ['geral.fase_atual', 'saude.consultas']);
});

test('não diferencia convite inexistente, processado ou expirado', async () => {
    const indisponiveis = [
        null,
        {
            status: 'recusado',
            dataExpiracao: new Date('2026-11-09T12:00:00.000Z')
        },
        {
            status: 'pendente',
            dataExpiracao: new Date('2026-11-08T11:59:59.000Z')
        }
    ];

    for (const convite of indisponiveis) {
        await assert.rejects(() => criarService(convite).consultar(token), {
            status: 410,
            codigo: 'CONVITE_INDISPONIVEL',
            message: 'Este convite não está mais disponível.'
        });
    }
});
