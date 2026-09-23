//Testa o hook que fornece o tema visual do aplicativo.
import {
    renderHook
} from '@testing-library/react-native'

import { useTheme } from '../hooks/useTheme'
import { tema } from '../theme'

describe('useTheme', () => {
    test('retorna o tema centralizado da aplicação', () => {
        const { result } =
            renderHook(
                () => useTheme()
            )

        expect(result.current).toBe(
            tema
        )
    })

    test('retorna o objeto principal do tema protegido contra alterações', () => {
        const { result } =
            renderHook(
                () => useTheme()
            )

        expect(
            Object.isFrozen(
                result.current
            )
        ).toBe(true)
    })
})