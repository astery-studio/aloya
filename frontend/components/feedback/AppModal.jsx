import { Modal, Text, View } from 'react-native';
import { cores } from '../../theme';
import { estilos } from './AppModal.styles';

export default function AppModal({
    visivel, aoFechar, icone: Icone, corIcone = cores.marca.primaria,
    fundoIcone, titulo, mensagem, children
}) {
    return (
        <Modal
            visible={visivel}
            transparent
            animationType="fade"
            onRequestClose={aoFechar}
        >
            <View style={estilos.fundo}>
                <View
                    accessibilityViewIsModal
                    style={estilos.caixa}
                >
                    {Icone && (
                        <View style={[estilos.areaIcone, fundoIcone && {
                            backgroundColor: fundoIcone
                        }]}>
                            <Icone size={22} color={corIcone} />
                        </View>
                    )}
                    <View style={estilos.textos}>
                        <Text accessibilityRole="header" style={estilos.titulo}>
                            {titulo}
                        </Text>
                        {mensagem ? (
                            <Text style={estilos.mensagem}>{mensagem}</Text>
                        ) : null}
                    </View>
                    {children ? (
                        <View style={estilos.acoes}>{children}</View>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
}
