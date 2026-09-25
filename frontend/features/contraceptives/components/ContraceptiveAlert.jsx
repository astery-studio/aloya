import { Text, View } from 'react-native';
import { Bell } from 'phosphor-react-native';
import { cores } from '../../../theme';
import { estilos } from './contraceptives.styles';

const rotulos = { leve: 'Leve', moderado: 'Moderado', critico: 'Crítico' };

function ContraceptiveAlert({ intensidade = 'critico' }) {
    return (
        <View style={[estilos.alerta, estilos[`alerta_${intensidade}`]]} accessibilityLabel={`Alerta ${rotulos[intensidade] ?? 'Crítico'}`}>
            <Bell size={16} color={cores.neutras.textoPrincipalClaro} />
            <Text style={estilos.textoAlerta}>{rotulos[intensidade] ?? 'Crítico'}</Text>
        </View>
    );
}

export { ContraceptiveAlert };
