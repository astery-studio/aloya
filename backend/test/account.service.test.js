//Este teste serve para testar o serviço de conta, garantindo que as funcionalidades relacionadas à conta do usuário funcionem corretamente.

const test = require('node:test')
const assert = require('node:assert/strict')

const { criarAccountService } = require('../src/services/account.service')
const dateUtils = require('../src/utils/date.utils')

//Funcao para criar um usuário de teste com valores padrão, podendo sobrescrever com o objeto alteracoes
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

//Funcao para criar um mock do prisma com um usuário de teste
function criarPrismaMock(usuario) {
    const prisma = {
        usuario: {
            async findUnique({ where }) {
                if (where.id === 1) {
                    return usuario
                }

                return null
            },

            async update({ data }) {
                return criarUsuario({
                    ...usuario,
                    ...data
                })
            }
        },

        sessao: {
            async updateMany() {
                return {
                    count: 2
                }
            }
        },

        recuperacaoSenha: {
            async updateMany() {
                return {
                    count: 1
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

// Testes do serviço de conta
test(
    'retorna somente os campos das configurações',
    // Funcao de teste assíncrona
    async function () {
        const prisma = criarPrismaMock(
            criarUsuario({
                senhaHash:
                    'nao-deve-ser-retornado'
            })
        )

        const service = criarAccountService({
            prisma,
            passwordService: {},
            parentalConsentService: {},
            dateUtils
        })

        const resultado =
            await service.buscarConfiguracoes(1);

        assert.equal(resultado.id, 1);
        assert.equal(
            resultado.email,
            'aloya@email.com'
        )

        assert.equal(
            Object.hasOwn(
                resultado,
                'senhaHash'
            ),
            false
        )
    }
)

// Teste para verificar se o serviço rejeita a atualização de e-mail para um já existente
test(
    'rejeita e-mail utilizado por outra conta',
    async function () {
        const prisma = criarPrismaMock(
            criarUsuario()
        )

        prisma.usuario.findUnique =
            async function buscar({ where }) {
                if (where.id === 1) {
                    return criarUsuario();
                }

                if (
                    where.email
                    === 'existente@email.com'
                ) {
                    return {
                        id: 2
                    }
                }

                return null
            }

        const service = criarAccountService({
            prisma,
            passwordService: {},
            parentalConsentService: {},
            dateUtils
        })

        await assert.rejects(
            service.atualizarConfiguracoes(
                1,
                {
                    email:
                        'existente@email.com'
                }
            ),

            function validarErro(erro) {
                return (
                    erro.codigo
                    === 'EMAIL_JA_CADASTRADO'
                )
            }
        )
    }
)

// Teste para verificar se o serviço altera a senha e revoga outras sessões
test(
    'altera a senha e revoga outras sessões',
    async function () {
        let senhaHashPersistida = null;

        const prisma = criarPrismaMock(
            criarUsuario({
                senhaHash: 'hash-atual'
            })
        )

        prisma.usuario.update =
            async function atualizar({ data }) {
                senhaHashPersistida =
                    data.senhaHash;

                return criarUsuario();
            }

            async function updateMany() {
                return {
                    count: 1
                }
            }

        let quantidadeComparacoes = 0;

        const passwordService = {
            async compararSenha() {
                quantidadeComparacoes += 1;

                return quantidadeComparacoes === 1;
            },

            async gerarHash() {
                return {
                    senhaHash: 'novo-hash'
                }
            }
        }

        const service = criarAccountService({
            prisma,
            passwordService,
            parentalConsentService: {},
            dateUtils
        })

        const resultado =
            await service.alterarSenha({
                usuarioId: 1,
                sessaoId: 10,
                senhaAtual: 'senha atual',
                novaSenha:
                    'uma frase secreta longa'
            })

        assert.equal(
            senhaHashPersistida,
            'novo-hash'
        )

        assert.equal(
            resultado.outrasSessoesEncerradas,
            2
        )
    }
)