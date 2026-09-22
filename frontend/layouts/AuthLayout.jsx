import {
    KeyboardAvoidingView, Platform, ScrollView, Text, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { estilos } from './AuthLayout.styles';

export default function AuthLayout({
    titulo, descricao, children, rodape, testeId = 'auth-layout'
}) {
    return (
        <SafeAreaView style={estilos.tela} testID={testeId}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={estilos.flexivel}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={estilos.rolagem}
                >
                    <View style={estilos.conteudo}>
                        <View style={estilos.cabecalho}>
                            <Text accessibilityRole="header" style={estilos.titulo}>
                                {titulo}
                            </Text>
                            {descricao ? (
                                <Text style={estilos.descricao}>{descricao}</Text>
                            ) : null}
                        </View>
                        <View style={estilos.formulario}>{children}</View>
                    </View>
                    {rodape ? <View style={estilos.rodape}>{rodape}</View> : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
