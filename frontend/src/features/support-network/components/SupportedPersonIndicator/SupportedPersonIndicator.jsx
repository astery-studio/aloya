import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './SupportedPersonIndicator.styles';

function SupportedPersonIndicator({ nome }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const nomeExibido = typeof nome === 'string' ? nome.trim() : '';

    if (!nomeExibido) return null;

    return (
        <View
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Acompanhando ${nomeExibido}`}
            style={estilos.container}
        >
            <Text style={estilos.rotulo}>Acompanhando</Text>
            <Text style={estilos.nome}>{nomeExibido}</Text>
        </View>
    );
}

export { SupportedPersonIndicator };
