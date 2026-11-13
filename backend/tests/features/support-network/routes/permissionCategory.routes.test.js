//Testa se a criação de categorias utiliza todas as proteções na ordem correta.
import test from 'node:test';
import assert from 'node:assert/strict';

import { criarPermissionCategoryRoutes } from '../../../../src/features/support-network/routes/permissionCategory.routes.js';

test('protege a criação com autenticação, consentimento e limite de requisições', () => {
    const chamadas = [];

    const router = {
        use(...argumentos) {
            chamadas.push(['use', ...argumentos]);
        },

        post(...argumentos) {
            chamadas.push(['post', ...argumentos]);
        },

        get(...argumentos) {
            chamadas.push(['get', ...argumentos]);
        },

        put(...argumentos) {
            chamadas.push(['put', ...argumentos]);
        }
    };

    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function limitarCriacao() {}
    function criarCategoria() {}
    function listarCategorias() {}
    function editarCategoria() {}

    criarPermissionCategoryRoutes({
        Router() {
            return router;
        },
        authMiddleware: {
            autenticar
        },
        parentalConsentMiddleware: {
            exigirAcessoRedeApoio
        },
        permissionCategoryRateLimit: limitarCriacao,
        permissionCategoryController: {
            criarCategoria,
            listarCategorias,
            editarCategoria
        }
    });

    assert.deepEqual(chamadas, [
        ['get', '/permission-categories', autenticar, exigirAcessoRedeApoio, listarCategorias],
        [
            'post',
            '/permission-categories',
            autenticar,
            exigirAcessoRedeApoio,
            limitarCriacao,
            criarCategoria
        ],
        [
            'put',
            '/permission-categories/:id',
            autenticar,
            exigirAcessoRedeApoio,
            limitarCriacao,
            editarCategoria
        ]
    ]);
});

test('registra as proteções antes do endpoint de criação', () => {
    const ordem = [];

    const router = {
        post(_caminho, ...handlers) {
            ordem.push(...handlers.map(({ name }) => name));
        },

        get(_caminho, ...handlers) {
            ordem.push(...handlers.map(({ name }) => name));
        },

        put(_caminho, ...handlers) {
            ordem.push(...handlers.map(({ name }) => name));
        }
    };

    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function limitarCriacao() {}
    function criarCategoria() {}
    function listarCategorias() {}
    function editarCategoria() {}

    criarPermissionCategoryRoutes({
        Router: () => router,
        authMiddleware: {
            autenticar
        },
        parentalConsentMiddleware: {
            exigirAcessoRedeApoio
        },
        permissionCategoryRateLimit: limitarCriacao,
        permissionCategoryController: {
            criarCategoria,
            listarCategorias,
            editarCategoria
        }
    });

    assert.deepEqual(ordem, [
        'autenticar',
        'exigirAcessoRedeApoio',
        'listarCategorias',
        'autenticar',
        'exigirAcessoRedeApoio',
        'limitarCriacao',
        'criarCategoria',
        'autenticar',
        'exigirAcessoRedeApoio',
        'limitarCriacao',
        'editarCategoria'
    ]);
});

test('não aplica o limitador de criação à consulta da lista', () => {
    const chamadasGet = [];

    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function listarCategorias() {}
    function limitarCriacao() {}

    criarPermissionCategoryRoutes({
        Router: () => ({
            use() {},
            get(caminho, ...middlewares) {
                chamadasGet.push([caminho, ...middlewares]);
            },
            post() {},
            put() {},
            delete() {}
        }),
        authMiddleware: {
            autenticar
        },
        parentalConsentMiddleware: {
            exigirAcessoRedeApoio
        },
        permissionCategoryRateLimit: limitarCriacao,
        permissionCategoryController: {
            criarCategoria() {},
            listarCategorias
        }
    });

    assert.deepEqual(chamadasGet, [
        ['/permission-categories', autenticar, exigirAcessoRedeApoio, listarCategorias]
    ]);
    assert.equal(chamadasGet[0].includes(limitarCriacao), false);
});

test('protege a atualização com autenticação, consentimento e limite próprio', () => {
    const chamadasPut = [];
    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function limitarAtualizacao() {}
    function editarCategoria() {}

    criarPermissionCategoryRoutes({
        Router: () => ({
            use() {},
            get() {},
            post() {},
            put(caminho, ...middlewares) {
                chamadasPut.push([caminho, ...middlewares]);
            }
        }),
        authMiddleware: { autenticar },
        parentalConsentMiddleware: { exigirAcessoRedeApoio },
        permissionCategoryRateLimit() {},
        permissionCategoryUpdateRateLimit: limitarAtualizacao,
        permissionCategoryController: {
            criarCategoria() {},
            listarCategorias() {},
            editarCategoria
        }
    });

    assert.deepEqual(chamadasPut, [
        [
            '/permission-categories/:id',
            autenticar,
            exigirAcessoRedeApoio,
            limitarAtualizacao,
            editarCategoria
        ]
    ]);
});

test('expõe a consulta protegida do impacto da exclusão', () => {
    const chamadasGet = [];
    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function consultarImpacto() {}

    criarPermissionCategoryRoutes({
        Router: () => ({
            use() {},
            get(caminho, ...middlewares) {
                chamadasGet.push([caminho, ...middlewares]);
            },
            post() {},
            put() {},
            delete() {}
        }),
        authMiddleware: { autenticar },
        parentalConsentMiddleware: { exigirAcessoRedeApoio },
        permissionCategoryRateLimit() {},
        permissionCategoryController: {
            criarCategoria() {},
            listarCategorias() {},
            editarCategoria() {}
        },
        permissionCategoryDeletionController: {
            consultarImpacto,
            excluirCategoria() {}
        }
    });

    assert.deepEqual(chamadasGet.at(-1), [
        '/permission-categories/:id/deletion-impact',
        autenticar,
        exigirAcessoRedeApoio,
        consultarImpacto
    ]);
});

test('protege a exclusão com limite próprio após autenticação e consentimento', () => {
    const chamadasDelete = [];
    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function limitarExclusao() {}
    function excluirCategoria() {}

    criarPermissionCategoryRoutes({
        Router: () => ({
            use() {},
            get() {},
            post() {},
            put() {},
            delete(caminho, ...middlewares) {
                chamadasDelete.push([caminho, ...middlewares]);
            }
        }),
        authMiddleware: { autenticar },
        parentalConsentMiddleware: { exigirAcessoRedeApoio },
        permissionCategoryRateLimit() {},
        permissionCategoryDeletionRateLimit: limitarExclusao,
        permissionCategoryController: {
            criarCategoria() {},
            listarCategorias() {},
            editarCategoria() {}
        },
        permissionCategoryDeletionController: {
            consultarImpacto() {},
            excluirCategoria
        }
    });

    assert.deepEqual(chamadasDelete, [
        [
            '/permission-categories/:id',
            autenticar,
            exigirAcessoRedeApoio,
            limitarExclusao,
            excluirCategoria
        ]
    ]);
});
