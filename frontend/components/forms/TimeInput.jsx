import { Pressable, Text, View } from 'react-native';
import { Clock, Trash } from 'phosphor-react-native';
import { cores } from '../../theme';
import { estilos } from './TimeInput.styles';

export default function TimeInput({
    valor, aoPressionar, aoRemover, podeRemover = false,
    desativado = false, estilo
}) {
    return (
        <View style={[estilos.linha, estilo]}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Selecionar horário"
                accessibilityValue={{ text: valor || 'Nenhum horário selecionado' }}
                accessibilityState={{ disabled: desativado }}
                disabled={desativado}
                onPress={aoPressionar}
                style={({ pressed }) => [
                    estilos.campo, pressed && estilos.pressionado,
                    desativado && estilos.desativado
                ]}
            >
                <Clock size={18} color={cores.neutras.textoPrincipalClaro} />
                <Text style={[estilos.texto, !valor && estilos.placeholder]}>
                    {valor || 'HH:mm'}
                </Text>
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
