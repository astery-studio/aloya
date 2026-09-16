//Este arquivo testa entradas maliciosas e limites de segurança do validator de conta
import test from 'node:test'
import assert from 'node:assert/strict'

const { criarAccountValidator } = require('../src/validators/account.validator')

const dateUtils = require('../src/utils/date.utils')

//Cria o validator com as mesmas dependências utilizadas pela aplicação
function criarValidator() {
    return criarAccountValidator({
        dateUtils
    })
}

//Garante que valores diferentes de um objeto JSON não sejam processados
test(
    'rejeita corpo nulo ou em formato de lista',
    function () {
        const validator = criarValidator()

        const resultadoNulo =
            validator.validarAtualizacao(null)

        const resultadoLista =
            validator.validarAtualizacao([])

        assert.equal(
            resultadoNulo.valido,
            false
        )

        assert.equal(
            resultadoLista.valido,
            false
        )
    }
)

//Impede requisições vazias que não produzem nenhuma alteração
test(
    'rejeita atualização sem nenhum campo',
    function () {
        const validator = criarValidator()

        const resultado =
            validator.validarAtualizacao({})

        assert.equal(resultado.valido, false)

        assert.equal(
            resultado.erros.some(
                (item) =>
                    item.campo === 'dados'
            ),
            true
        )
    }
)

//Impede mass assignment de campos protegidos da conta
test(
    'rejeita tentativa de alterar papel ou status da conta',
    function () {
        const validator = criarValidator()

        const resultado =
            validator.validarAtualizacao({
                nome: 'Maria Segura',
                papel: 'administrador',
                statusConta: 'ativa'
            })

        assert.equal(resultado.valido, false)
    }
)

//Impede que propriedades especiais sejam aceitas no corpo
test(
    'rejeita tentativa de prototype pollution',
    function () {
        const validator = criarValidator()

        const body = JSON.parse(
            '{"nome":"Maria Segura","__proto__":{"papel":"administrador"}}'
        )

        const resultado =
            validator.validarAtualizacao(body)

        assert.equal(resultado.valido, false)
    }
)

//Impede a persistência de marcação HTML ou JavaScript no nome
test(
    'rejeita código HTML no nome',
    function () {
        const validator = criarValidator()

        const resultado =
            validator.validarAtualizacao({
                nome: '<script>alert(1)</script>'
            })

        assert.equal(resultado.valido, false)
    }
)

//Impede valores de tipos inesperados nos campos textuais
test(
    'rejeita objetos nos campos textuais',
    function () {
        const validator = criarValidator()

        const resultado =
            validator.validarAtualizacao({
                nome: {
                    valor: 'Maria'
                },

                email: {
                    valor: 'maria@email.com'
                },

                identidadeGenero: {
                    valor: 'Outro'
                }
            })

        assert.equal(resultado.valido, false)
    }
)

//Impede e-mails com quebra de linha que podem causar injeção em cabeçalhos
test(
    'rejeita e-mail com quebra de linha',
    function () {
        const validator = criarValidator()

        const resultado =
            validator.validarAtualizacao({
                email:
                    'maria@email.com\noutro@email.com'
            })

        assert.equal(resultado.valido, false)
    }
)

//Rejeita datas inexistentes mesmo quando possuem o formato correto
test(
    'rejeita data de nascimento inexistente',
    function () {
        const validator = criarValidator()

        const resultado =
            validator.validarAtualizacao({
                dataNascimento: '2025-02-30'
            })

        assert.equal(resultado.valido, false)
    }
)

//Permite remover a informação opcional de identidade de gênero
test(
    'aceita identidade de gênero nula',
    function () {
        const validator = criarValidator()

        const resultado =
            validator.validarAtualizacao({
                identidadeGenero: null
            })

        assert.equal(resultado.valido, true)

        assert.equal(
            resultado.dados.identidadeGenero,
            null
        )
    }
)

//Impede campos adicionais na requisição de alteração de senha
test(
    'rejeita campos desconhecidos na alteração de senha',
    function () {
        const validator = criarValidator()

        const resultado =
            validator.validarAlteracaoSenha({
                senhaAtual:
                    'senha atual segura',

                novaSenha:
                    'uma frase secreta realmente longa',

                confirmacaoNovaSenha:
                    'uma frase secreta realmente longa',

                papel: 'administrador'
            })

        assert.equal(resultado.valido, false)
    }
)

//Impede senhas que ultrapassam o limite efetivo do bcrypt
test(
    'rejeita nova senha maior que 72 bytes',
    function () {
        const validator = criarValidator()

        const senhaMuitoGrande =
            'á'.repeat(37)

        const resultado =
            validator.validarAlteracaoSenha({
                senhaAtual:
                    'senha atual segura',

                novaSenha:
                    senhaMuitoGrande,

                confirmacaoNovaSenha:
                    senhaMuitoGrande
            })

        assert.equal(resultado.valido, false)

        assert.equal(
            resultado.erros.some(
                (item) =>
                    item.campo === 'novaSenha'
            ),
            true
        )
    }
)

//Impede o uso de uma senha conhecida e previsível
test(
    'rejeita senha presente na lista de senhas bloqueadas',
    function () {
        const validator = criarValidator()

        const resultado =
            validator.validarAlteracaoSenha({
                senhaAtual:
                    'senha atual segura',

                novaSenha:
                    '123456789012345',

                confirmacaoNovaSenha:
                    '123456789012345'
            })

        assert.equal(resultado.valido, false)
    }
)

//Confirma que uma frase secreta longa e válida é aceita
test(
    'aceita frase secreta longa e válida',
    function () {
        const validator = criarValidator()

        const resultado =
            validator.validarAlteracaoSenha({
                senhaAtual:
                    'senha atual segura',

                novaSenha:
                    'Girassol violeta janela 2026',

                confirmacaoNovaSenha:
                    'Girassol violeta janela 2026'
            })

        assert.equal(resultado.valido, true)
    }
)