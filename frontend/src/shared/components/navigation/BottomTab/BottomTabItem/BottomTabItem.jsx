// Mostra um item individual da navegação inferior.
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../../../hooks/useTheme';
import { criarEstilos } from './BottomTabItem.style';

function BottomTabItem({ icone: Icone, label, ativo = false, onPress }) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const corAtiva = tema.cores.interface.destaque;

    const corInativa = tema.cores.interface.textoSecundario;

    const corDoItem = ativo ? corAtiva : corInativa;

    const desabilitado = typeof onPress !== 'function';

    return (
        <Pressable
            onPress={onPress}
            disabled={desabilitado}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{
                selected: ativo,
                disabled: desabilitado
            }}
            style={[estilos.item, desabilitado && estilos.desabilitado]}
        >
            <Icone size={26} color={corDoItem} weight={ativo ? 'fill' : 'regular'} />

            <Text numberOfLines={1} style={[estilos.label, ativo && estilos.labelAtiva]}>
                {label}
            </Text>

            {ativo ? <View testID={`indicador-aba-${label}`} style={estilos.pontoAtivo} /> : null}
        </Pressable>
    );
}

export { BottomTabItem };
