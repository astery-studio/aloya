import { Modal, Text, View } from 'react-native';
import ButtonPopup from '../../../shared/components/common/Button/ButtonPopup';
import { WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { estilos } from './PredictionErrorModal.styles';

function PredictionErrorModal({ visivel, aoTentarNovamente, aoVoltar }) {
    if (!visivel) return null;

    return (
        <Modal visible transparent animationType="fade" onRequestClose={aoVoltar}>
            <View style={estilos.fundo}>
                <View accessibilityViewIsModal style={estilos.caixa}>
                    <View style={estilos.areaIcone}>
                        <WarningCircleIcon size={22} color="#B43D3D" />
                    </View>
                    <View style={estilos.textos}>
                        <Text accessibilityRole="header" style={estilos.titulo}>Algo deu errado</Text>
                        <Text style={estilos.mensagem}>Não foi possível carregar sua previsão no momento. Tente novamente.</Text>
                    </View>
                    <View style={estilos.acoes}>
                        <ButtonPopup texto="Tentar novamente" variante="preto" aoPressionar={aoTentarNovamente} />
                        <ButtonPopup texto="Voltar" variante="branco" aoPressionar={aoVoltar} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export { PredictionErrorModal };
