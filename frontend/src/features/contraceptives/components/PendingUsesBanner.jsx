import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilosUso } from './usageComponents.styles';

function PendingUsesBanner({ quantidade }) {
    const tema = useTheme();
    const estilosUso = useMemo(() => criarEstilosUso(tema), [tema]);
    if (!quantidade || quantidade < 1) return null;

    const descricao =
        quantidade === 1 ? '1 uso pendente hoje' : `${quantidade} usos pendentes hoje`;

    return (
        <View
            accessible
            accessibilityRole="alert"
            accessibilityLabel={descricao}
            style={estilosUso.banner}
        >
            <WarningCircleIcon
                size={14.99}
                color={tema.escuro ? '#F2B45F' : '#B07D2A'}
                weight="fill"
            />
            <Text style={estilosUso.textoBanner}>{descricao}</Text>
        </View>
    );
}

export { PendingUsesBanner };
