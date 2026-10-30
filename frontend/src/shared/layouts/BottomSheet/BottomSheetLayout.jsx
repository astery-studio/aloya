// Organiza o cabeçalho e o conteúdo dos painéis inferiores.
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { XIcon } from 'phosphor-react-native/src/icons/X';

import { useTheme } from '../../hooks/useTheme';
import { criarEstilos } from './BottomSheetLayout.style';

function BottomSheetLayout({
    titulo,
    onFechar,
    bloquearFechamento = false,
    compacto = false,
    corFundo,
    children
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    function fecharPeloX() {
        if (!bloquearFechamento) {
            onFechar?.();
        }
    }

    return (
        <View
            testID="bottom-sheet-layout"
            style={[estilos.container, corFundo ? { backgroundColor: corFundo } : null]}
        >
            <View
                testID="bottom-sheet-cabecalho"
                style={[
                    estilos.cabecalho,
                    compacto && estilos.cabecalhoCompacto,
                    corFundo ? { backgroundColor: corFundo } : null
                ]}
            >
                <Text
                    accessibilityRole="header"
                    style={[estilos.titulo, compacto && estilos.tituloCompacto]}
                >
                    {titulo}
                </Text>

                <Pressable
                    onPress={fecharPeloX}
                    disabled={bloquearFechamento}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar painel"
                    accessibilityState={{
                        disabled: bloquearFechamento
                    }}
                    style={[
                        estilos.botaoFechar,
                        compacto && estilos.botaoFecharCompacto,
                        bloquearFechamento && estilos.desabilitado
                    ]}
                >
                    <XIcon
                        size={24}
                        color={tema.cores.interface.textoSecundario}
                        weight="regular"
                    />
                </Pressable>
            </View>

            <View
                testID="bottom-sheet-conteudo"
                style={[estilos.conteudo, corFundo ? { backgroundColor: corFundo } : null]}
            >
                {children}
            </View>
        </View>
    );
}

export { BottomSheetLayout };
