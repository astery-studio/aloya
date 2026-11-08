import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationPermissionService } from '../../../../src/features/support-network/services/contactInvitationPermission.service.js';

test('resolve somente categoria pertencente à titular autenticada', async () => {
    let consulta;
    const prisma = {
        categoriaPermissao: {
            async findFirst(argumentos) {
                consulta = argumentos;
                return { id: 4, nome: 'Família' };
            }
        }
    };
    const service = criarContactInvitationPermissionService({ prisma });

    const resultado = await service.resolverCategoria({ titularId: 2, categoriaId: 4 });

    assert.deepEqual(consulta.where, { id: 4, titularId: 2 });
    assert.deepEqual(resultado, {
        tipo: 'categoria',
        categoriaId: 4,
        categoriaNome: 'Família',
        permissoesIndividuais: []
    });
});

test('não diferencia categoria inexistente de categoria de outra titular', async () => {
    const prisma = {
        categoriaPermissao: { async findFirst() { return null; } }
    };
    const service = criarContactInvitationPermissionService({ prisma });

    await assert.rejects(service.resolverCategoria({ titularId: 2, categoriaId: 99 }), {
        codigo: 'CATEGORIA_NAO_ENCONTRADA',
        status: 404
    });
});

test('rejeita dependência de categoria incompleta', async () => {
    const service = criarContactInvitationPermissionService();

    await assert.rejects(service.resolverCategoria({ titularId: 2, categoriaId: 1 }), {
        name: 'TypeError',
        message: 'Não foi possível consultar a categoria de permissão.'
    });
});
