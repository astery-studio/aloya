import {
    KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores } from '../theme';
import { estilos } from './AuthLayout.styles';

const coresFundo = ['#F5EDE3', '#F7F5F0'];
const posicoesFundo = [0.04, 0.55];

export default function AuthLayout({
    titulo, descricao, children, rodape, aoVoltar, testeId = 'auth-layout'
}) {
    return (
        <LinearGradient colors={coresFundo}
            locations={posicoesFundo} style={estilos.tela}>
        <SafeAreaView style={estilos.flexivel} testID={testeId}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={estilos.flexivel}
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={estilos.rolagem}
                >
                    {aoVoltar ? (
                        <Pressable accessibilityLabel="Voltar" onPress={aoVoltar}
                            hitSlop={12} style={estilos.voltar}>
                            <ArrowLeft size={24} color={cores.neutras.textoSecundarioClaro} />
                        </Pressable>
                    ) : null}
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
        </LinearGradient>
    );
}
