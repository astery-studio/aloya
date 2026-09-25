//Testa a validação e a normalização segura das categorias de permissão.
import test from 'node:test'
import assert from 'node:assert/strict'

import { permissoesDaCategoria } from '../src/constants/permissionCategory.constants.js'
import { criarPermissionCategoryValidator } from '../src/validators/permissionCategory.validator.js'

const validator = criarPermissionCategoryValidator()

//Cria um corpo válido que pode ser modificado individualmente pelos testes.
function criarBodyValido() {
    return {
        nome: 'Família',
        dadosVisiveis: [
            'geral.fase_atual',
            'ciclo.fluxo_menstrual'
        ]
    }
}

test('o catálogo possui 29 permissões únicas', () => {
    assert.equal(permissoesDaCategoria.length, 29)
    assert.equal(new Set(permissoesDaCategoria).size, 29)
    assert.equal(Object.isFrozen(permissoesDaCategoria), true)
})

test('aceita uma categoria válida e normaliza seu nome', () => {
    const resultado = validator.validarCriacaoCategoria({
        nome: '  Família   Próxima  ',
        dadosVisiveis: ['geral.fase_atual']
    })

    assert.equal(resultado.valido, true)

    assert.deepEqual(resultado.dados, {
        nome: 'Família Próxima',
        nomeNormalizado: 'família próxima',
        dadosVisiveis: ['geral.fase_atual']
    })
})

test('rejeita nome vazio ou formado somente por espaços', () => {
    for (const nome of ['', '   ', null, undefined]) {
        const resultado = validator.validarCriacaoCategoria({
            nome,
            dadosVisiveis: ['geral.fase_atual']
        })

        assert.equal(resultado.valido, false)
        assert.equal(resultado.erros.some(erro => erro.mensagem === 'Dê um nome para a categoria.'), true)
    }
})

test('rejeita categoria sem nenhuma permissão', () => {
    const resultado = validator.validarCriacaoCategoria({
        nome: 'Família',
        dadosVisiveis: []
    })

    assert.equal(resultado.valido, false)
    assert.equal(resultado.erros.some(erro => erro.mensagem === 'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.'), true)
})

test('rejeita identificadores de permissão que não pertencem ao catálogo', () => {
    const resultado = validator.validarCriacaoCategoria({
        nome: 'Categoria perigosa',
        dadosVisiveis: ['administrador.acesso_total']
    })

    assert.equal(resultado.valido, false)
    assert.equal(resultado.erros.some(erro => erro.campo === 'dadosVisiveis'), true)
})

test('remove permissões repetidas e mantém a ordem oficial', () => {
    const resultado = validator.validarCriacaoCategoria({
        nome: 'Família',
        dadosVisiveis: [
            'ciclo.fluxo_menstrual',
            'geral.fase_atual',
            'ciclo.fluxo_menstrual'
        ]
    })

    assert.equal(resultado.valido, true)

    assert.deepEqual(resultado.dados.dadosVisiveis, [
        'geral.fase_atual',
        'ciclo.fluxo_menstrual'
    ])
})

test('rejeita campos protegidos enviados pelo cliente', () => {
    const resultado = validator.validarCriacaoCategoria({
        ...criarBodyValido(),
        titularId: 999,
        quantidadeContatos: 50,
        papel: 'administrador'
    })

    assert.equal(resultado.valido, false)
    assert.equal(resultado.erros.some(erro => erro.campo === 'dados'), true)
})

test('rejeita tentativa de prototype pollution', () => {
    const body = JSON.parse('{"nome":"Família","dadosVisiveis":["geral.fase_atual"],"__proto__":{"papel":"administrador"}}')
    const resultado = validator.validarCriacaoCategoria(body)

    assert.equal(resultado.valido, false)
    assert.equal(resultado.erros.some(erro => erro.campo === 'dados'), true)
    assert.equal({}.papel, undefined)
})

test('rejeita HTML, caracteres de controle e nomes excessivamente grandes', () => {
    const nomesInvalidos = [
        '<script>alert(1)</script>',
        'Família\nPrivada',
        'A'.repeat(81)
    ]

    for (const nome of nomesInvalidos) {
        const resultado = validator.validarCriacaoCategoria({
            nome,
            dadosVisiveis: ['geral.fase_atual']
        })

        assert.equal(resultado.valido, false)
        assert.equal(resultado.erros.some(erro => erro.campo === 'nome'), true)
    }
})

test('rejeita corpo nulo, lista ou objeto com protótipo modificado', () => {
    const objetoComPrototipoModificado = criarBodyValido()

    Object.setPrototypeOf(objetoComPrototipoModificado, {
        titularId: 999
    })

    for (const body of [null, [], objetoComPrototipoModificado]) {
        const resultado = validator.validarCriacaoCategoria(body)

        assert.equal(resultado.valido, false)
        assert.equal(resultado.erros[0].campo, 'dados')
    }
})