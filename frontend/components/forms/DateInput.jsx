import { Pressable, Text } from 'react-native';
import { CalendarBlank } from 'phosphor-react-native';
import { cores } from '../../theme';
import { estilos } from './DateInput.styles';

export default function DateInput({
    valor, aoPressionar, desativado = false, estilo,
    rotuloAcessibilidade = 'Selecionar data'
}) {
    const preenchido = Boolean(valor);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={rotuloAcessibilidade}
            accessibilityValue={{ text: valor || 'Nenhuma data selecionada' }}
            accessibilityState={{ disabled: desativado }}
            disabled={desativado}
            onPress={aoPressionar}
            style={({ pressed }) => [
                estilos.campo, preenchido && estilos.preenchido,
                pressed && estilos.pressionado,
                desativado && estilos.desativado, estilo
            ]}
        >
            <Text style={[estilos.texto, preenchido && estilos.textoPreenchido]}>
                {valor || 'DD/MM/AAAA'}
            </Text>
            <CalendarBlank size={20} color={cores.neutras.textoSecundarioClaro} />
        </Pressable>
    );
}
