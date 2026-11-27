import { Pressable, Text, View } from 'react-native';
import { CaretRightIcon } from '../../../../shared/components/icons/AppIcons';
import { estilos } from './SharedCycleMomentCard.styles';

function SharedCycleMomentCard({ titulo, descricao, aoPressionar }) {
    const interativo = typeof aoPressionar === 'function';
    const Card = interativo ? Pressable : View;
    const propsAcao = interativo
        ? {
              accessibilityRole: 'button',
              accessibilityLabel: `Momento do ciclo. ${titulo}. Informação autorizada`,
              onPress: aoPressionar
          }
        : {};

    return (
        <View style={estilos.area}>
            <Card {...propsAcao} style={estilos.card}>
                <View style={estilos.cabecalho}>
                    <Text style={estilos.rotulo}>Momento do ciclo</Text>
                    {interativo ? (
                        <View style={estilos.selo}>
                            <Text style={estilos.textoSelo}>Informação autorizada</Text>
                        </View>
                    ) : null}
                </View>
                <View style={estilos.conteudo}>
                    <View style={estilos.textos}>
                        <Text style={estilos.titulo}>{titulo}</Text>
                        {descricao ? <Text style={estilos.descricao}>{descricao}</Text> : null}
                    </View>
                    {interativo ? (
                        <CaretRightIcon size={22} color="#222222" style={estilos.icone} />
                    ) : null}
                </View>
            </Card>
        </View>
    );
}

export { SharedCycleMomentCard };
