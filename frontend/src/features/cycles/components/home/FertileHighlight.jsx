import { Text, View } from 'react-native';
import { SparkleIcon } from '../../../../shared/components/icons/AppIcons';
import { estilos } from './FertileHighlight.styles';

function FertileHighlight() {
    return (
        <View style={estilos.margem}>
            <View accessibilityLabel="Janela fértil ativa" style={estilos.container}>
                <View style={estilos.icone}>
                    <SparkleIcon size={22} color="#4A758E" weight="fill" />
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
