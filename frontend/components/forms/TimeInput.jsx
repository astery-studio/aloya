import { Pressable, TextInput, View } from 'react-native';
import { Clock, Trash } from 'phosphor-react-native';
import { cores } from '../../theme';
import { formatTime } from '../../utils/formatting/formatTime';
import { estilos } from './TimeInput.styles';

export default function TimeInput({
    valor = '', onChangeText, aoRemover, podeRemover = false,
    desativado = false, estilo
}) {
    return (
        <View style={[estilos.linha, estilo]}>
            <View style={[estilos.campo, desativado && estilos.desativado]}>
                <Clock size={18} color={cores.neutras.textoPrincipalClaro} />
                <TextInput
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
            </View>
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
/**
 * Campo controlado que mascara horários e oferece remoção opcional.
 */
