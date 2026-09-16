import { useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { CalendarBlank } from 'phosphor-react-native';
import { cores } from '../../theme';
import { estilos } from './DateInput.styles';

function formatarData(texto) {
    const numeros = texto.replace(/\D/g, '').slice(0, 8);
    if (numeros.length > 4) return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
    if (numeros.length > 2) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return numeros;
}

export default function DateInput({
    valor = '', onChangeText, aoPressionarCalendario,
    desativado = false, estilo, rotuloAcessibilidade = 'Data'
}) {
    const entradaRef = useRef(null);
    const preenchido = Boolean(valor);

    return (
        <View style={[
            estilos.campo, preenchido && estilos.preenchido,
            desativado && estilos.desativado, estilo
        ]}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={aoPressionarCalendario ? 'Abrir calendário' : 'Digitar data'}
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
                onChangeText={(texto) => onChangeText?.(formatarData(texto))}
                style={estilos.entrada}
            />
        </View>
    );
}
