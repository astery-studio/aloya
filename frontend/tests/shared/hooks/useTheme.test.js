//Testa o hook que fornece o tema visual do aplicativo.
//Existe para garantir que os componentes recebam o tema centralizado correto.

import {
    renderHook
} from '@testing-library/react-native'

import { useTheme } from '../../../src/shared/hooks/useTheme'
import { tema } from '../../../src/shared/theme'

describe('useTheme', () => {
    test('retorna o tema centralizado da aplicação', async () => {
        const { result } =
            await renderHook(
                () => useTheme()
            )

        expect(result.current).toBe(
            tema
        )
    })

    test('retorna o objeto principal do tema protegido contra alterações', async () => {
        const { result } =
            await renderHook(
                () => useTheme()
            )

        expect(
            Object.isFrozen(
                result.current
            )
        ).toBe(true)
    })
})