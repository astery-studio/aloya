import { ActivityIndicator, Text, View } from 'react-native';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { tema } from '../../../shared/theme';
import { estilos } from '../screens/CycleParametersScreen.styles';

function CycleParametersStateView({ carregando, onTentarNovamente }) {
    if (carregando) {
        return (
            <View accessibilityLiveRegion="polite" style={estilos.estado}>
                <ActivityIndicator size="large" color={tema.cores.marca.secundaria} />
                <Text style={estilos.textoEstado}>Carregando parâmetros do ciclo...</Text>
            </View>
        );
    }

    return (
        <View style={estilos.estado}>
            <Text accessibilityRole="alert" style={estilos.tituloErro}>
                Algo deu errado
            </Text>
            <Text style={estilos.textoEstado}>
                Não foi possível carregar os parâmetros do ciclo.
            </Text>
            <ButtonScreen
                texto="Tentar novamente"
                variante="preto"
                aoPressionar={onTentarNovamente}
            />
        </View>
    );
}

export { CycleParametersStateView };
