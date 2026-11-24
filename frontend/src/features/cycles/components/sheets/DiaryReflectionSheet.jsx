import { Text, View } from 'react-native';
import { QuestionIcon } from 'phosphor-react-native/src/icons/Question';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import TextInput from '../../../../shared/components/forms/TextInput/TextInput';
import { estilos } from './DiaryReflectionSheet.styles';

const PERGUNTA = 'O que seu corpo está pedindo agora?';

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
        <BottomSheet
            visivel={visivel}
            onFechar={aoFechar}
            bloquearFechamento={salvando}
            permitirDeslizarParaFechar
            estiloPainel={estilos.painel}
            corPainel="#FFFFFF"
        >
            <View style={estilos.conteudo}>
                <View style={estilos.cabecalho}>
                    <View style={estilos.icone}>
                        <QuestionIcon color="#4D7891" size={28} weight="bold" />
                    </View>
                    <Text style={estilos.rotulo}>Uma pergunta para hoje</Text>
                </View>
                <Text accessibilityRole="header" style={estilos.pergunta}>
                    {PERGUNTA}
                </Text>
                <View style={estilos.formulario}>
                    <TextInput
                        label={PERGUNTA}
                        placeholder="Escreva livremente..."
                        value={valor}
                        onChangeText={aoAlterar}
                        multiline
                        desativado={salvando}
                        erro={erro}
                        estilo={estilos.entrada}
                        estiloEntrada={estilos.textoEntrada}
                    />
                    <ButtonScreen
                        texto="Salvar no Diário"
                        aoPressionar={aoSalvar}
                        desativado={!valor.trim()}
                        carregando={salvando}
                    />
                </View>
            </View>
        </BottomSheet>
    );
}

export { DiaryReflectionSheet, PERGUNTA };
