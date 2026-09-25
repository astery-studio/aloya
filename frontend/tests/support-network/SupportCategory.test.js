//Testa a validação e a proteção das categorias recebidas da API.
import {criarSupportCategory} from '../../features/support-network/models/SupportCategory'

function criarCategoria(alteracoes = {}) {
    return {
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

describe('criarSupportCategory', () => {
    test('retorna somente os campos permitidos', () => {
        const categoria = criarSupportCategory(
            criarCategoria({
                titularId: 999,
                nomeNormalizado: 'família',
                senhaHash: 'valor privado',
                token: 'token privado'
            })
        )

        expect(categoria).toEqual({
            id: 10,
            nome: 'Família',
            dadosVisiveis: [
                'geral.fase_atual',
                'ciclo.fluxo_menstrual'
            ],
            quantidadeContatos: 0,
            criadoEm: '2026-09-25T10:00:00.000Z',
            atualizadoEm: '2026-09-25T10:00:00.000Z'
        })

        expect(categoria).not.toHaveProperty('titularId')
        expect(categoria).not.toHaveProperty('nomeNormalizado')
        expect(categoria).not.toHaveProperty('senhaHash')
        expect(categoria).not.toHaveProperty('token')
    })

    test('retorna a categoria e suas permissões congeladas', () => {
        const categoria = criarSupportCategory(criarCategoria())

        expect(Object.isFrozen(categoria)).toBe(true)
        expect(Object.isFrozen(categoria.dadosVisiveis)).toBe(true)
    })

    test('remove permissões repetidas e usa a ordem oficial', () => {
        const categoria = criarSupportCategory(
            criarCategoria({
                dadosVisiveis: [
                    'ciclo.fluxo_menstrual',
                    'geral.fase_atual',
                    'ciclo.fluxo_menstrual'
                ]
            })
        )

        expect(categoria.dadosVisiveis).toEqual([
            'geral.fase_atual',
            'ciclo.fluxo_menstrual'
        ])
    })

    test.each([
        [],
        null,
        {},
        'geral.fase_atual'
    ])('rejeita lista de permissões inválida %p', dadosVisiveis => {
        expect(
            () => criarSupportCategory(
                criarCategoria({
                    dadosVisiveis
                })
            )
        ).toThrow('Não foi possível carregar a categoria de permissão.')
    })

    test('rejeita uma permissão desconhecida', () => {
        expect(
            () => criarSupportCategory(
                criarCategoria({
                    dadosVisiveis: [
                        'geral.fase_atual',
                        'administrador.acesso_total'
                    ]
                })
            )
        ).toThrow('Não foi possível carregar a categoria de permissão.')
    })

    test.each([
        {
            id: '10'
        },
        {
            id: 0
        },
        {
            id: -1
        },
        {
            quantidadeContatos: '0'
        },
        {
            quantidadeContatos: -1
        }
    ])('rejeita identificador ou contador inválido', alteracoes => {
        expect(
            () => criarSupportCategory(
                criarCategoria(alteracoes)
            )
        ).toThrow('Não foi possível carregar a categoria de permissão.')
    })

    test.each([
        '',
        '   ',
        ' Família',
        'Família ',
        'Família  Próxima',
        '<Família>',
        'Família\nPrivada',
        'a'.repeat(81),
        null,
        {}
    ])('rejeita nome inválido %p', nome => {
        expect(
            () => criarSupportCategory(
                criarCategoria({
                    nome
                })
            )
        ).toThrow('Não foi possível carregar a categoria de permissão.')
    })

    test.each([
        '2026-02-30T10:00:00.000Z',
        '2026-09-25',
        '25/09/2026',
        '2026-09-25T10:00:00Z',
        'data inválida',
        '',
        null
    ])('rejeita data de criação inválida %p', criadoEm => {
        expect(
            () => criarSupportCategory(
                criarCategoria({
                    criadoEm
                })
            )
        ).toThrow('Não foi possível carregar a categoria de permissão.')
    })

    test('rejeita atualização anterior à criação', () => {
        expect(
            () => criarSupportCategory(
                criarCategoria({
                    criadoEm: '2026-09-25T10:00:00.000Z',
                    atualizadoEm: '2026-09-25T09:59:59.999Z'
                })
            )
        ).toThrow('Não foi possível carregar a categoria de permissão.')
    })

    test.each([
        null,
        undefined,
        [],
        'categoria',
        10
    ])('rejeita categoria em formato inválido %p', categoria => {
        expect(
            () => criarSupportCategory(categoria)
        ).toThrow('Não foi possível carregar a categoria de permissão.')
    })
})