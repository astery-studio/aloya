// Reúne os cinco itens da navegação inferior.
import { useMemo } from 'react';
import { View } from 'react-native';

import {
    CalendarCheckIcon,
    GearIcon,
    HouseIcon,
    NotebookIcon,
    UsersIcon
} from '../../../icons/AppIcons';
import { useTheme } from '../../../../hooks/useTheme';
import { BottomTabItem } from '../BottomTabItem/BottomTabItem';
import { criarEstilos } from './BottomTabBar.style';

const abas = Object.freeze([
    Object.freeze({
        id: 'membros',
        label: 'Contatos',
        icone: UsersIcon
    }),

    Object.freeze({
        id: 'calendario',
        label: 'Calendário',
        icone: CalendarCheckIcon
    }),

    Object.freeze({
        id: 'inicio',
        label: 'Início',
        icone: HouseIcon
    }),

    Object.freeze({
        id: 'diario',
        label: 'Diário',
        icone: NotebookIcon
    }),

    Object.freeze({
        id: 'configuracoes',
        label: 'Config.',
        icone: GearIcon
    })
]);

function BottomTabBar({ abaAtiva, onSelecionar, abasDisponiveis }) {
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
                onPress={
                    typeof onSelecionar === 'function' &&
                    (!abasDisponiveis || abasDisponiveis.includes(aba.id))
                        ? selecionarAba
                        : undefined
                }
            />
        );
    }

    return (
        <View testID="bottom-tab-bar" accessibilityRole="tablist" style={estilos.barra}>
            {abas.map(renderizarAba)}
        </View>
    );
}

export { BottomTabBar, abas };
