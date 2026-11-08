import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationPermissionService } from '../../../../src/features/support-network/services/contactInvitationPermission.service.js';

test('resolve permissões individuais na ordem segura do catálogo', () => {
    const service = criarContactInvitationPermissionService();

    const resultado = service.resolverPermissoesIndividuais([
        'saude.consultas',
        'geral.fase_atual',
        'saude.consultas'
    ]);

    assert.deepEqual(resultado, {
        tipo: 'individual',
        categoriaId: null,
        categoriaNome: null,
        permissoesIndividuais: ['geral.fase_atual', 'saude.consultas']
    });
});

test('rejeita seleção vazia, desconhecida ou excessiva no service', () => {
    const service = criarContactInvitationPermissionService();
    const selecoes = [[], ['permissao.inexistente'], new Array(30).fill('geral.fase_atual')];

    for (const selecao of selecoes) {
        assert.throws(() => service.resolverPermissoesIndividuais(selecao), {
            codigo: 'PERMISSOES_INDIVIDUAIS_INVALIDAS',
            status: 422
        });
    }
});
