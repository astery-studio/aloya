//Organiza o cabeçalho e o conteúdo dos painéis inferiores. É usado por SelectionSheet e EditFieldSheet
import { Pressable, Text, View } from 'react-native';
import { XIcon } from 'phosphor-react-native/src/icons/X';
import { estilos, corIconeFechar } from './BottomSheetLayout.style';

function BottomSheetLayout({
    titulo,
    onFechar,
    bloquearFechamento = false,
    compacto = false,
    children
}) {
    function fecharPeloX() {
        if (!bloquearFechamento) {
            onFechar?.();
        }
    }

    return (
        <View style={estilos.container}>
            <View style={[estilos.cabecalho, compacto && estilos.cabecalhoCompacto]}>
                <Text style={[estilos.titulo, compacto && estilos.tituloCompacto]}>{titulo}</Text>

                <Pressable
                    onPress={fecharPeloX}
                    disabled={bloquearFechamento}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar painel"
                    style={[estilos.botaoFechar, compacto && estilos.botaoFecharCompacto]}
                >
                    <XIcon size={24} color={corIconeFechar} weight="regular" />
                </Pressable>
            </View>

            <View style={estilos.conteudo}>{children}</View>
        </View>
    );
}

export { BottomSheetLayout };
