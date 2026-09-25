//Testa validação, requisição autenticada e proteção contra criações duplicadas.
import {endpoints} from '../../services/api/endpoints'
import {criarSupportCategoryService} from '../../features/support-network/services/supportCategoryService'

const dadosValidos = Object.freeze({
    nome: 'Família',
    dadosVisiveis: Object.freeze([
        'geral.fase_atual',
        'ciclo.fluxo_menstrual'
    ])
})

function criarResposta(alteracoes = {}) {
    return {
        mensagem: 'Categoria criada com sucesso.',
        categoria: {
            id: 10,
            nome: 'Família',
            dadosVisiveis: [
                'geral.fase_atual',
                'ciclo.fluxo_menstrual'
            ],
            quantidadeContatos: 0,
            criadoEm: '2026-09-25T10:00:00.000Z',
            atualizadoEm: '2026-09-25T10:00:00.000Z',
            ...alteracoes
        }
    }
}

describe('supportCategoryService', () => {
    test('rejeita dependência ausente ou inválida', () => {
        expect(
            () => criarSupportCategoryService({})
        ).toThrow('Não foi possível configurar o serviço de categorias.')

        expect(
            () => criarSupportCategoryService({
                requisicaoAutenticada: 'não é uma função'
            })
        ).toThrow('Não foi possível configurar o serviço de categorias.')
    })

    test('cria uma categoria usando a sessão autenticada', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue(criarResposta())
        const service = criarSupportCategoryService({requisicaoAutenticada})
        const categoria = await service.criarCategoria(dadosValidos)

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'POST',
            caminho: endpoints.categoriasPermissao,
            corpo: {
                nome: 'Família',
                dadosVisiveis: [
                    'geral.fase_atual',
                    'ciclo.fluxo_menstrual'
                ]
            }
        })

        expect(categoria).toEqual(criarResposta().categoria)
        expect(Object.isFrozen(categoria)).toBe(true)
        expect(Object.isFrozen(categoria.dadosVisiveis)).toBe(true)
    })

    test('normaliza o nome e ordena as permissões', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue(criarResposta())
        const service = criarSupportCategoryService({requisicaoAutenticada})

        await service.criarCategoria({
            nome: '  Família   Próxima  ',
            dadosVisiveis: [
                'ciclo.fluxo_menstrual',
                'geral.fase_atual',
                'ciclo.fluxo_menstrual'
            ]
        })

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'POST',
            caminho: endpoints.categoriasPermissao,
            corpo: {
                nome: 'Família Próxima',
                dadosVisiveis: [
                    'geral.fase_atual',
                    'ciclo.fluxo_menstrual'
                ]
            }
        })
    })

    test('remove campos privados presentes na resposta', async () => {
        const resposta = criarResposta({
            titularId: 999,
            nomeNormalizado: 'família',
            token: 'token privado'
        })

        const service = criarSupportCategoryService({
            requisicaoAutenticada: jest.fn().mockResolvedValue(resposta)
        })

        const categoria = await service.criarCategoria(dadosValidos)

        expect(categoria).not.toHaveProperty('titularId')
        expect(categoria).not.toHaveProperty('nomeNormalizado')
        expect(categoria).not.toHaveProperty('token')
    })

    test.each([
        null,
        undefined,
        [],
        'categoria',
        {},
        {
            nome: 'Família'
        },
        {
            dadosVisiveis: ['geral.fase_atual']
        },
        {
            nome: '',
            dadosVisiveis: ['geral.fase_atual']
        },
        {
            nome: '<Família>',
            dadosVisiveis: ['geral.fase_atual']
        },
        {
            nome: 'Família',
            dadosVisiveis: []
        },
        {
            nome: 'Família',
            dadosVisiveis: ['administrador.acesso_total']
        },
        {
            nome: 'Família',
            dadosVisiveis: ['geral.fase_atual'],
            titularId: 999
        }
    ])('rejeita dados inválidos antes da requisição: %p', async dados => {
        const requisicaoAutenticada = jest.fn()
        const service = criarSupportCategoryService({requisicaoAutenticada})

        await expect(
            Promise.resolve().then(() => service.criarCategoria(dados))
        ).rejects.toMatchObject({
            message: 'Os dados da categoria são inválidos.',
            codigo: 'DADOS_CATEGORIA_INVALIDOS'
        })

        expect(requisicaoAutenticada).not.toHaveBeenCalled()
    })

    test('rejeita resposta inválida da API', async () => {
        const service = criarSupportCategoryService({
            requisicaoAutenticada: jest.fn().mockResolvedValue({
                mensagem: 'Categoria criada.',
                categoria: {
                    id: 10,
                    nome: 'Família',
                    dadosVisiveis: ['administrador.acesso_total'],
                    quantidadeContatos: 0,
                    criadoEm: '2026-09-25T10:00:00.000Z',
                    atualizadoEm: '2026-09-25T10:00:00.000Z'
                }
            })
        })

        await expect(
            service.criarCategoria(dadosValidos)
        ).rejects.toThrow('Não foi possível carregar a categoria de permissão.')
    })

    test('repassa erros controlados da API', async () => {
        const erro = new Error('Você já tem uma categoria com esse nome.')
        erro.codigo = 'CATEGORIA_NOME_DUPLICADO'
        erro.status = 409

        const service = criarSupportCategoryService({
            requisicaoAutenticada: jest.fn().mockRejectedValue(erro)
        })

        await expect(
            service.criarCategoria(dadosValidos)
        ).rejects.toBe(erro)
    })

    test('reutiliza a mesma criação enquanto ela está em andamento', async () => {
        let concluirRequisicao

        const requisicaoAutenticada = jest.fn(() => new Promise(resolve => {
            concluirRequisicao = resolve
        }))

        const service = criarSupportCategoryService({requisicaoAutenticada})
        const primeiraCriacao = service.criarCategoria(dadosValidos)
        const segundaCriacao = service.criarCategoria(dadosValidos)

        expect(primeiraCriacao).toBe(segundaCriacao)
        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1)

        concluirRequisicao(criarResposta())

        await primeiraCriacao
    })

    test('não mistura duas categorias diferentes enviadas simultaneamente', async () => {
        let concluirRequisicao

        const requisicaoAutenticada = jest.fn(() => new Promise(resolve => {
            concluirRequisicao = resolve
        }))

        const service = criarSupportCategoryService({requisicaoAutenticada})
        const primeiraCriacao = service.criarCategoria(dadosValidos)

        await expect(
            service.criarCategoria({
                nome: 'Profissionais',
                dadosVisiveis: ['saude.consultas']
            })
        ).rejects.toMatchObject({
            codigo: 'CRIACAO_CATEGORIA_EM_ANDAMENTO'
        })

        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1)

        concluirRequisicao(criarResposta())

        await primeiraCriacao
    })

    test('permite uma nova criação depois que a anterior termina', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue(criarResposta())
        const service = criarSupportCategoryService({requisicaoAutenticada})

        await service.criarCategoria(dadosValidos)
        await service.criarCategoria(dadosValidos)

        expect(requisicaoAutenticada).toHaveBeenCalledTimes(2)
    })
})