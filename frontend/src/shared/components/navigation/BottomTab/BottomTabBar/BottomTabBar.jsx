// Reúne os cinco itens da navegação inferior.
import { useMemo } from 'react';
import { View } from 'react-native';
import { ArrowsClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowsClockwise';
import { CalendarBlankIcon } from 'phosphor-react-native/src/icons/CalendarBlank';
import { CalendarCheckIcon } from 'phosphor-react-native/src/icons/CalendarCheck';
import { GearIcon } from 'phosphor-react-native/src/icons/Gear';
import { HouseIcon } from 'phosphor-react-native/src/icons/House';
import { NotebookIcon } from 'phosphor-react-native/src/icons/Notebook';
import { UsersIcon } from 'phosphor-react-native/src/icons/Users';

import { useTheme } from '../../../../hooks/useTheme';
import { BottomTabItem } from '../BottomTabItem/BottomTabItem';
import { criarEstilos } from './BottomTabBar.style';

const abas = Object.freeze([
    Object.freeze({
        id: 'membros',
        label: 'Membros',
        icone: UsersIcon
    }),

    Object.freeze({
        id: 'ciclos',
        label: 'Ciclos',
        icone: ArrowsClockwiseIcon
    }),

    Object.freeze({
        id: 'inicio',
        label: 'Início',
        icone: HouseIcon
    }),

    Object.freeze({
        id: 'diario',
        label: 'Diário',
        icone: CalendarBlankIcon
    }),

    Object.freeze({
        id: 'configuracoes',
        label: 'Config.',
        icone: GearIcon
    })
]);

const abasSemCiclo = Object.freeze([
    { ...abas[0], label: 'Contatos' },
    { id: 'calendario', label: 'Calendário', icone: CalendarCheckIcon },
    abas[2],
    { ...abas[3], icone: NotebookIcon },
    abas[4]
]);

function BottomTabBar({ abaAtiva, onSelecionar, semCiclo = false }) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    function renderizarAba(aba) {
        function selecionarAba() {
            onSelecionar?.(aba.id);
        }

        return (
            <BottomTabItem
                key={aba.id}
                icone={aba.icone}
                label={aba.label}
                ativo={aba.id === abaAtiva}
                onPress={typeof onSelecionar === 'function' ? selecionarAba : undefined}
            />
        );
    }

    return (
        <View testID="bottom-tab-bar" accessibilityRole="tablist" style={estilos.barra}>
            {(semCiclo ? abasSemCiclo : abas).map(renderizarAba)}
        </View>
    );
}

export { BottomTabBar, abas };
