/**
 * Tela inicial que encaminha a pessoa para criação de conta ou login.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AloyaLogo from '../../../shared/components/common/AloyaLogo';
import Button from '../../../shared/components/common/Button/Button';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos } from './WelcomeScreen.styles';

export default function WelcomeScreen({ aoCriarConta, aoEntrar, logo }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    return (
        <SafeAreaView style={estilos.tela}>
            <View style={estilos.logo}>{logo || <AloyaLogo style={estilos.imagemLogo} />}</View>
            <View style={estilos.acoes}>
                <Button texto="Criar Conta" variante="verde" aoPressionar={aoCriarConta} />
                <Button texto="Entrar" variante="bordaVerde" aoPressionar={aoEntrar} />
            </View>
        </SafeAreaView>
    );
}
