import { useHomeColors } from '../../hooks/useHomeColors';
import { Text, View } from 'react-native';
import { SparkleIcon } from '../../../../shared/components/icons/AppIcons';
import { estilos as estilosClaros } from './FertileHighlight.styles';

function FertileHighlight({ cor = '#4A758E' } = {}) {
    const { estilos, cor: adaptarCor } = useHomeColors(estilosClaros);
    return (
        <View style={estilos.margem}>
            <View
                accessibilityLabel="Janela fértil ativa"
                style={[estilos.container, { borderColor: adaptarCor(cor) }]}
            >
                <View style={estilos.icone}>
                    <SparkleIcon size={22} color={adaptarCor(cor)} weight="fill" />
                </View>
                <View style={estilos.textos}>
                    <Text style={estilos.titulo}>Janela fértil</Text>
                    <Text style={estilos.descricao}>Você está na janela fértil.</Text>
                </View>
            </View>
        </View>
    );
}

export { FertileHighlight };
