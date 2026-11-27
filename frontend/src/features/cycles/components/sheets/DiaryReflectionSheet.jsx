import { Keyboard, Pressable, Text, View } from 'react-native';
import { QuestionIcon } from 'phosphor-react-native/src/icons/Question';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import TextInput from '../../../../shared/components/forms/TextInput/TextInput';
import { useHomeColors } from '../../hooks/useHomeColors';
import { estilos as estilosClaros } from './DiaryReflectionSheet.styles';

const PERGUNTA = 'O que seu corpo está pedindo agora?';

function DiaryReflectionSheet({
    visivel,
    valor,
    aoAlterar,
    aoSalvar,
    aoFechar,
    limiteCaracteres = 100,
    limiteContador = 100,
    caracteresEstruturais = 8,
    totalCaracteresExistentes = 0,
    semEspaco = false,
    salvando = false,
    erro
}) {
    const { estilos, cor: adaptarCor, escuro } = useHomeColors(estilosClaros);
    const quantidadeCaracteres = [...valor].length;
    const quantidadeContador = Math.min(limiteContador, quantidadeCaracteres);
    const limiteAtingido =
        totalCaracteresExistentes + caracteresEstruturais + quantidadeContador >= 5000;

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={aoFechar}
            bloquearFechamento={salvando}
            fecharAoTocarFora
            permitirDeslizarParaFechar
            estiloPainel={estilos.painel}
            corPainel={adaptarCor('#FFFFFF', 'backgroundColor')}
        >
            <Pressable
                accessible={false}
                testID="diary-reflection-content"
                onPress={Keyboard.dismiss}
                style={estilos.conteudo}
            >
                <View style={estilos.cabecalho}>
                    <View style={estilos.icone}>
                        <QuestionIcon color={adaptarCor('#4A758E')} size={28} weight="regular" />
                    </View>
                    <Text style={estilos.rotulo}>Uma pergunta para hoje</Text>
                </View>
                <Text accessibilityRole="header" style={estilos.pergunta}>
                    {PERGUNTA}
                </Text>
                <View style={estilos.formulario}>
                    {semEspaco ? (
                        <Text accessibilityRole="alert" style={estilos.mensagemSemEspaco}>
                            Você não tem mais espaço para anotações no Diário.
                        </Text>
                    ) : (
                        <View style={estilos.campo}>
                            <TextInput
                                accessibilityLabel={PERGUNTA}
                                placeholder="Escreva livremente..."
                                value={valor}
                                onChangeText={aoAlterar}
                                multiline
                                sanitizar={(texto) =>
                                    [...texto].slice(0, limiteCaracteres).join('')
                                }
                                desativado={salvando}
                                erro={erro}
                                estilo={[estilos.entrada, valor && estilos.entradaPreenchida]}
                                estiloEntrada={estilos.textoEntrada}
                            />
                            <Text
                                accessibilityLiveRegion="polite"
                                style={[
                                    estilos.contador,
                                    limiteAtingido && estilos.contadorLimiteAtingido
                                ]}
                            >
                                {quantidadeContador} / {limiteContador}
                            </Text>
                        </View>
                    )}
                    <ButtonScreen
                        texto="Salvar no Diário"
                        corConteudo={escuro && valor.trim() ? adaptarCor('#FDF6F3') : undefined}
                        aoPressionar={aoSalvar}
                        desativado={semEspaco || !valor.trim()}
                        carregando={salvando}
                        estilo={[estilos.botao, valor.trim() && estilos.botaoAtivo]}
                        estiloTexto={estilos.textoBotao}
                    />
                </View>
            </Pressable>
        </BottomSheet>
    );
}

export { DiaryReflectionSheet, PERGUNTA };
