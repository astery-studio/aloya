import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { CalendarBlank } from 'phosphor-react-native';
import { cores } from '../../theme';
import { formatDate } from '../../utils/date/formatDate';
import { estilos } from './DateInput.styles';

export default function DateInput({
    valor = '', onChangeText, aoPressionarCalendario,
    desativado = false, estilo, rotuloAcessibilidade = 'Data',
    onFocus, onBlur, testeId = 'campo-data'
}) {
    const entradaRef = useRef(null);
    const [focado, setFocado] = useState(false);

    return (
        <View style={[
            estilos.campo, focado && estilos.focado,
            desativado && estilos.desativado, estilo
        ]} testID={testeId}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={aoPressionarCalendario ? 'Abrir calendário' : 'Digitar data'}
                hitSlop={12}
                disabled={desativado}
                onPress={aoPressionarCalendario || (() => entradaRef.current?.focus())}
            >
                <CalendarBlank size={20} color={cores.neutras.textoSecundarioClaro} />
            </Pressable>
            <TextInput
                ref={entradaRef}
                accessibilityLabel={rotuloAcessibilidade}
                editable={!desativado}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={cores.neutras.textoSecundarioClaro}
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
    );
}
