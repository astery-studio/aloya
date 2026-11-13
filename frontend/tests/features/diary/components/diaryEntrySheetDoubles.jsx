import { Pressable, Text, View } from 'react-native';

function MockBottomSheet({
    children,
    onFechar,
    bloquearFechamento,
    permitirDeslizarParaFechar,
    podeIniciarDeslize
}) {
    return (
        <View>
            <Text>{`bloqueado:${bloquearFechamento};deslize:${permitirDeslizarParaFechar}`}</Text>
            <Pressable onPress={onFechar}>
                <Text>Fechar painel</Text>
            </Pressable>
            <Pressable testID="verificar-deslize-sheet" onPress={podeIniciarDeslize}>
                <Text>Verificar deslize</Text>
            </Pressable>
            {children}
        </View>
    );
}

function MockContent({ catalogo, onPosicaoRolagem }) {
    return (
        <View>
            <Text>{`Catálogo:${catalogo.versao}`}</Text>
            <Pressable testID="alterar-rolagem-sheet" onPress={() => onPosicaoRolagem(-4)}>
                <Text>Alterar rolagem</Text>
            </Pressable>
            <Pressable testID="avancar-rolagem-sheet" onPress={() => onPosicaoRolagem(20)}>
                <Text>Avançar rolagem</Text>
            </Pressable>
        </View>
    );
}

export { MockBottomSheet, MockContent };
