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
    ocultarSetasIndisponiveis = false,
    compacto = false,
    estiloContainer,
    estiloTexto
}) {
    const tema = useTheme();
    const cores = obterCoresDiario(tema).interface;
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const dataFormatada = formatarDataDiario(data);

    function renderizarSeta(direcao, disponivel, aoPressionar) {
        if (ocultarSetasIndisponiveis && !disponivel) {
            return (
                <View
                    pointerEvents="none"
                    style={[estilos.botaoSeta, compacto && estilos.botaoSetaCompacto]}
                />
            );
        }
        return (
            <DiaryDateArrow
                direcao={direcao}
                aoPressionar={aoPressionar}
                desabilitado={desabilitado || !disponivel}
                compacto={compacto}
            />
        );
    }

    return (
        <View
            testID="diary-date-navigator"
            style={[estilos.container, compacto && estilos.containerCompacto, estiloContainer]}
        >
            {renderizarSeta('anterior', anteriorDisponivel, aoAnterior)}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Selecionar data. Atual: ${dataFormatada}`}
                accessibilityState={{ disabled: desabilitado || !aoAbrirSeletor }}
                disabled={desabilitado || !aoAbrirSeletor}
                onPress={aoAbrirSeletor}
                style={[estilos.data, compacto && estilos.dataCompacta]}
            >
                <Text style={[estilos.texto, compacto && estilos.textoCompacto, estiloTexto]}>
                    {dataFormatada}
                </Text>
                {aoAbrirSeletor ? <CaretDown size={15} color={cores.textoPrincipal} /> : null}
            </Pressable>
            {renderizarSeta('proximo', proximoDisponivel, aoProximo)}
        </View>
    );
}

export { DiaryDateNavigator };
