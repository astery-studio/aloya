import { useHomeColors } from '../../hooks/useHomeColors';
import { Text, View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DropIcon, NotebookIcon, PillIcon } from '../../../../shared/components/icons/AppIcons';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';
import { NoCycleHero } from './NoCycleHero';
import { estilos as estilosClaros } from './NoCycleStartSection.styles';

function MenstruationIcon(props) {
    return <DropIcon {...props} weight="fill" />;
}

function NoCycleStartSection({
    motivoSemPrevisao,
    aoCadastrarMenstruacao,
    aoAbrirDiario,
    aoAbrirAnticoncepcional
}) {
    const { estilos, escuro } = useHomeColors(estilosClaros);
    const corConteudo = escuro ? coresNoturnasConteudo.fundo : undefined;
    return (
        <>
            <NoCycleHero motivoSemPrevisao={motivoSemPrevisao} />
            <View style={[estilos.cartao, estilos.primeiroPasso]}>
                <Text style={estilos.rotulo}>Primeiro passo</Text>
                <Text style={estilos.titulo}>Vamos começar?</Text>
                <Text style={estilos.descricao}>
                    Registre as datas da sua menstruação para começar a construir seu histórico. Com
                    o tempo, esses registros ajudam a acompanhar a duração e as variações dos seus
                    ciclos.
                </Text>
                <ButtonScreen
                    texto="Cadastrar Menstruação"
                    corConteudo={corConteudo}
                    icone={MenstruationIcon}
                    tamanhoIcone={20}
                    aoPressionar={aoCadastrarMenstruacao}
                    estilo={estilos.acaoPrincipal}
                    estiloTexto={[estilos.textoAcao, estilos.textoAcaoPrincipal]}
                />
                <Text style={estilos.observacao}>
                    Você também pode registrar menstruações anteriores, caso se lembre das datas.
                </Text>
            </View>
            <View style={[estilos.cartao, estilos.seuEspaco]}>
                <Text style={estilos.rotulo}>Seu espaço</Text>
                <Text style={estilos.titulo}>Comece por você!</Text>
                <Text style={estilos.descricao}>
                    Você não precisa ter um ciclo registrado para começar. Anote como está se
                    sentindo ou organize o acompanhamento do seu anticoncepcional.
                </Text>
                <View style={estilos.acoes}>
                    <ButtonScreen
                        texto="Diário"
                        corConteudo={corConteudo}
                        icone={NotebookIcon}
                        tamanhoIcone={20}
                        aoPressionar={aoAbrirDiario}
                        variante="verde"
                        estilo={estilos.acao}
                        estiloTexto={estilos.textoAcao}
                    />
                    <ButtonScreen
                        texto="Anticoncepcional"
                        corConteudo={corConteudo}
                        icone={PillIcon}
                        tamanhoIcone={20}
                        aoPressionar={aoAbrirAnticoncepcional}
                        variante="verde"
                        estilo={[estilos.acao, estilos.acaoAnticoncepcional]}
                        estiloTexto={estilos.textoAcao}
                    />
                </View>
            </View>
        </>
    );
}

export { NoCycleStartSection };
