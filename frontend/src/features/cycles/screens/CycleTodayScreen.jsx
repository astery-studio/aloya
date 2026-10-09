import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { CalendarBlankIcon, WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { BottomTabBar } from '../../../shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar';
import { cores } from '../../../shared/theme';
import { CycleDateStrip } from '../components/CycleDateStrip';
import { CycleForecastPanel } from '../components/CycleForecastPanel';
import { conteudoPorFase } from '../constants/phaseContent';
import { criarDiasDaFaixa, obterDiaCiclo, obterFase } from '../utils/cyclePresentation';
import { estilos } from './CycleTodayScreen.styles';

const CONFIGURACOES_ERRO = Object.freeze({
    previsao: Object.freeze({
        titulo: 'Algo deu errado',
        mensagem: 'Não foi possível carregar sua previsão no momento. Tente novamente.'
    }),
    sincronizacao: Object.freeze({
        titulo: 'Algo deu errado',
        mensagem: 'Não foi possível sincronizar alguns registros. Verifique sua conexão.'
    })
});

function CycleTodayScreen({
    ciclo, previsao, conteudoDaFase, janelaFertil, carregando = false,
    erro = false, erroPrevisao = false, erroSincronizacao = false,
    dataSelecionada, aoSelecionarData, aoTentarNovamente, aoVoltar,
    aoCadastrarMenstruacao, aoAbrirDiario, aoAbrirAnticoncepcional,
    aoAbrirCalendario, aoSelecionarAba
}) {
    const referencia = dataSelecionada || previsao?.dataReferencia || ciclo?.dataReferencia;
    const fases = previsao?.fasesEstimadas || ciclo?.fasesEstimadas || ciclo?.fases;
    const fase = referencia ? obterFase(referencia, fases) : 'desconhecida';
    const dataBaseDaFaixa = previsao?.dataReferencia || referencia;
    const dias = dataBaseDaFaixa ? criarDiasDaFaixa(dataBaseDaFaixa, fases) : [];
    const semDados = !previsao || previsao.status === 'DADOS_INSUFICIENTES';
    const tipoErro = erroSincronizacao ? 'sincronizacao' : (erroPrevisao || erro ? 'previsao' : null);
    const configuracaoErro = CONFIGURACOES_ERRO[tipoErro] || CONFIGURACOES_ERRO.previsao;

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={estilos.tela}>
            {carregando ? (
                <View accessibilityLiveRegion="polite" style={estilos.carregando}><ActivityIndicator size="large" color={cores.marca.secundaria} /><Text style={estilos.textoCarregando}>Carregando sua previsão...</Text></View>
            ) : (
                <ScrollView style={estilos.areaRolagem} contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
                    <View style={estilos.cabecalho}>
                        <Text style={estilos.titulo}>Aloya - Seu Ciclo Hoje</Text>
                        <IconButton
                            icone={CalendarBlankIcon}
                            aoPressionar={aoAbrirCalendario}
                            rotuloAcessibilidade="Abrir calendário"
                            variante="calendario"
                        />
                    </View>
                    {dias.length ? <CycleDateStrip dias={dias} dataSelecionada={referencia} aoSelecionarData={aoSelecionarData} /> : null}
                    <CycleForecastPanel
                        fase={fase}
                        diaCiclo={obterDiaCiclo(referencia, fases)}
                        janelaFertil={janelaFertil}
                        previsao={semDados ? null : previsao}
                        conteudoDaFase={conteudoDaFase ?? conteudoPorFase[fase]}
                        aoCadastrarMenstruacao={aoCadastrarMenstruacao}
                        aoAbrirDiario={aoAbrirDiario}
                        aoAbrirAnticoncepcional={aoAbrirAnticoncepcional}
                    />
                </ScrollView>
            )}
            <SafeAreaView edges={['bottom']} style={estilos.navegacaoSegura}>
                <BottomTabBar abaAtiva="inicio" onSelecionar={aoSelecionarAba} />
            </SafeAreaView>
            <SimpleModal
                visivel={!carregando && Boolean(tipoErro)}
                aoFechar={aoVoltar}
                icone={WarningCircleIcon}
                corIcone={cores.feedback.erro}
                fundoIcone={cores.neutras.fundoClaro}
                titulo={configuracaoErro.titulo}
                mensagem={configuracaoErro.mensagem}
                acaoPrincipal={{ texto: 'Tentar novamente', variante: 'preto', aoPressionar: aoTentarNovamente }}
                acaoSecundaria={{ texto: 'Voltar', variante: 'branco', aoPressionar: aoVoltar }}
            />
        </SafeAreaView>
    );
}

export { CONFIGURACOES_ERRO, CycleTodayScreen };
