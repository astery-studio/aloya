import { Text, View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DropIcon, NotepadIcon, PillIcon } from '../../../../shared/components/icons/AppIcons';
import { NoCycleHero } from './NoCycleHero';
import { estilos } from './NoCycleStartSection.styles';

function NoCycleStartSection({
    motivoSemPrevisao,
    aoCadastrarMenstruacao,
    aoAbrirDiario,
    aoAbrirAnticoncepcional
}) {
    return (
        <>
            <NoCycleHero motivoSemPrevisao={motivoSemPrevisao} />
            <View style={estilos.cartao}>
                <Text style={estilos.rotulo}>Primeiro passo</Text>
                <Text style={estilos.titulo}>Vamos começar?</Text>
                <Text style={estilos.descricao}>
                    Registre as datas da sua menstruação para começar a construir seu histórico. Com
                    o tempo, esses registros ajudam a acompanhar a duração e as variações dos seus
                    ciclos.
                </Text>
                <ButtonScreen
                    texto="Cadastrar Menstruação"
                    icone={DropIcon}
                    aoPressionar={aoCadastrarMenstruacao}
                    estilo={estilos.acaoPrincipal}
                />
                <Text style={estilos.observacao}>
                    Você também pode registrar menstruações anteriores, caso se lembre das datas.
                </Text>
            </View>
            <View style={estilos.cartao}>
                <Text style={estilos.rotulo}>Seu espaço</Text>
                <Text style={estilos.titulo}>Comece por você!</Text>
                <Text style={estilos.descricao}>
                    Você não precisa ter um ciclo registrado para começar. Anote como está se
                    sentindo ou organize o acompanhamento do seu anticoncepcional.
                </Text>
                <View style={estilos.acoes}>
                    <ButtonScreen
                        texto="Diário"
                        icone={NotepadIcon}
                        aoPressionar={aoAbrirDiario}
                        variante="verde"
                        estilo={estilos.acao}
                    />
                    <ButtonScreen
                        texto="Anticoncepcional"
                        icone={PillIcon}
                        aoPressionar={aoAbrirAnticoncepcional}
                        variante="verde"
                        estilo={estilos.acao}
                    />
                </View>
            </View>
        </>
    );
}

export { NoCycleStartSection };
