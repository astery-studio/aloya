/**
 * Campo controlado que mascara horários e oferece remoção opcional.
 */
import { useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { ClockIcon as Clock, TrashIcon as Trash } from '../../icons/AppIcons';
import { cores } from '../../../theme';
import { formatTime } from '../../../utils/formatting/formatTime';
import { estilos } from '../TimeInput/TimeInput.styles';

export default function TimeInput({
    valor = '', onChangeText, aoRemover, podeRemover = false,
    desativado = false, estilo
}) {
    const entradaRef = useRef(null);
    return (
        <View style={[estilos.linha, estilo]}>
            <Pressable accessible={false} testID="area-campo-horario"
                disabled={desativado} onPress={() => entradaRef.current?.focus()}
                style={[estilos.campo, desativado && estilos.desativado]}>
                <Clock size={18} color={cores.neutras.textoPrincipalClaro} />
                <TextInput
                    ref={entradaRef}
                    accessibilityLabel="Horário"
                    editable={!desativado}
                    keyboardType="number-pad"
                    maxLength={5}
                    placeholder="HH:MM"
                    placeholderTextColor={cores.neutras.textoSecundarioClaro}
                    value={valor}
                    onChangeText={(texto) => onChangeText?.(formatTime(texto))}
                    style={estilos.entrada}
                />
            </Pressable>
            {podeRemover && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remover horário ${valor || ''}`.trim()}
                    disabled={desativado}
                    onPress={aoRemover}
                    style={({ pressed }) => [
                        estilos.remover, pressed && estilos.pressionado,
                        desativado && estilos.desativado
                    ]}
                >
                    <Trash size={20} color={cores.feedback.erro} />
                </Pressable>
            )}
        </View>
    );
}
