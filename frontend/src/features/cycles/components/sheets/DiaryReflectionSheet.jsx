import { Text, View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import TextInput from '../../../../shared/components/forms/TextInput/TextInput';
import { BottomSheetLayout } from '../../../../shared/layouts/BottomSheet/BottomSheetLayout';

const PERGUNTA = 'O que seu corpo está pedindo hoje?';

function DiaryReflectionSheet({
    visivel,
    valor,
    aoAlterar,
    aoSalvar,
    aoFechar,
    salvando = false,
    erro
}) {
    return (
        <BottomSheet visivel={visivel} onFechar={aoFechar} bloquearFechamento={salvando}>
            <BottomSheetLayout
                titulo="Uma pergunta para hoje"
                onFechar={aoFechar}
                bloquearFechamento={salvando}
            >
                <View style={{ gap: 16 }}>
                    <Text>{PERGUNTA}</Text>
                    <TextInput
                        label={PERGUNTA}
                        placeholder="Escreva sua reflexão"
                        value={valor}
                        onChangeText={aoAlterar}
                        multiline
                        desativado={salvando}
                        erro={erro}
                    />
                    <ButtonScreen
                        texto="Salvar no Diário"
                        aoPressionar={aoSalvar}
                        desativado={!valor.trim()}
                        carregando={salvando}
                    />
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    );
}

export { DiaryReflectionSheet, PERGUNTA };
