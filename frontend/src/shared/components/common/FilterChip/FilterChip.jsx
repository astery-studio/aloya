import { useMemo } from 'react';
import { Pressable, Text } from 'react-native';
import { XCircleIcon } from 'phosphor-react-native/src/icons/XCircle';

import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './FilterChip.styles';

function FilterChip({
    rotulo,
    aoRemover,
    rotuloAcessibilidade,
    testID,
    cor,
    fundo,
    estilo,
    estiloTexto,
    tamanhoIcone = 18
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    return (
        <Pressable
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={rotuloAcessibilidade ?? `Remover filtro ${rotulo}`}
            onPress={aoRemover}
            style={({ pressed }) => [
                estilos.chip,
                cor ? { borderColor: cor } : null,
                fundo ? { backgroundColor: fundo } : null,
                estilo,
                pressed && estilos.pressionado
            ]}
        >
            <Text style={[estilos.texto, cor ? { color: cor } : null, estiloTexto]}>{rotulo}</Text>
            <XCircleIcon size={tamanhoIcone} color={cor ?? tema.cores.marca.primaria} />
        </Pressable>
    );
}

export { FilterChip };
