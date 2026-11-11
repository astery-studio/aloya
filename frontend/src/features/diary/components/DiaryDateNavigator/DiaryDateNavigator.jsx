import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDown } from 'phosphor-react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
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
    desabilitado = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const dataFormatada = formatarDataDiario(data);

    return (
        <View style={estilos.container}>
            <DiaryDateArrow
                direcao="anterior"
                aoPressionar={aoAnterior}
                desabilitado={desabilitado || !anteriorDisponivel}
            />
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Selecionar data. Atual: ${dataFormatada}`}
                accessibilityState={{ disabled: desabilitado || !aoAbrirSeletor }}
                disabled={desabilitado || !aoAbrirSeletor}
                onPress={aoAbrirSeletor}
                style={estilos.data}
            >
                <Text style={estilos.texto}>{dataFormatada}</Text>
                {aoAbrirSeletor ? (
                    <CaretDown size={15} color="#000000" />
                ) : null}
            </Pressable>
            <DiaryDateArrow
                direcao="proximo"
                aoPressionar={aoProximo}
                desabilitado={desabilitado || !proximoDisponivel}
            />
        </View>
    );
}

export { DiaryDateNavigator };
