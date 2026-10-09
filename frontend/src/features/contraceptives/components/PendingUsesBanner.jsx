import { Text, View } from 'react-native';
import { WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { estilosUso } from './usageComponents.styles';

function PendingUsesBanner({ quantidade }) {
    if (!quantidade || quantidade < 1) return null;

    const descricao = quantidade === 1
        ? '1 uso pendente hoje'
        : `${quantidade} usos pendentes hoje`;

    return (
        <View
            accessible
            accessibilityRole="alert"
            accessibilityLabel={descricao}
            style={estilosUso.banner}
        >
            <WarningCircleIcon size={14.99} color="#B07D2A" />
            <Text numberOfLines={1} style={estilosUso.textoBanner}>{descricao}</Text>
        </View>
    );
}

export { PendingUsesBanner };
