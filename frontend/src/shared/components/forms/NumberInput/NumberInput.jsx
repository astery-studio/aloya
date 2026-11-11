/**
 * Campo numérico controlado que mantém a unidade visível e não editável.
 */
import { useMemo, useRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { XCircleIcon } from 'phosphor-react-native';
import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './NumberInput.styles';
import { converterEntradaNumerica } from './numberInputValue';

export default function NumberInput({
    valor,
    aoAlterar,
    unidade = 'Dias',
    desativado = false,
    rotuloAcessibilidade = 'Duração em dias',
    casasDecimais = 0,
    maximoDigitosInteiros = 2,
    valorMinimo,
    valorMaximo,
    estilo,
    permitirLimpar = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const entradaRef = useRef(null);
    const texto =
        valor === null || valor === undefined
            ? ''
            : String(valor).replace('.', casasDecimais > 0 ? ',' : '.');
    const numeroAtual = texto ? Number(texto.replace(',', '.')) : Number.NaN;
    const comprimentoMaximo = maximoDigitosInteiros + (casasDecimais > 0 ? casasDecimais + 1 : 0);

    function alterar(novoTexto) {
        aoAlterar?.(converterEntradaNumerica(novoTexto, casasDecimais, maximoDigitosInteiros));
    }

    return (
        <Pressable
            accessible={false}
            testID="area-campo-numero"
            disabled={desativado}
            onPress={() => entradaRef.current?.focus()}
            style={[estilos.campo, desativado && estilos.desativado, estilo]}
        >
            <View style={estilos.conteudo}>
                <TextInput
                    ref={entradaRef}
                    accessibilityLabel={rotuloAcessibilidade}
                    accessibilityValue={{
                        ...(Number.isFinite(valorMinimo) ? { min: valorMinimo } : {}),
                        ...(Number.isFinite(valorMaximo) ? { max: valorMaximo } : {}),
                        ...(Number.isFinite(numeroAtual) ? { now: numeroAtual } : {})
                    }}
                    editable={!desativado}
                    keyboardType={casasDecimais > 0 ? 'decimal-pad' : 'number-pad'}
                    maxLength={comprimentoMaximo}
                    selectionColor={tema.cores.interface.destaque}
                    selectTextOnFocus
                    value={texto}
                    onChangeText={alterar}
                    style={estilos.entrada}
                />
                <Text style={estilos.unidade}>{unidade}</Text>
                {permitirLimpar && texto ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Limpar ${rotuloAcessibilidade}`}
                        hitSlop={8}
                        onPress={() => aoAlterar?.(null)}
                        style={estilos.limpar}
                    >
                        <XCircleIcon size={18} color={tema.cores.marca.primaria} />
                    </Pressable>
                ) : null}
            </View>
        </Pressable>
    );
}
