/**
 * Tela inicial que encaminha a pessoa para criação de conta ou login.
 */
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button/Button';
import { estilos } from './WelcomeScreen.styles';

export default function WelcomeScreen({ aoCriarConta, aoEntrar, logo }) {
    return (
        <SafeAreaView style={estilos.tela}>
            <View style={estilos.logo}>
                {logo || <Text style={estilos.reservaLogo}>Aloya</Text>}
            </View>
            <View style={estilos.acoes}>
                <Button texto="Criar Conta" variante="verde" aoPressionar={aoCriarConta} />
                <Button texto="Entrar" variante="bordaVerde" aoPressionar={aoEntrar} />
            </View>
        </SafeAreaView>
    );
}
