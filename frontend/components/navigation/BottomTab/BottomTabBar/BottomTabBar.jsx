//Reúne os cinco itens da navegação inferior
import { View } from 'react-native'

import { UsersIcon } from 'phosphor-react-native/src/icons/Users'
import { ArrowsClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowsClockwise'
import { HouseIcon } from 'phosphor-react-native/src/icons/House'
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank'
import { GearIcon } from 'phosphor-react-native/src/icons/Gear'

import { BottomTabItem } from '../BottomTabItem/BottomTabItem'
import { estilos } from './BottomTabBar.style'

const abas = [
    {
        id: 'membros',
        label: 'Membros',
        icone: UsersIcon
    },
    {
        id: 'ciclos',
        label: 'Ciclos',
        icone: ArrowsClockwiseIcon
    },
    {
        id: 'inicio',
        label: 'Início',
        icone: HouseIcon
    },
    {
        id: 'diario',
        label: 'Diário',
        icone: CalendarBlankIcon
    },
    {
        id: 'configuracoes',
        label: 'Config.',
        icone: GearIcon
    }
]

function BottomTabBar({ abaAtiva, onSelecionar }) {
    function renderizarAba(aba) {
        function selecionarAba() {
            onSelecionar?.(aba.id)
        }

        return (
            <BottomTabItem
                key={aba.id}
                icone={aba.icone}
                label={aba.label}
                ativo={aba.id === abaAtiva}
                onPress={
                    typeof onSelecionar === 'function' ? selecionarAba : undefined
                }
            />
        )
    }

    return (
        <View style={estilos.barra}>
            {abas.map(renderizarAba)}
        </View>
    )
}

export { BottomTabBar }