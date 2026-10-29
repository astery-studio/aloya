import { Pressable, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import DateInput from '../../../../shared/components/forms/DateInput/DateInput';
import { BottomSheetLayout } from '../../../../shared/layouts/BottomSheet/BottomSheetLayout';
import { estilos } from './CycleEditSheet.styles';

function CycleEditSheet({
    visivel,
    dataInicio,
    dataFim,
    alterado,
    salvando,
    onAlterarInicio,
    onAlterarFim,
    onFechar,
    onSalvar
}) {
    return (
        <BottomSheet visivel={visivel} onFechar={onFechar} bloquearFechamento={salvando}>
            <BottomSheetLayout
                titulo="Editar ciclo"
                onFechar={onFechar}
                bloquearFechamento={salvando}
            >
                <View style={estilos.formulario}>
                    <View style={estilos.campo}>
                        <Text style={estilos.label}>Data de Início</Text>
                        <DateInput
                            valor={dataInicio}
                            onChangeText={onAlterarInicio}
                            desativado={salvando}
                            rotuloAcessibilidade="Data de início do ciclo"
                            testeId="data-inicio-edicao-ciclo"
                        />
                    </View>

                    <View style={estilos.campo}>
                        <Text style={estilos.label}>Data de Término</Text>
                        <DateInput
                            valor={dataFim}
                            onChangeText={onAlterarFim}
                            desativado={salvando}
                            rotuloAcessibilidade="Data de término do ciclo"
                            testeId="data-fim-edicao-ciclo"
                        />
                        <Text style={estilos.ajuda}>
                            Deixe em branco se o ciclo ainda estiver em andamento.
                        </Text>
                        {dataFim ? (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Limpar data de término"
                                disabled={salvando}
                                onPress={() => onAlterarFim?.('')}
                                style={estilos.limpar}
                            >
                                <Text style={estilos.textoLimpar}>Limpar data de término</Text>
                            </Pressable>
                        ) : null}
                    </View>

                    <ButtonScreen
                        texto="Salvar alterações"
                        aoPressionar={onSalvar}
                        desativado={!alterado || salvando}
                        carregando={salvando}
                    />
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    );
}

export { CycleEditSheet };
