import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { CalendarBlankIcon } from 'phosphor-react-native';
import { BottomTabBar } from '../../../shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar';
import { cores } from '../../../shared/theme';
import { CycleDateStrip } from '../components/CycleDateStrip';
import { CycleForecastPanel } from '../components/CycleForecastPanel';
import { PredictionErrorModal } from '../components/PredictionErrorModal';
import { conteudoPorFase } from '../constants/phaseContent';
import { criarDiasDaFaixa, obterDiaCiclo, obterFase } from '../utils/cyclePresentation';
import { estilos } from './CycleTodayScreen.styles';

function CycleTodayScreen({ previsao, carregando = false, erro = false, dataSelecionada, aoSelecionarData, aoTentarNovamente, aoVoltar, aoCadastrarMenstruacao, aoAbrirDiario, aoAbrirAnticoncepcional, aoAbrirCalendario, aoSelecionarAba }) {
    const referencia = dataSelecionada || previsao?.dataReferencia;
    const fases = previsao?.fasesEstimadas;
    const fase = referencia ? obterFase(referencia, fases) : 'desconhecida';
    const dataBaseDaFaixa = previsao?.dataReferencia || referencia;
    const dias = dataBaseDaFaixa ? criarDiasDaFaixa(dataBaseDaFaixa, fases) : [];
    const semDados = previsao?.status === 'DADOS_INSUFICIENTES';

    return (
        <View style={estilos.tela}>
            <View style={estilos.cabecalho}>
                <Text style={estilos.titulo}>Aloya - Seu Ciclo Hoje</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Abrir calendário" onPress={aoAbrirCalendario} style={estilos.botaoCalendario}>
                    <CalendarBlankIcon size={22} color={cores.neutras.textoPrincipalClaro} />
                </Pressable>
            </View>
            {carregando ? (
                <View style={estilos.carregando}><ActivityIndicator size="large" color={cores.marca.secundaria} /><Text style={estilos.textoCarregando}>Carregando sua previsão...</Text></View>
            ) : (
                <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
                    {dias.length ? <CycleDateStrip dias={dias} dataSelecionada={referencia} aoSelecionarData={aoSelecionarData} /> : null}
                    <CycleForecastPanel
                        fase={fase}
                        diaCiclo={obterDiaCiclo(referencia, fases)}
                        previsao={semDados ? null : previsao}
                        conteudoDaFase={conteudoPorFase[fase]}
                        aoCadastrarMenstruacao={aoCadastrarMenstruacao}
                        aoAbrirDiario={aoAbrirDiario}
                        aoAbrirAnticoncepcional={aoAbrirAnticoncepcional}
                    />
                </ScrollView>
            )}
            <BottomTabBar abaAtiva="inicio" onSelecionar={aoSelecionarAba} />
            <PredictionErrorModal visivel={erro} aoTentarNovamente={aoTentarNovamente} aoVoltar={aoVoltar} />
        </View>
    );
}

export { CycleTodayScreen };
