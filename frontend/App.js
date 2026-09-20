import { ScrollView, Text, View } from 'react-native';
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts
} from '@expo-google-fonts/dm-sans';
import { cores, espacamentos, espacamentosLayout, typography } from './theme';

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
        </ScrollView>
    );
}
