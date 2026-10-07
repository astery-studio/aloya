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
const CORES_FASE = { menstrual: '#C85A44', folicular: '#3B7150', ovulatoria: '#4A758E', lutea: '#D68C3A', desconhecida: '#5C5C59' };
const CORES_CONFIANCA = { baixa: '#C85A44', media: '#D68C3A', alta: '#2C4C3B' };
const RECURSOS_SEM_CICLO = [
    { titulo: 'Fases do ciclo', descricao: 'Menstrual, folicular, ovulatória e lútea com orientações personalizadas.', Icone: ArrowsClockwiseIcon, cor: '#2C4C3B' },
    { titulo: 'Janela fértil', descricao: 'Saiba seus dias de maior fertilidade com previsões personalizadas.', Icone: SparkleIcon, cor: '#D68C3A' },
    { titulo: 'Próxima menstruação', descricao: 'Estimativa da data do seu próximo ciclo, ficando mais precisa com o tempo.', Icone: CalendarDotsIcon, cor: '#D68C3A' },
    { titulo: 'Sintomas e bem-estar', descricao: 'Registre como você se sente e descubra padrões ao longo do ciclo.', Icone: HeartbeatIcon, cor: '#2C4C3B' }
];

function BotaoAcao({ texto, Icone, destaque = false, pesoIcone = 'regular', aoPressionar }) {
    return (
        <Pressable accessibilityRole="button" accessibilityLabel={texto} onPress={aoPressionar} style={[estilos.botaoAcao, destaque ? estilos.botaoPrimario : estilos.botaoSecundario]}>
            <Icone size={20} color={destaque ? '#FDF6F3' : '#FFFFFF'} weight={pesoIcone} />
            <Text style={[estilos.textoBotao, destaque && estilos.textoBotaoDestaque]}>{texto}</Text>
        </Pressable>
    );
}

function FormaProvisoria({ fase = 'desconhecida', compacta = false }) {
    const comContorno = fase === 'folicular' || fase === 'ovulatoria';
    const cor = CORES_FASE[fase];
    return (
        <View accessibilityLabel="Símbolo provisório da fase" style={[estilos.formaProvisoria, compacta && estilos.formaProvisoriaCompacta]}>
            {comContorno ? <View style={[estilos.formaInterna, compacta && estilos.formaInternaCompacta, { borderColor: cor }]} /> : null}
            <View style={[estilos.sombraForma, compacta && estilos.sombraFormaCompacta, { backgroundColor: cor }]} />
        </View>
    );
}

function SeloConfiabilidade({ nivel }) {
    const barrasAtivas = nivel === 'alta' ? 3 : nivel === 'media' ? 2 : 1;
    return (
        <View style={[estilos.seloConfiabilidade, estilos[`selo_${nivel}`]]}>
            <View style={estilos.seloCabecalho}>
                <ChartBarIcon size={15} color={CORES_CONFIANCA[nivel]} weight="bold" />
                <Text style={[estilos.seloRotulo, estilos[`cor_${nivel}`]]}>Confiabilidade</Text>
            </View>
            <View style={estilos.seloResultado}>
                <View style={estilos.barrasConfiabilidade}>
                    {[5, 9, 12].map((altura, indice) => <View key={altura} style={[estilos.barraConfiabilidade, { height: altura }, indice < barrasAtivas ? estilos[`barra_${nivel}`] : estilos.barraInativa]} />)}
                </View>
                <Text style={[estilos.seloNivel, estilos[`cor_${nivel}`]]}>{nivel}</Text>
            </View>
        </View>
    );
}

function PainelPrevisao({ previsao }) {
    const nivel = previsao.confiabilidadeMenstrual?.nivel?.toLowerCase() || 'baixa';
    const janela = previsao.janelaFertilEstimada;
    const incerta = previsao.status === 'PARCIALMENTE_DISPONIVEL';

    return (
        <View style={estilos.secaoPrevisao}>
            <View style={[estilos.cartaoProximoCiclo, (incerta || nivel === 'baixa') && estilos.cartaoProximoCicloComAviso]}>
                <View style={estilos.dataProximoCiclo}>
                    <Text style={estilos.rotuloPrevisao}>Próximo ciclo</Text>
                    <Text style={estilos.valorPrincipal}>{formatarDataLonga(previsao.proximoInicioEstimado)}</Text>
                </View>
                <SeloConfiabilidade nivel={nivel} />
                {incerta ? (
                    <View style={estilos.avisoConfiabilidade}>
                        <WarningIcon size={18} color="#D68C3A" />
                        <View style={estilos.textosAvisoConfiabilidade}>
                            <Text style={estilos.tituloAvisoConfiabilidade}>Estimativa incerta</Text>
                            <Text style={estilos.textoAvisoConfiabilidade}>Os dados deste ciclo podem ser imprecisos.</Text>
                        </View>
                    </View>
                ) : null}
                {!incerta && nivel === 'baixa' ? (
                    <View style={estilos.avisoConfiabilidade}>
                        <WarningIcon size={18} color="#D68C3A" />
                        <Text style={estilos.textoAvisoBaixa}>Continue registrando seus ciclos para que suas previsões fiquem cada vez mais precisas.</Text>
                    </View>
                ) : null}
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
