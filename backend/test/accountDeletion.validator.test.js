//Este arquivo testa confirmação, senha e rejeição de campos indevidos
import test from 'node:test'
import assert from 'node:assert/strict'

import { criarAccountDeletionValidator } from '../src/validators/accountDeletion.validator.js'

//Cria o validator usado nos testes
function criarValidator() {
    return criarAccountDeletionValidator()
}

test(
    'aceita senha e confirmação explícita',
    function () {
        const resultado =
            criarValidator()
                .validarExclusao({
                    senhaAtual:
                        'minha senha atual',

                    confirmarExclusao:
                        true
                })

        assert.equal(resultado.valido, true)

        assert.equal(
            resultado.dados.senhaAtual,
            'minha senha atual'
        )
    }
)

test(
    'cancelamento do modal não autoriza exclusão',
    function () {
        const resultado =
            criarValidator()
                .validarExclusao({
                    senhaAtual:
                        'minha senha atual',

                    confirmarExclusao:
                        false
                })

        assert.equal(resultado.valido, false)
    }
)

test(
    'rejeita corpo vazio e senha ausente',
    function () {
        const resultado =
            criarValidator()
                .validarExclusao({
                    confirmarExclusao:
                        true
                })

        assert.equal(resultado.valido, false)
    }
)

test(
    'rejeita campos de outra conta ou alteração de papel',
    function () {
        const resultado =
            criarValidator()
                .validarExclusao({
                    senhaAtual:
                        'minha senha atual',

                    confirmarExclusao:
                        true,

                    usuarioId:
                        2,

                    papel:
                        'principal'
                })

        assert.equal(resultado.valido, false)
    }
)

test(
    'rejeita tentativa de prototype pollution',
    function () {
        const body = JSON.parse(
            '{"senhaAtual":"minha senha","confirmarExclusao":true,"__proto__":{"papel":"principal"}}'
        )

        const resultado =
            criarValidator()
                .validarExclusao(body)

        assert.equal(resultado.valido, false)
    }
)

test(
    'rejeita senha maior que o limite efetivo do bcrypt',
    function () {
        const resultado =
            criarValidator()
                .validarExclusao({
                    senhaAtual:
                        'á'.repeat(37),

                    confirmarExclusao:
                        true
                })

        assert.equal(resultado.valido, false)
    }
)