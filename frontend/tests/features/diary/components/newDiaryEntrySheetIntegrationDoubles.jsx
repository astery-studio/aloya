import { Pressable, Text, View } from 'react-native';

function MockBottomSheet({ children }) {
    return <View>{children}</View>;
}

function MockContent({ formulario }) {
    return (
        <View>
            <Pressable onPress={() => formulario.alterarValor('dor', ['leve'])}>
                <Text>Preencher</Text>
            </Pressable>
            <Pressable onPress={formulario.salvar}>
                <Text>Salvar</Text>
            </Pressable>
        </View>
    );
}

function MockSimpleModal({ visivel, titulo, mensagem, acaoPrincipal, acaoSecundaria }) {
    if (!visivel) return null;
    return (
        <View>
            <Text>{titulo}</Text>
            <Text>{mensagem}</Text>
            {[acaoPrincipal, acaoSecundaria].filter(Boolean).map((acao) => (
                <Pressable key={acao.texto} onPress={acao.aoPressionar}>
                    <Text>{acao.texto}</Text>
                </Pressable>
            ))}
        </View>
    );
}

export { MockBottomSheet, MockContent, MockSimpleModal };
