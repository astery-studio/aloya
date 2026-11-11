import { useMemo } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { XCircleIcon } from 'phosphor-react-native';

import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './DurationInput.styles';

function limitarDoisDigitos(texto) {
    return texto.replace(/\D/g, '').slice(0, 2);
}

function decomporDuracao(valorMinutos) {
    if (!Number.isSafeInteger(valorMinutos) || valorMinutos <= 0) return { horas: '', minutos: '' };
    return {
        horas: String(Math.floor(valorMinutos / 60)).padStart(2, '0'),
        minutos: String(valorMinutos % 60).padStart(2, '0')
    };
}

function DurationInput({ valorMinutos, aoAlterar, desabilitado = false, erro }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const duracao = decomporDuracao(valorMinutos);

    function alterar(parte, texto) {
        const recebido = limitarDoisDigitos(texto);
        const horas = parte === 'horas' ? recebido : duracao.horas;
        const minutos = parte === 'minutos' ? recebido : duracao.minutos;
        const total = Number(horas || 0) * 60 + Math.min(Number(minutos || 0), 59);
        aoAlterar?.(horas || minutos ? total : null);
    }

    return (
        <View>
            <View style={[estilos.container, desabilitado && estilos.desabilitado]}>
                <View style={estilos.grupo}>
                    <TextInput
                        accessibilityLabel="Horas de sono"
                        editable={!desabilitado}
                        keyboardType="number-pad"
                        maxLength={2}
                        value={duracao.horas}
                        onChangeText={(texto) => alterar('horas', texto)}
                        style={estilos.entrada}
                    />
                    <Text style={estilos.unidade}>hora</Text>
                </View>
                <View style={estilos.grupo}>
                    <TextInput
                        accessibilityLabel="Minutos de sono"
                        editable={!desabilitado}
                        keyboardType="number-pad"
                        maxLength={2}
                        value={duracao.minutos}
                        onChangeText={(texto) => alterar('minutos', texto)}
                        style={estilos.entrada}
                    />
                    <Text style={estilos.unidade}>minutos</Text>
                </View>
                {valorMinutos ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Limpar tempo de sono"
                        hitSlop={8}
                        onPress={() => aoAlterar?.(null)}
                        style={estilos.limpar}
                    >
                        <XCircleIcon size={18} color={tema.cores.marca.primaria} />
                    </Pressable>
                ) : null}
            </View>
            {erro ? (
                <Text accessibilityRole="alert" style={estilos.erro}>
                    {erro}
                </Text>
            ) : null}
        </View>
    );
}

export { decomporDuracao };
export default DurationInput;
