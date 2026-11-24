import { Text, View } from 'react-native';
import { QuestionIcon } from 'phosphor-react-native/src/icons/Question';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import TextInput from '../../../../shared/components/forms/TextInput/TextInput';
import { estilos } from './DiaryReflectionSheet.styles';

const PERGUNTA = 'O que seu corpo está pedindo agora?';
const LIMITE_REFLEXAO = 5000;

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
                        <QuestionIcon color="#4A758E" size={28} weight="regular" />
                    </View>
                    <Text style={estilos.rotulo}>Uma pergunta para hoje</Text>
                </View>
                <Text accessibilityRole="header" style={estilos.pergunta}>
                    {PERGUNTA}
                </Text>
                <View style={estilos.formulario}>
                    <TextInput
                        accessibilityLabel={PERGUNTA}
                        placeholder="Escreva livremente..."
                        value={valor}
                        onChangeText={aoAlterar}
                        multiline
                        maxLength={LIMITE_REFLEXAO}
                        desativado={salvando}
                        erro={erro}
                        estilo={[estilos.entrada, valor && estilos.entradaPreenchida]}
                        estiloEntrada={estilos.textoEntrada}
                    />
                    <Text
                        accessibilityLiveRegion="polite"
                        style={[estilos.contador, valor && estilos.contadorPreenchido]}
                    >
                        {[...valor].length} / {LIMITE_REFLEXAO}
                    </Text>
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

export { DiaryReflectionSheet, LIMITE_REFLEXAO, PERGUNTA };
