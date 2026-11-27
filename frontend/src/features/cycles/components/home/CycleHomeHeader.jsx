import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import { ClockCounterClockwiseIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from '../../screens/CycleTodayScreen.styles';
import { formatarDataCabecalho } from '../../utils/cyclePresentation';

function CycleHomeHeader({
    data,
    aoAbrirHistorico,
    rotuloHistorico = 'Abrir histórico do ciclo',
    exibirHistorico = true,
    aplicarAreaSegura = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const cabecalho = (
        <View style={estilos.cabecalho}>
            <Text accessibilityRole="header" style={estilos.titulo}>
                {formatarDataCabecalho(data)}
            </Text>
            {exibirHistorico ? (
                <View style={estilos.acoesCabecalho}>
                    <IconButton
                        icone={ClockCounterClockwiseIcon}
                        aoPressionar={aoAbrirHistorico}
                        rotuloAcessibilidade={rotuloHistorico}
                        variante="calendario"
                    />
                </View>
            ) : null}
        </View>
    );

    return aplicarAreaSegura ? (
        <SafeAreaView edges={['top', 'left', 'right']} style={estilos.fundo}>
            {cabecalho}
        </SafeAreaView>
    ) : (
        cabecalho
    );
}

export { CycleHomeHeader };
