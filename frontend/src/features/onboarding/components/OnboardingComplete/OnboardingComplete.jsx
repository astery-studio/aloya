/**
 * Tela final do cadastro que confirma conclusão e inicia o uso do aplicativo.
 */
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AloyaLogo from '../../../../shared/components/common/AloyaLogo';
import Button from '../../../../shared/components/common/Button/Button';
import { ArrowLeftIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './OnboardingComplete.styles';

const fundoClaro = ['#F3ECE2', '#F5F3EE', '#F5F3EE', '#F3ECE2'];
const fundoEscuro = ['#1E1E1E', '#1E1E1E', '#1E1E1E', '#1E1E1E'];
const posicoesFundo = [0, 0.55, 0.85, 1];

export default function OnboardingComplete({ aoIniciar, logo }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    return (
        <LinearGradient
            colors={tema.escuro ? fundoEscuro : fundoClaro}
            locations={posicoesFundo}
            style={estilos.fundo}
        >
            <SafeAreaView style={estilos.tela}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    onPress={aoIniciar}
                    style={estilos.voltar}
                >
                    <ArrowLeftIcon size={22} color={tema.cores.interface.textoSecundario} />
                </Pressable>
                <View style={estilos.conteudo}>
                    <View style={estilos.espacoSuperior} />
                    <Text style={estilos.titulo}>
                        Esperamos que sua experiência com <Text style={estilos.marca}>ALOYA</Text>{' '}
                        seja incrível!
                    </Text>
                    {logo ?? <AloyaLogo style={estilos.logo} />}
                    <View style={estilos.espacoInferior} />
                </View>
                <View style={estilos.rodape}>
                    <Button
                        texto="Iniciar"
                        variante="verde"
                        tamanho="compacto"
                        aoPressionar={aoIniciar}
                        estilo={tema.escuro ? { backgroundColor: '#A5D6A7' } : undefined}
                        estiloTexto={tema.escuro ? { color: '#121212' } : undefined}
                    />
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}
