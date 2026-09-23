//Testa a validação dos dados de perfil recebidos da API.
import {
    criarUserProfile
} from '../features/profile/models/userProfile'

function criarResposta(alteracoes = {}) {
    return {
        configuracoes: {
            id: 15,
            nome: 'Kaylanne Sátiro',
            email: 'kaylanne@example.com',
            identidadeGenero: 'MULHER_CIS',
            dataNascimento: '2000-02-29',
            atualizadoEm:
                '2026-09-22T20:00:00.000Z',
            ...alteracoes
        }
    }
}

describe('criarUserProfile', () => {
    test('retorna somente os campos permitidos do perfil', () => {
        const resposta =
            criarResposta({
                senhaHash:
                    'valor que não pode chegar à tela',
                papel: 'ADMIN',
                token: 'token sensível'
            })

        const perfil =
            criarUserProfile(resposta)

        expect(perfil).toEqual({
            id: 15,
            nome: 'Kaylanne Sátiro',
            email: 'kaylanne@example.com',
            identidadeGenero: 'MULHER_CIS',
            dataNascimento: '2000-02-29',
            atualizadoEm:
                '2026-09-22T20:00:00.000Z'
        })

        expect(perfil).not.toHaveProperty(
            'senhaHash'
        )

        expect(perfil).not.toHaveProperty(
            'papel'
        )

        expect(perfil).not.toHaveProperty(
            'token'
        )
    })

    test('retorna um perfil que não pode ser alterado', () => {
        const perfil =
            criarUserProfile(
                criarResposta()
            )

        expect(
            Object.isFrozen(perfil)
        ).toBe(true)
    })

    test('aceita identidade de gênero nula', () => {
        const perfil =
            criarUserProfile(
                criarResposta({
                    identidadeGenero: null
                })
            )

        expect(
            perfil.identidadeGenero
        ).toBeNull()
    })

    test('aceita o dia 29 em um ano bissexto', () => {
        const perfil =
            criarUserProfile(
                criarResposta({
                    dataNascimento:
                        '2024-02-29'
                })
            )

        expect(
            perfil.dataNascimento
        ).toBe('2024-02-29')
    })

    test.each([
        '2025-02-29',
        '2026-02-30',
        '2026-04-31',
        '2026-06-31',
        '2026-09-31',
        '2026-11-31',
        '2026-13-01',
        '2026-00-10',
        '2026-01-00',
        '0000-01-01',
        '31/01/2026',
        '2026-1-01',
        'data inválida'
    ])(
        'rejeita a data de nascimento inválida %s',
        (dataNascimento) => {
            expect(
                () => criarUserProfile(
                    criarResposta({
                        dataNascimento
                    })
                )
            ).toThrow(
                'Não foi possível carregar os dados do perfil.'
            )
        }
    )

    test('rejeita data de nascimento futura', () => {
        expect(
            () => criarUserProfile(
                criarResposta({
                    dataNascimento:
                        '2999-01-01'
                })
            )
        ).toThrow(
            'Não foi possível carregar os dados do perfil.'
        )
    })

    test('rejeita data de nascimento que não seja texto', () => {
        expect(
            () => criarUserProfile(
                criarResposta({
                    dataNascimento: null
                })
            )
        ).toThrow(
            'Não foi possível carregar os dados do perfil.'
        )
    })

    test.each([
        {
            id: '15'
        },
        {
            id: 0
        },
        {
            nome: null
        },
        {
            email: null
        },
        {
            identidadeGenero: 10
        },
        {
            atualizadoEm: null
        }
    ])(
        'rejeita campos de perfil com tipos inválidos',
        (alteracoes) => {
            expect(
                () => criarUserProfile(
                    criarResposta(
                        alteracoes
                    )
                )
            ).toThrow(
                'Não foi possível carregar os dados do perfil.'
            )
        }
    )

    test('rejeita configurações ausentes', () => {
        expect(
            () => criarUserProfile({})
        ).toThrow(
            'Não foi possível carregar os dados do perfil.'
        )
    })

    test('rejeita configurações nulas', () => {
        expect(
            () => criarUserProfile({
                configuracoes: null
            })
        ).toThrow(
            'Não foi possível carregar os dados do perfil.'
        )
    })

    test('rejeita configurações em formato de lista', () => {
        expect(
            () => criarUserProfile({
                configuracoes: []
            })
        ).toThrow(
            'Não foi possível carregar os dados do perfil.'
        )
    })
})