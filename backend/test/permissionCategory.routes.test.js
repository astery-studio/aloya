//Testa se a criação de categorias utiliza todas as proteções na ordem correta.
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarPermissionCategoryRoutes } from '../src/routes/permissionCategory.routes.js'

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
        }
    }

    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function limitarCriacao() {}
    function criarCategoria() {}

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
            criarCategoria
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
        }
    }

    function autenticar() {}
    function exigirAcessoRedeApoio() {}
    function limitarCriacao() {}
    function criarCategoria() {}

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
            criarCategoria
        }
    })

    assert.deepEqual(ordem, [
        'autenticar',
        'exigirAcessoRedeApoio',
        'limitarCriacao',
        'criarCategoria'
    ])
})