import { Text, View } from 'react-native';

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
        </View>
    );
}