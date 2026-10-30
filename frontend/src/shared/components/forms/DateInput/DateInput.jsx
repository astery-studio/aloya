/**
 * Campo controlado que aplica máscara de data e abre o teclado ao ser pressionado.
 */
import { useMemo, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { CalendarBlankIcon as CalendarBlank } from 'phosphor-react-native/src/icons/CalendarBlank';
import { useTheme } from '../../../hooks/useTheme';
import { formatDate } from '../../../utils/date/formatDate';
import { criarEstilos } from './DateInput.styles';

export default function DateInput({
    valor = '',
    onChangeText,
    desativado = false,
    estilo,
    rotuloAcessibilidade = 'Data',
    onFocus,
    onBlur,
    testeId = 'campo-data'
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const entradaRef = useRef(null);
    const [focado, setFocado] = useState(false);
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Digitar data"
            disabled={desativado}
            onPress={() => entradaRef.current?.focus()}
            style={[estilos.botao, desativado && estilos.desativado, estilo]}
        >
            <View style={[estilos.campo, focado && estilos.focado]} testID={testeId}>
                <CalendarBlank size={20} color={tema.cores.interface.textoSecundario} />
                <TextInput
                    ref={entradaRef}
                    accessibilityLabel={rotuloAcessibilidade}
                    editable={!desativado}
                    keyboardType="number-pad"
                    maxLength={10}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={tema.cores.interface.textoSecundario}
                    selectionColor={tema.cores.interface.destaque}
                    value={valor}
                    onChangeText={(texto) => onChangeText?.(formatDate(texto))}
                    onFocus={(evento) => {
                        setFocado(true);
                        onFocus?.(evento);
                    }}
                    onBlur={(evento) => {
                        setFocado(false);
                        onBlur?.(evento);
                    }}
                    style={estilos.entrada}
                />
            </View>
        </Pressable>
    );
}
