import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDown } from 'phosphor-react-native/src/icons/CaretDown';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterCoresDiario } from '../../config/diaryColors';
import { formatarDataDiario } from '../../utils/diaryDate';
import { DiaryDateArrow } from './DiaryDateArrow';
import { criarEstilos } from './DiaryDateNavigator.styles';

function DiaryDateNavigator({
    data,
    aoAnterior,
    aoProximo,
    aoAbrirSeletor,
    anteriorDisponivel = true,
    proximoDisponivel = true,
    desabilitado = false,
    compacto = false
}) {
    const tema = useTheme();
    const cores = obterCoresDiario(tema).interface;
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const dataFormatada = formatarDataDiario(data);

    return (
        <View style={[estilos.container, compacto && estilos.containerCompacto]}>
            <DiaryDateArrow
                direcao="anterior"
                aoPressionar={aoAnterior}
                desabilitado={desabilitado || !anteriorDisponivel}
                compacto={compacto}
            />
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Selecionar data. Atual: ${dataFormatada}`}
                accessibilityState={{ disabled: desabilitado || !aoAbrirSeletor }}
                disabled={desabilitado || !aoAbrirSeletor}
                onPress={aoAbrirSeletor}
                style={[estilos.data, compacto && estilos.dataCompacta]}
            >
                <Text style={[estilos.texto, compacto && estilos.textoCompacto]}>
                    {dataFormatada}
                </Text>
                {aoAbrirSeletor ? <CaretDown size={15} color={cores.textoPrincipal} /> : null}
            </Pressable>
            <DiaryDateArrow
                direcao="proximo"
                aoPressionar={aoProximo}
                desabilitado={desabilitado || !proximoDisponivel}
                compacto={compacto}
            />
        </View>
    );
}

export { DiaryDateNavigator };
