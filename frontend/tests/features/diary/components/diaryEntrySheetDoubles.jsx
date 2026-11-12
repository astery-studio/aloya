import { Pressable, Text, View } from 'react-native';

function MockBottomSheet({ children, onFechar, bloquearFechamento, permitirDeslizarParaFechar }) {
    return (
        <View>
            <Text>{`bloqueado:${bloquearFechamento};deslize:${permitirDeslizarParaFechar}`}</Text>
            <Pressable onPress={onFechar}>
                <Text>Fechar painel</Text>
            </Pressable>
            {children}
        </View>
    );
}

function MockContent({ catalogo }) {
    return <Text>{`Catálogo:${catalogo.versao}`}</Text>;
}

export { MockBottomSheet, MockContent };
