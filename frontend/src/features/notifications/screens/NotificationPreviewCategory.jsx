import { Pressable, StyleSheet, Text, View } from 'react-native';

export function NotificationPreviewCategory({
    titulo,
    canal,
    grupos,
    ocupado,
    testar,
    typography,
    cores
}) {
    const textoSecundario = [typography.bodyDefault, { color: cores.interface.textoSecundario }];
    const estiloOpcao = [
        estilos.opcao,
        { backgroundColor: cores.interface.superficie, borderColor: cores.interface.borda }
    ];
    return (
        <View key={canal} style={estilos.categoria}>
            <Text
                accessibilityRole="header"
                style={[typography.h1, { color: cores.interface.textoPrincipal }]}
            >
                {titulo}
            </Text>
            {grupos.map(({ nome, tipos }) => (
                <View key={nome} style={estilos.grupo}>
                    <Text accessibilityRole="header" style={textoSecundario}>
                        {nome}
                    </Text>
                    {tipos.map(([codigo, rotulo]) => (
                        <Pressable
                            key={codigo}
                            accessibilityRole="button"
                            accessibilityHint="Mostra uma prévia na barra de notificações"
                            accessibilityState={{ disabled: ocupado }}
                            disabled={ocupado}
                            style={({ pressed }) => [estiloOpcao, pressed && estilos.pressao]}
                            onPress={() => {
                                void testar(codigo, rotulo, canal);
                            }}
                        >
                            <Text
                                style={[
                                    typography.bodyDefault,
                                    { color: cores.interface.textoPrincipal }
                                ]}
                            >
                                {rotulo}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            ))}
        </View>
    );
}

const estilos = StyleSheet.create({
    categoria: { gap: 16 },
    grupo: { gap: 8 },
    opcao: {
        minHeight: 48,
        justifyContent: 'center',
        padding: 12,
        borderWidth: 1,
        borderRadius: 12
    },
    pressao: { opacity: 0.75 }
});
