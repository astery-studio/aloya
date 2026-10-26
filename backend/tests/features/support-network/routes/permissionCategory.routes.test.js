//Testa se a criação de categorias utiliza todas as proteções na ordem correta.
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarPermissionCategoryRoutes } from '../../../../src/features/support-network/routes/permissionCategory.routes.js'

test('protege a criação com autenticação, consentimento e limite de requisições', () => {
    const chamadas = []

    const router = {
        use(...argumentos) {
            chamadas.push([
                'use',
                ...argumentos
            ])
        },

        post(...argumentos) {
            chamadas.push([
                'post',
                ...argumentos
            ])
        },

        get(...argumentos) {
            chamadas.push([
                'get',
                ...argumentos
            ])
        }
    }

    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function limitarCriacao() {}
    function criarCategoria() {}
    function listarCategorias() {}

    criarPermissionCategoryRoutes({
        Router() {
            return router
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
            listarCategorias
        }
    })

    assert.deepEqual(chamadas, [
        [
            'use',
            autenticar
        ],
        [
            'use',
            exigirAcessoRedeApoio
        ],
        [
            'get',
            '/permission-categories',
            listarCategorias
        ],
        [
            'post',
            '/permission-categories',
            limitarCriacao,
            criarCategoria
        ]
    ])
})

test('registra as proteções antes do endpoint de criação', () => {
    const ordem = []

    const router = {
        use(middleware) {
            ordem.push(middleware.name)
        },

        post(_caminho, limite, controller) {
            ordem.push(limite.name)
            ordem.push(controller.name)
        },

        get(_caminho, controller) {
            ordem.push(controller.name)
        }
    }

    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function limitarCriacao() {}
    function criarCategoria() {}
    function listarCategorias() {}

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
            listarCategorias
        }
    })

    assert.deepEqual(ordem, [
        'autenticar',
        'exigirAcessoRedeApoio',
        'listarCategorias',
        'limitarCriacao',
        'criarCategoria'
    ])
})

test('não aplica o limitador de criação à consulta da lista', () => {
    const chamadasGet = []

    function listarCategorias() {}
    function limitarCriacao() {}

    criarPermissionCategoryRoutes({
        Router: () => ({
            use() {},
            get(caminho, ...middlewares) {
                chamadasGet.push([caminho, ...middlewares])
            },
            post() {}
        }),
        authMiddleware: {
            autenticar() {}
        },
        parentalConsentMiddleware: {
            exigirAcessoRedeApoio() {}
        },
        permissionCategoryRateLimit: limitarCriacao,
        permissionCategoryController: {
            criarCategoria() {},
            listarCategorias
        }
    })

    assert.deepEqual(chamadasGet, [
        [
            '/permission-categories',
            listarCategorias
        ]
    ])
    assert.equal(chamadasGet[0].includes(limitarCriacao), false)
})
