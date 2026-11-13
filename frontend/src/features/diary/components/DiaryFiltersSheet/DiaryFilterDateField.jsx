import { Pressable, Text, View } from 'react-native';
import { XCircleIcon } from 'phosphor-react-native/src/icons/XCircle';

import DateInput from '../../../../shared/components/forms/DateInput/DateInput';
import { obterCoresDiario } from '../../config/diaryColors';

function DiaryFilterDateField({
    rotulo,
    rotuloAcessibilidade,
    valor,
    aoAlterar,
    aoLimpar,
    testeId,
    estilos,
    tema
}) {
    const coresDiario = obterCoresDiario(tema);
    return (
        <View style={estilos.grupoCampo}>
            <Text style={estilos.rotuloCampo}>{rotulo}</Text>
            <View style={estilos.campoDataComAcao}>
                <DateInput
                    valor={valor}
                    onChangeText={aoAlterar}
                    rotuloAcessibilidade={rotuloAcessibilidade ?? rotulo}
                    testeId={testeId}
                    estilo={estilos.entradaData}
                    estiloCampo={estilos.campoData}
                    mostrarIcone={false}
                />
                {valor ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Limpar ${(rotuloAcessibilidade ?? rotulo).toLocaleLowerCase('pt-BR')}`}
                        onPress={aoLimpar}
                        style={estilos.limparData}
                    >
                        <XCircleIcon size={20} color={coresDiario.primaria} />
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}

export { DiaryFilterDateField };
