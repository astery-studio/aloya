import { ScrollView, Text, View } from 'react-native';
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts
} from '@expo-google-fonts/dm-sans';
import { cores, espacamentos, espacamentosLayout, fontFamilies, typography } from './theme';

function Secao({ titulo, children }) {
    return (
        <View style={{ gap: espacamentos.medio }}>
            <Text style={{ ...typography.h2, color: cores.neutras.textoPrincipalClaro }}>
                {titulo}
            </Text>
            {children}
        </View>
    );
}

export default function App() {
    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold
    });

    if (!fontsLoaded) return null;

    return (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{
            gap: espacamentos.extraGrande,
            paddingHorizontal: espacamentosLayout.margemHorizontalTela,
            paddingTop: 60,
            paddingBottom: espacamentos.maximo,
            backgroundColor: cores.neutras.fundoClaro
        }}>
            <Text style={{ ...typography.h1, color: cores.neutras.textoPrincipalClaro }}>
                Aloya — componentes
            </Text>
            <Secao titulo="Cores e tipografia">
                {Object.entries(cores).flatMap(([grupo, paleta]) =>
                    Object.entries(paleta).map(([nomeCor, cor]) => (
                        <View key={`${grupo}.${nomeCor}`} style={{
                            flexDirection: 'row', alignItems: 'center',
                            gap: espacamentos.pequeno
                        }}>
                            <View style={{
                                width: 24, height: 24, backgroundColor: cor,
                                borderRadius: 12, borderWidth: 1,
                                borderColor: cores.neutras.bordaClara
                            }} />
                            <Text style={typography.caption}>
                                {grupo}.{nomeCor}: {cor}
                            </Text>
                        </View>
                    ))
                )}
                {Object.entries(typography).map(([nomeTipo, estilo]) => (
                    <Text key={nomeTipo} style={{
                        ...estilo, color: cores.neutras.textoPrincipalClaro
                    }}>
                        {nomeTipo} — DM Sans
                    </Text>
                ))}
                <Text style={typography.caption}>
                    Fontes: {Object.keys(fontFamilies).join(', ')}
                </Text>
            </Secao>
        </ScrollView>
    );
}
