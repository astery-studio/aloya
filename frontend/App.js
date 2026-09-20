import { ScrollView, Text, View } from 'react-native';
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts
} from '@expo-google-fonts/dm-sans';
import {
    cores, espacamentos, espacamentosLayout, fontFamilies,
    radius, shadows, typography
} from './theme';

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
                                borderRadius: radius.buttonAndInput, borderWidth: 1,
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
            <Secao titulo="Espaçamentos, cantos e sombras">
                <Text style={typography.caption}>
                    Espaçamentos: {Object.entries(espacamentos).map(
                        ([nome, valor]) => `${nome} ${valor}`
                    ).join(' · ')}
                </Text>
                <Text style={typography.caption}>
                    Layout: {Object.entries(espacamentosLayout).map(
                        ([nome, valor]) => `${nome} ${valor}`
                    ).join(' · ')}
                </Text>
                {Object.entries(radius).map(([nome, valor]) => (
                    <View key={nome} style={{
                        padding: espacamentos.pequeno,
                        backgroundColor: cores.neutras.bordaClara,
                        borderTopLeftRadius: valor,
                        borderTopRightRadius: valor,
                        borderBottomLeftRadius: nome === 'settingsCalendar' ||
                            nome === 'bottomSheet' ? 0 : valor,
                        borderBottomRightRadius: nome === 'settingsCalendar' ||
                            nome === 'bottomSheet' ? 0 : valor
                    }}>
                        <Text style={typography.caption}>{nome}: {valor}px</Text>
                    </View>
                ))}
                {Object.entries(shadows).map(([nome, sombra]) => (
                    <View key={nome} style={{ ...sombra,
                        padding: espacamentos.medio,
                        backgroundColor: cores.neutras.superficieClara,
                        borderRadius: radius.popup }}>
                        <Text style={typography.caption}>Sombra: {nome}</Text>
                    </View>
                ))}
            </Secao>
        </ScrollView>
    );
}
