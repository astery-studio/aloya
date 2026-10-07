import { Pressable, Text, View } from 'react-native';
import {
    ArrowsClockwiseIcon,
    CalendarDotsIcon,
    ChartBarIcon,
    DropIcon,
    EggIcon,
    HeartbeatIcon,
    PillIcon,
    SparkleIcon,
    WarningIcon
} from '../../../shared/components/icons/AppIcons';
import { formatarDataLonga } from '../utils/cyclePresentation';
import { estilos } from './CycleForecastPanel.styles';

const AVISO_MEDICO = 'Esta é uma estimativa baseada no seu histórico e não substitui orientação médica nem garante eficácia como método contraceptivo.';
const ROTULOS = { menstrual: 'Fase Menstrual', folicular: 'Fase Folicular', ovulatoria: 'Fase Ovulatória', lutea: 'Fase Lútea', desconhecida: 'Seu ciclo' };
const RECURSOS_SEM_CICLO = [
    { titulo: 'Fases do ciclo', descricao: 'Entenda o que acontece em cada fase.', Icone: ArrowsClockwiseIcon },
    { titulo: 'Janela fértil', descricao: 'Acompanhe sua estimativa de fertilidade.', Icone: SparkleIcon },
    { titulo: 'Próxima menstruação', descricao: 'Visualize quando o próximo ciclo pode começar.', Icone: CalendarDotsIcon },
    { titulo: 'Sintomas e bem-estar', descricao: 'Registre como você se sente ao longo do ciclo.', Icone: HeartbeatIcon }
];

function BotaoAcao({ texto, Icone, destaque = false, pesoIcone = 'regular', aoPressionar }) {
    return (
        <Pressable accessibilityRole="button" accessibilityLabel={texto} onPress={aoPressionar} style={[estilos.botaoAcao, destaque ? estilos.botaoPrimario : estilos.botaoSecundario]}>
            <Icone size={20} color={destaque ? '#FDF6F3' : '#FFFFFF'} weight={pesoIcone} />
            <Text style={[estilos.textoBotao, destaque && estilos.textoBotaoDestaque]}>{texto}</Text>
        </Pressable>
    );
}

function FormaProvisoria({ compacta = false }) {
    return <View accessibilityLabel="Símbolo provisório da fase" style={[estilos.formaProvisoria, compacta && estilos.formaProvisoriaCompacta]}><View style={[estilos.formaInterna, compacta && estilos.formaInternaCompacta]} /></View>;
}

function SeloConfiabilidade({ nivel }) {
    return (
        <View style={[estilos.seloConfiabilidade, estilos[`selo_${nivel}`]]}>
            <Text style={estilos.seloRotulo}>Confiabilidade</Text>
            <Text style={estilos.seloNivel}>{nivel}</Text>
        </View>
    );
}

function PainelPrevisao({ previsao }) {
    const nivel = previsao.confiabilidadeMenstrual?.nivel?.toLowerCase() || 'baixa';
    const janela = previsao.janelaFertilEstimada;
    const incerta = previsao.status === 'PARCIALMENTE_DISPONIVEL';

    return (
        <View style={estilos.secaoPrevisao}>
            <View style={estilos.cartaoProximoCiclo}>
                <View style={estilos.dataProximoCiclo}>
                    <Text style={estilos.rotuloPrevisao}>Próximo ciclo</Text>
                    <Text style={estilos.valorPrincipal}>{formatarDataLonga(previsao.proximoInicioEstimado)}</Text>
                </View>
                <SeloConfiabilidade nivel={nivel} />
            </View>
            <View style={estilos.previsoesSecundarias}>
                <View style={estilos.cartaoSecundario}>
                    <View style={estilos.cabecalhoCartaoSecundario}>
                        <EggIcon size={18} color="#4A758E" />
                        <Text style={estilos.rotuloPrevisao}>Ovulação</Text>
                    </View>
                    <Text style={estilos.valorSecundario}>{formatarDataLonga(previsao.dataOvulacaoEstimada)}</Text>
                </View>
                <View style={estilos.cartaoSecundario}>
                    <View style={estilos.cabecalhoCartaoSecundario}>
                        <SparkleIcon size={18} color="rgba(34, 34, 34, 0.8)" />
                        <Text style={estilos.rotuloPrevisao}>Janela fértil</Text>
                    </View>
                    <Text style={estilos.valorSecundario}>{janela ? `${formatarDataLonga(janela.inicio)} a ${formatarDataLonga(janela.fim)}` : 'Indisponível'}</Text>
                </View>
            </View>
            {incerta ? <Text style={estilos.alerta}>Estimativa incerta para este ciclo</Text> : null}
            {nivel === 'baixa' ? <Text style={estilos.incentivo}>Continue registrando seus ciclos para que suas previsões fiquem cada vez mais precisas.</Text> : null}
            <Text style={estilos.aviso}>{AVISO_MEDICO}</Text>
        </View>
    );
}

function ConteudoFase({ conteudo }) {
    if (!conteudo) return null;
    return (
        <View>
            <View style={estilos.secaoTexto}>
                <Text style={estilos.tituloSecao}>{conteudo.tituloExplicacao}</Text>
                <View style={estilos.textoComMarcador}><View style={estilos.marcador} /><Text style={estilos.descricaoFase}>{conteudo.descricao}</Text></View>
            </View>
            <View style={estilos.secaoSintomas}>
                <Text style={estilos.tituloSecao}>Sintomas comuns</Text>
                <View style={estilos.listaSintomas}>
                    {conteudo.sintomas.map((sintoma) => <View key={sintoma} style={estilos.sintoma}><View style={estilos.marcadorSintoma} /><Text style={estilos.textoSintoma}>{sintoma}</Text></View>)}
                </View>
            </View>
            <View style={estilos.secaoDicas}>
                <Text style={estilos.tituloSecao}>Dicas para hoje</Text>
                {conteudo.dicas.map((dica, indice) => <View key={dica} style={estilos.dica}><View style={estilos.numeroDica}><Text style={estilos.textoNumeroDica}>{indice + 1}</Text></View><Text style={estilos.textoDica}>{dica}</Text></View>)}
            </View>
        </View>
    );
}

function EstadoSemCiclo({ aoCadastrarMenstruacao, aoAbrirDiario, aoAbrirAnticoncepcional }) {
    return (
        <View style={estilos.estadoSemCiclo}>
            <View style={estilos.cartaoIntroducao}>
                <FormaProvisoria compacta />
                <Text style={estilos.tituloSemCiclo}>Conheça seu ciclo</Text>
                <Text style={estilos.descricaoSemCiclo}>Registre sua menstruação para acompanhar as fases do ciclo e visualizar suas estimativas.</Text>
                <View style={estilos.acoesSemCiclo}>
                    <BotaoAcao texto="Cadastrar Menstruação" Icone={DropIcon} destaque pesoIcone="fill" aoPressionar={aoCadastrarMenstruacao} />
                    <BotaoAcao texto="Cadastrar no Diário" Icone={CalendarDotsIcon} aoPressionar={aoAbrirDiario} />
                    <BotaoAcao texto="Anticoncepcional" Icone={PillIcon} aoPressionar={aoAbrirAnticoncepcional} />
                </View>
            </View>
            <Text style={estilos.chamadaRecursos}>O QUE VOCÊ VAI ACOMPANHAR</Text>
            <View style={estilos.recursos}>
                {RECURSOS_SEM_CICLO.map(({ titulo, descricao, Icone }) => <View key={titulo} style={estilos.recurso}><View style={estilos.iconeRecurso}><Icone size={21} color="#C85A44" /></View><View style={estilos.textoRecurso}><Text style={estilos.tituloRecurso}>{titulo}</Text><Text style={estilos.descricaoRecurso}>{descricao}</Text></View></View>)}
            </View>
        </View>
    );
}

function CycleForecastPanel({ fase = 'desconhecida', diaCiclo, previsao, conteudoDaFase, aoCadastrarMenstruacao, aoAbrirDiario, aoAbrirAnticoncepcional }) {
    if (!previsao) return <EstadoSemCiclo aoCadastrarMenstruacao={aoCadastrarMenstruacao} aoAbrirDiario={aoAbrirDiario} aoAbrirAnticoncepcional={aoAbrirAnticoncepcional} />;
    return (
        <View style={estilos.conteudo}>
            <View style={estilos.heroiFase}><FormaProvisoria /><Text accessibilityRole="header" style={estilos.tituloFase}>{ROTULOS[fase]}</Text>{diaCiclo ? <Text style={estilos.diaCiclo}>Dia {diaCiclo} do ciclo</Text> : null}</View>
            <View style={estilos.acoes}>
                <BotaoAcao texto="Cadastrar Menstruação" Icone={DropIcon} destaque pesoIcone="fill" aoPressionar={aoCadastrarMenstruacao} />
                <BotaoAcao texto="Cadastrar no Diário" Icone={CalendarDotsIcon} aoPressionar={aoAbrirDiario} />
                <BotaoAcao texto="Anticoncepcional" Icone={PillIcon} aoPressionar={aoAbrirAnticoncepcional} />
            </View>
            <PainelPrevisao previsao={previsao} />
            <ConteudoFase conteudo={conteudoDaFase} />
        </View>
    );
}

export { AVISO_MEDICO, CycleForecastPanel };
