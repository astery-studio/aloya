//Este arquivo testa as regras críticas de segurança do service de conta
import test from 'node:test'
import assert from 'node:assert/strict'
import { criarAccountService } from '../src/services/account.service.js'
import dateUtils from '../src/utils/date.utils.js'

//Cria uma usuária padrão para os testes
function criarUsuario(alteracoes = {}) {
    return {
        id: 1,
        nome: 'Aloya Teste',
        email: 'aloya@email.com',
        genero: 'Mulher Cisgênero',

        dataNascimento:
            new Date('2000-04-08T00:00:00.000Z'),

        atualizadoEm:
            new Date('2026-09-14T12:00:00.000Z'),

        ...alteracoes
    }
}

//Cria um Prisma controlado para testar atualizações sem usar o banco real
function criarPrismaMock(usuario) {
    const prisma = {
        usuario: {
            async findUnique({ where }) {
                if (where.id === usuario.id) {
                    return usuario
                }

                return null
            },

            async update({ data }) {
                return {
                    ...usuario,
                    ...data
                }
            },

            //Simula a atualização condicional da senha quando não houve concorrência
            async updateMany() {
                return {
                    count: 1
                }
            }
        },

        sessao: {
            async updateMany() {
                return {
                    count: 0
                }
            }
        },

        recuperacaoSenha: {
            async updateMany() {
                return {
                    count: 0
                }
            }
        }
    }

    prisma.$transaction =
        async function executar(callback) {
            return callback(prisma)
        }

    return prisma
}

//Cria o service com valores previsíveis
function criarService({
    prisma,
    passwordService = {},
    parentalConsentService = {}
}) {
    return criarAccountService({
        prisma,
        passwordService,
        parentalConsentService,
        dateUtils,

        now: () =>
            new Date(
                '2026-09-14T12:00:00.000Z'
            )
    })
}

//Impede acesso a uma conta que não existe
test(
    'não retorna configurações de uma conta inexistente',
    async function () {
        const prisma =
            criarPrismaMock(
                criarUsuario()
            )

        const service = criarService({
            prisma
        })

        await assert.rejects(
            service.buscarConfiguracoes(99),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'CONTA_NAO_ENCONTRADA'
                )
            }
        )
    }
)

//Impede gravações desnecessárias ou usadas para contornar auditoria
test(
    'rejeita atualização sem alteração real',
    async function () {
        const prisma =
            criarPrismaMock(
                criarUsuario()
            )

        const service = criarService({
            prisma
        })

        await assert.rejects(
            service.atualizarConfiguracoes(
                1,
                {
                    nome: 'Aloya Teste'
                }
            ),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'NENHUMA_ALTERACAO'
                )
            }
        )
    }
)

//Garante defesa em profundidade contra mass assignment no service
test(
    'não envia campos protegidos para o Prisma',
    async function () {
        const usuario = criarUsuario()
        const prisma =
            criarPrismaMock(usuario)

        let dadosRecebidosPeloPrisma = null

        prisma.usuario.update =
            async function atualizar({ data }) {
                dadosRecebidosPeloPrisma = data

                return {
                    ...usuario,
                    ...data
                }
            }

            async function updateMany() {
                return {
                    count: 1
                }
            }

        const service = criarService({
            prisma
        })

        await service.atualizarConfiguracoes(
            1,
            {
                nome: 'Novo Nome',
                papel: 'administrador',
                statusConta: 'ativa',
                senhaHash: 'hash-malicioso'
            }
        )

        assert.deepEqual(
            dadosRecebidosPeloPrisma,
            {
                nome: 'Novo Nome'
            }
        )
    }
)

//Trata a restrição única do banco mesmo com requisições concorrentes
test(
    'converte erro P2002 do banco em conflito de e-mail',
    async function () {
        const usuario = criarUsuario()
        const prisma =
            criarPrismaMock(usuario)

        prisma.usuario.findUnique =
            async function buscar({ where }) {
                if (where.id === 1) {
                    return usuario
                }

                return null
            }

        prisma.usuario.update =
            async function atualizar() {
                const erro = new Error(
                    'Unique constraint failed'
                )

                erro.code = 'P2002'

                throw erro
            }

        const service = criarService({
            prisma
        })

        await assert.rejects(
            service.atualizarConfiguracoes(
                1,
                {
                    email: 'novo@email.com'
                }
            ),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'EMAIL_JA_CADASTRADO'
                    && erro.status === 409
                )
            }
        )
    }
)

//Reativa a proteção parental quando a correção torna a titular menor
test(
    'reativa consentimento quando a idade passa de adulta para menor de 16 anos',
    async function () {
        const usuario = criarUsuario()

        const prisma =
            criarPrismaMock(usuario)

        let titularRecebida = null
        let transacaoRecebida = null

        const parentalConsentService = {
            async reativarAposCorrecaoNascimento(
                tx,
                titularMenorId
            ) {
                transacaoRecebida = tx
                titularRecebida = titularMenorId
            }
        }

        const service = criarService({
            prisma,
            parentalConsentService
        })

        const resultado =
            await service
                .atualizarConfiguracoes(
                    1,
                    {
                        dataNascimento:
                            new Date(
                                '2012-09-14T00:00:00.000Z'
                            )
                    }
                )

        assert.equal(titularRecebida, 1)
        assert.equal(transacaoRecebida, prisma)

        assert.equal(
            resultado
                .consentimentoParentalNecessario,
            true
        )
    }
)

//Não altera consentimentos quando a pessoa continua tendo 16 anos ou mais
test(
    'não reativa consentimento quando a titular continua maior de 16 anos',
    async function () {
        const usuario = criarUsuario()

        const prisma =
            criarPrismaMock(usuario)

        let consentimentoAlterado = false

        const parentalConsentService = {
            async reativarAposCorrecaoNascimento() {
                consentimentoAlterado = true
            }
        }

        const service = criarService({
            prisma,
            parentalConsentService
        })

        const resultado =
            await service
                .atualizarConfiguracoes(
                    1,
                    {
                        dataNascimento:
                            new Date(
                                '2001-09-14T00:00:00.000Z'
                            )
                    }
                )

        assert.equal(
            consentimentoAlterado,
            false
        )

        assert.equal(
            resultado
                .consentimentoParentalNecessario,
            false
        )
    }
)

//Impede alteração quando a senha atual não confere
test(
    'não gera hash quando a senha atual está incorreta',
    async function () {
        const usuario = criarUsuario({
            senhaHash: 'hash-atual'
        })

        const prisma =
            criarPrismaMock(usuario)

        let hashGerado = false
        let transacaoExecutada = false

        prisma.$transaction =
            async function executar() {
                transacaoExecutada = true
            }

        const passwordService = {
            async compararSenha() {
                return false
            },

            async gerarHash() {
                hashGerado = true

                return {
                    senhaHash: 'novo-hash'
                }
            }
        }

        const service = criarService({
            prisma,
            passwordService
        })

        await assert.rejects(
            service.alterarSenha({
                usuarioId: 1,
                sessaoId: 10,
                senhaAtual: 'senha incorreta',
                novaSenha:
                    'Girassol violeta janela 2026'
            }),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'SENHA_ATUAL_INCORRETA'
                )
            }
        )

        assert.equal(hashGerado, false)

        assert.equal(
            transacaoExecutada,
            false
        )
    }
)

//Impede reutilização da mesma senha
test(
    'não permite reutilizar a senha atual',
    async function () {
        const usuario = criarUsuario({
            senhaHash: 'hash-atual'
        })

        const prisma =
            criarPrismaMock(usuario)

        let hashGerado = false

        const passwordService = {
            async compararSenha() {
                return true
            },

            async gerarHash() {
                hashGerado = true

                return {
                    senhaHash: 'novo-hash'
                }
            }
        }

        const service = criarService({
            prisma,
            passwordService
        })

        await assert.rejects(
            service.alterarSenha({
                usuarioId: 1,
                sessaoId: 10,
                senhaAtual: 'senha atual',
                novaSenha: 'senha atual'
            }),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'NOVA_SENHA_IGUAL_ATUAL'
                )
            }
        )

        assert.equal(hashGerado, false)
    }
)

//Confirma que somente as outras sessões são encerradas
test(
    'preserva a sessão atual e revoga links de recuperação',
    async function () {
        const usuario = criarUsuario({
            senhaHash: 'hash-atual'
        })

        const prisma =
            criarPrismaMock(usuario)

        let filtroSessoes = null
        let filtroRecuperacoes = null
        let quantidadeComparacoes = 0

        prisma.sessao.updateMany =
            async function atualizar({ where }) {
                filtroSessoes = where

                return {
                    count: 3
                }
            }

        prisma.recuperacaoSenha.updateMany =
            async function atualizar({ where }) {
                filtroRecuperacoes = where

                return {
                    count: 1
                }
            }

        const passwordService = {
            async compararSenha() {
                quantidadeComparacoes += 1

                return quantidadeComparacoes === 1
            },

            async gerarHash() {
                return {
                    senhaHash: 'novo-hash'
                }
            }
        }

        const service = criarService({
            prisma,
            passwordService
        })

        await service.alterarSenha({
            usuarioId: 1,
            sessaoId: 77,
            senhaAtual: 'senha atual',
            novaSenha:
                'Girassol violeta janela 2026'
        })

        assert.equal(
            filtroSessoes.usuarioId,
            1
        )

        assert.equal(
            filtroSessoes.id.not,
            77
        )

        assert.equal(
            filtroSessoes.revogadaEm,
            null
        )

        assert.deepEqual(
            filtroRecuperacoes,
            {
                usuarioId: 1,
                statusLink: 'pendente'
            }
        )
    }
)