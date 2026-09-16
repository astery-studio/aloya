import { Text, View } from 'react-native';
import { Header } from './components/navigation/Header/Header';

function testarVoltar() {
    Alert.alert('Teste', 'Voltar funcionou.')
}

import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts
} from '@expo-google-fonts/dm-sans';

export default function App() {
    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <View>
            <Text>ALOYA</Text>
            <Header titulo="Configurações" variante="padrao" />

            <Header
                titulo="Configurações de Perfil"
                variante="comVoltar"
                onVoltar={testarVoltar}
            />
        </View>
    );
}