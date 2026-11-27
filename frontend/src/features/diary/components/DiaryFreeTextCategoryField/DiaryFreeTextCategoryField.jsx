import { useEffect, useState } from 'react';
import { Keyboard, Pressable, Text } from 'react-native';
import { XCircleIcon } from 'phosphor-react-native/src/icons/XCircle';

import TextInput from '../../../../shared/components/forms/TextInput/TextInput';
import { obterCoresDiario } from '../../config/diaryColors';

const ALTURA_MINIMA_ANOTACAO = 36;

function calcularAlturaAnotacao(alturaConteudo) {
    return Math.max(ALTURA_MINIMA_ANOTACAO, alturaConteudo + 12);
}

function DiaryFreeTextCategoryField({
    valor,
    limite,
    aoAlterar,
    desabilitado,
    estilos,
    cores,
    tema
}) {
    const coresDiario = obterCoresDiario(tema);
    const [alturaAnotacao, setAlturaAnotacao] = useState(ALTURA_MINIMA_ANOTACAO);

    useEffect(() => {
        if (!valor) setAlturaAnotacao(ALTURA_MINIMA_ANOTACAO);
    }, [valor]);

    function medirLinhas(linhas) {
        const quantidadeLinhas = Array.isArray(linhas) ? linhas.length : 0;
        if (quantidadeLinhas === 0) return;
        const proximaAltura = calcularAlturaAnotacao(quantidadeLinhas * 24);
        setAlturaAnotacao((atual) => (atual === proximaAltura ? atual : proximaAltura));
    }

    function limpar() {
        setAlturaAnotacao(ALTURA_MINIMA_ANOTACAO);
        Keyboard.dismiss();
        aoAlterar?.('');
    }

    return (
        <>
            <TextInput
                value={valor ?? ''}
                onChangeText={aoAlterar}
                accessibilityLabel="Digite aqui sua nota…"
                multiline
                maxLength={limite}
                desativado={desabilitado}
                estilo={[
                    estilos.campoAnotacao,
                    {
                        borderColor: cores.icone,
                        height: alturaAnotacao,
                        paddingTop: 0
                    }
                ]}
                estiloEntrada={[
                    estilos.entradaAnotacao,
                    {
                        color: cores.icone,
                        height: alturaAnotacao - 12,
                        textAlign: 'center'
                    }
                ]}
                scrollEnabled={false}
                acaoDireita={
                    valor ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Limpar anotação livre"
                            disabled={desabilitado}
                            hitSlop={8}
                            onPress={limpar}
                            style={estilos.limparAnotacao}
                        >
                            <XCircleIcon size={18} color={coresDiario.primaria} />
                        </Pressable>
                    ) : (
                        <Text
                            testID="placeholder-anotacao-livre"
                            pointerEvents="none"
                            style={[estilos.placeholderAnotacao, { color: cores.icone }]}
                        >
                            Digite aqui sua nota…
                        </Text>
                    )
                }
            />
            {valor ? (
                <Text
                    testID="medidor-anotacao-livre"
                    accessible={false}
                    onTextLayout={({ nativeEvent }) => medirLinhas(nativeEvent.lines)}
                    style={[estilos.medidorAnotacao, { color: cores.icone }]}
                >
                    {valor}
                </Text>
            ) : null}
            <Text style={[estilos.contador, { color: cores.icone }]}>
                {[...(valor ?? '')].length} / {limite}
            </Text>
        </>
    );
}

export { calcularAlturaAnotacao, DiaryFreeTextCategoryField };
