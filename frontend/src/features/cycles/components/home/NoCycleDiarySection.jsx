import { Text, View } from 'react-native';
import { NavigationField } from '../../../../shared/components/common/NavigationField/NavigationField';
import { HeartIcon, PencilSimpleIcon } from '../../../../shared/components/icons/AppIcons';
import { estilos } from './NoCycleDiarySection.styles';

const CORES_ICONE = Object.freeze({ caixa: 'transparent', icone: '#D68C3A' });

function NoCycleDiarySection({ aoAbrirDiario, aoAbrirReflexao }) {
    const acoes = [
        ['Como você está se sentindo?', HeartIcon, aoAbrirDiario],
        ['Gostaria de fazer uma anotação?', PencilSimpleIcon, aoAbrirReflexao]
    ];

    return (
        <View testID="diario-home-sem-ciclo" style={estilos.cartao}>
            <Text style={estilos.rotulo}>Seu Diário já está disponível</Text>
            <Text accessibilityRole="header" style={estilos.titulo}>
                Você já pode começar por aqui.
            </Text>
            <Text style={estilos.descricao}>
                Não precisa esperar sua próxima menstruação para registrar como você se sente.
            </Text>
            <View style={estilos.acoes}>
                {acoes.map(([label, icone, onPress]) => (
                    <NavigationField
                        key={label}
                        label={label}
                        icone={icone}
                        onPress={onPress}
                        coresIcone={CORES_ICONE}
                        tamanhoIcone={22}
                        corSeta="#5C5C59"
                        estilo={estilos.acao}
                        estiloCaixaIcone={estilos.iconeAcao}
                        estiloTexto={estilos.textoAcao}
                    />
                ))}
            </View>
        </View>
    );
}

export { NoCycleDiarySection };
