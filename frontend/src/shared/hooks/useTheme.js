//Um hook é uma função com nome iniciado por "use" que os componentes podem chamar para obter um comportamento ou valor reutilizável
import { tema } from '../theme'

function useTheme() {
    return tema
}

export { useTheme }