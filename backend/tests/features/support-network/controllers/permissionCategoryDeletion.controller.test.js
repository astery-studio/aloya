import test from 'node:test';
import assert from 'node:assert/strict';

import { criarPermissionCategoryDeletionController } from '../../../../src/features/support-network/controllers/permissionCategoryDeletion.controller.js';
import { criarPermissionCategoryDeletionValidator } from '../../../../src/features/support-network/validators/permissionCategoryDeletion.validator.js';
import { criarPermissionCategoryValidator } from '../../../../src/features/support-network/validators/permissionCategory.validator.js';

function criarResposta() {
    return {
        statusCode: null,
        headers: {},
        body: null,
        set(nome, valor) {
            this.headers[nome.toLowerCase()] = valor;
            return this;
        },
        status(codigo) {
            this.statusCode = codigo;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

function criarController(service) {
    return criarPermissionCategoryDeletionController({
        permissionCategoryDeletionService: service,
        permissionCategoryDeletionValidator: criarPermissionCategoryDeletionValidator(),
        permissionCategoryValidator: criarPermissionCategoryValidator()
    });
}

function criarRequisicao(sobrescritas = {}) {
    return {
        params: { id: '12' },
        usuario: { id: 1, papel: 'principal' },
        body: {
            atualizadoEm: '2026-10-26T12:00:00.000Z',
            decisoes: []
        },
        ...sobrescritas
    };
}

test('consulta o impacto usando somente a identidade autenticada', async () => {
    let argumentosRecebidos;
    const impacto = {
        categoria: { id: 12, nome: 'Família' },
        quantidadeContatos: 0,
        contatos: []
    };
    const controller = criarController({
        async consultarImpacto(argumentos) {
            argumentosRecebidos = argumentos;
            return impacto;
        }
    });
    const res = criarResposta();

    await controller.consultarImpacto(criarRequisicao(), res, assert.fail);

    assert.deepEqual(argumentosRecebidos, {
        titularId: 1,
        papel: 'principal',
        categoriaId: 12
    });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, impacto);
    assert.equal(res.headers['cache-control'], 'private, no-store');
});

test('rejeita id inválido sem consultar o impacto ou excluir', async () => {
    let quantidadeChamadas = 0;
    const controller = criarController({
        async consultarImpacto() {
            quantidadeChamadas += 1;
        },
        async excluirCategoria() {
            quantidadeChamadas += 1;
        }
    });

    for (const operacao of ['consultarImpacto', 'excluirCategoria']) {
        const res = criarResposta();

        await controller[operacao](criarRequisicao({ params: { id: 'invalido' } }), res, assert.fail);

        assert.equal(res.statusCode, 400);
        assert.equal(res.body.erro.codigo, 'ID_CATEGORIA_INVALIDO');
    }

    assert.equal(quantidadeChamadas, 0);
});

test('rejeita exclusão sem decisões antes de chamar o serviço', async () => {
    let chamado = false;
    const controller = criarController({
        async excluirCategoria() {
            chamado = true;
        }
    });
    const res = criarResposta();

    await controller.excluirCategoria(
        criarRequisicao({ body: { atualizadoEm: '2026-10-26T12:00:00.000Z' } }),
        res,
        assert.fail
    );

    assert.equal(chamado, false);
    assert.equal(res.statusCode, 422);
    assert.equal(res.body.erro.codigo, 'ERRO_VALIDACAO');
    assert.equal(
        res.body.erro.mensagem,
        'Informe uma decisão para cada contato vinculado à categoria.'
    );
});

test('exclui usando a sessão e devolve a confirmação exigida', async () => {
    let argumentosRecebidos;
    const resultado = {
        categoriaId: 12,
        quantidadeAcessosRemovidos: 0,
        quantidadeAcessosMantidos: 0
    };
    const controller = criarController({
        async excluirCategoria(argumentos) {
            argumentosRecebidos = argumentos;
            return resultado;
        }
    });
    const res = criarResposta();

    await controller.excluirCategoria(criarRequisicao(), res, assert.fail);

    assert.deepEqual(argumentosRecebidos, {
        titularId: 1,
        papel: 'principal',
        categoriaId: 12,
        atualizadoEm: new Date('2026-10-26T12:00:00.000Z'),
        decisoes: []
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.mensagem, 'Categoria excluída com sucesso.');
    assert.deepEqual(res.body.resultado, resultado);
    assert.equal(res.headers['cache-control'], 'no-store');
});

test('informa novo impacto quando os vínculos mudam antes da confirmação', async () => {
    const erro = Object.assign(
        new Error(
            'Os contatos vinculados à categoria foram alterados. Revise as escolhas e tente novamente.'
        ),
        {
            status: 409,
            codigo: 'IMPACTO_EXCLUSAO_ALTERADO',
            quantidadeContatos: 3
        }
    );
    const controller = criarController({
        async excluirCategoria() {
            throw erro;
        }
    });
    const res = criarResposta();

    await controller.excluirCategoria(criarRequisicao(), res, assert.fail);

    assert.equal(res.statusCode, 409);
    assert.equal(res.body.erro.codigo, 'IMPACTO_EXCLUSAO_ALTERADO');
    assert.equal(res.body.erro.detalhes.quantidadeContatos, 3);
});

export { criarController, criarRequisicao, criarResposta };
