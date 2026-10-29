import {
    MODOS_TEMA,
    PREFERENCIAS_TEMA,
    preferenciaTemaEhValida,
    resolverModoTema
} from '../../../src/shared/theme/themePreferences'

describe('themePreferences', () => {
    test.each([
        PREFERENCIAS_TEMA.claro,
        PREFERENCIAS_TEMA.escuro,
        PREFERENCIAS_TEMA.automatico
    ])(
        'aceita a preferência %s',
        (preferencia) => {
            expect(
                preferenciaTemaEhValida(
                    preferencia
                )
            ).toBe(true)
        }
    )

    test.each([
        undefined,
        null,
        '',
        'dark',
        'ESCuro',
        'automatico ',
        1,
        true,
        {}
    ])(
        'rejeita a preferência inválida %p',
        (preferencia) => {
            expect(
                preferenciaTemaEhValida(
                    preferencia
                )
            ).toBe(false)
        }
    )

    test('mantém o tema claro escolhido pela pessoa', () => {
        expect(
            resolverModoTema(
                PREFERENCIAS_TEMA.claro,
                'dark'
            )
        ).toBe(MODOS_TEMA.claro)
    })

    test('mantém o tema escuro escolhido pela pessoa', () => {
        expect(
            resolverModoTema(
                PREFERENCIAS_TEMA.escuro,
                'light'
            )
        ).toBe(MODOS_TEMA.escuro)
    })

    test('segue o sistema escuro no modo automático', () => {
        expect(
            resolverModoTema(
                PREFERENCIAS_TEMA.automatico,
                'dark'
            )
        ).toBe(MODOS_TEMA.escuro)
    })

    test('segue o sistema claro no modo automático', () => {
        expect(
            resolverModoTema(
                PREFERENCIAS_TEMA.automatico,
                'light'
            )
        ).toBe(MODOS_TEMA.claro)
    })

    test('usa o tema claro quando o sistema não informa um esquema conhecido', () => {
        expect(
            resolverModoTema(
                PREFERENCIAS_TEMA.automatico,
                null
            )
        ).toBe(MODOS_TEMA.claro)
    })

    test('usa uma configuração segura para preferência inválida', () => {
        expect(
            resolverModoTema(
                'tema-inexistente',
                'dark'
            )
        ).toBe(MODOS_TEMA.claro)
    })

    test('protege os catálogos contra alterações', () => {
        expect(
            Object.isFrozen(
                PREFERENCIAS_TEMA
            )
        ).toBe(true)

        expect(
            Object.isFrozen(
                MODOS_TEMA
            )
        ).toBe(true)
    })
})