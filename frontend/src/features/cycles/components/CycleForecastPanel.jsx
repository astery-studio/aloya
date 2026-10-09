import { Text, View } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { ConfidenceBadge } from '../../../shared/components/common/ConfidenceBadge/ConfidenceBadge';
import { EmptyState } from '../../../shared/components/feedback/EmptyState/EmptyState';
import {
    ArrowsClockwiseIcon,
    CalendarDotsIcon,
    DropIcon,
    HeartbeatIcon,
    NotepadIcon,
    PillIcon,
    SparkleIcon,
    SunIcon,
    WarningCircleIcon,
    WarningIcon
} from '../../../shared/components/icons/AppIcons';
import { cores } from '../../../shared/theme';
import { formatarDataLonga } from '../utils/cyclePresentation';
import { estilos } from './CycleForecastPanel.styles';

const AVISO_MEDICO = 'Esta é uma estimativa baseada no seu histórico e não substitui orientação médica nem garante eficácia como método contraceptivo.';
const ROTULOS = { menstrual: 'Fase Menstrual', folicular: 'Fase Folicular', ovulatoria: 'Fase Ovulatória', lutea: 'Fase Lútea', desconhecida: 'Seu ciclo' };
const CORES_FORMA = { menstrual: cores.marca.primaria, folicular: cores.ciclo.formaFolicular, ovulatoria: cores.feedback.informacao, lutea: cores.feedback.aviso, desconhecida: cores.neutras.textoSecundarioClaro };
const CORES_CONTEUDO = { ...CORES_FORMA, folicular: cores.ciclo.conteudoFolicular };
const RECURSOS_SEM_CICLO = [
    { titulo: 'Fases do ciclo', descricao: 'Menstrual, folicular, ovulatória e lútea com orientações para cada momento.', Icone: ArrowsClockwiseIcon, cor: cores.marca.secundaria },
    { titulo: 'Janela fértil', descricao: 'Saiba seus dias de maior fertilidade com previsões baseadas no seu histórico.', Icone: SparkleIcon, cor: cores.feedback.aviso, peso: 'fill' },
    { titulo: 'Próxima menstruação', descricao: 'Estimativa da data do seu próximo ciclo, ficando mais precisa com o tempo.', Icone: CalendarDotsIcon, cor: cores.feedback.aviso },
    { titulo: 'Sintomas e bem-estar', descricao: 'Registre como você se sente e descubra padrões ao longo do ciclo.', Icone: HeartbeatIcon, cor: cores.marca.secundaria }
];

function BotaoAcao({ texto, Icone, destaque = false, aoPressionar }) {
    return (
        <ButtonScreen
            texto={texto}
            icone={Icone}
            variante={destaque ? 'laranja' : 'verde'}
            aoPressionar={aoPressionar}
            rotuloAcessibilidade={texto}
            estilo={estilos.botaoAcao}
        />
    );
}

function GotaPreenchidaIcon(props) {
    return <DropIcon {...props} weight="fill" />;
}

function FormaProvisoria({ fase = 'desconhecida', compacta = false }) {
    const comContorno = fase === 'folicular' || fase === 'ovulatoria';
    const cor = CORES_FORMA[fase];
    return (
        <View accessibilityLabel={`Símbolo provisório: ${ROTULOS[fase]}`} style={[estilos.formaProvisoria, compacta && estilos.formaProvisoriaCompacta]}>
            {comContorno ? <View style={[estilos.formaInterna, { borderColor: cor }]} /> : null}
            {fase === 'ovulatoria' ? <View style={[estilos.orbitaForma, estilos.orbitaFormaEsquerda, { borderColor: cor }]} /> : null}
            {fase === 'ovulatoria' ? <View style={[estilos.orbitaForma, estilos.orbitaFormaDireita, { borderColor: cor }]} /> : null}
            <View style={[estilos.sombraForma, compacta && estilos.sombraFormaCompacta, { backgroundColor: cor }]} />
        </View>
    );
}

function PainelPrevisao({ previsao, janelaFertil }) {
    const nivel = previsao.confiabilidadeMenstrual?.nivel?.toLowerCase() || 'baixa';
    const janela = janelaFertil ?? previsao.janelaFertilEstimada;
    const incerta = previsao.status === 'PARCIALMENTE_DISPONIVEL';

    return (
        <View style={estilos.secaoPrevisao}>
            <View style={[estilos.cartaoProximoCiclo, (incerta || nivel === 'baixa') && estilos.cartaoProximoCicloComAviso]}>
                <View style={estilos.dataProximoCiclo}>
                    <Text style={estilos.rotuloPrevisao}>Próximo ciclo</Text>
                    <Text style={estilos.valorPrincipal}>{formatarDataLonga(previsao.proximoInicioEstimado)}</Text>
                </View>
                <ConfidenceBadge nivel={nivel} variante="composta" />
                {incerta ? (
                    <View style={estilos.avisoConfiabilidade}>
                        <WarningIcon size={18} color={cores.feedback.aviso} />
                        <View style={estilos.textosAvisoConfiabilidade}>
                            <Text style={estilos.tituloAvisoConfiabilidade}>Estimativa incerta</Text>
                            <Text style={estilos.textoAvisoConfiabilidade}>Os dados deste ciclo podem ser imprecisos.</Text>
                        </View>
                    </View>
                ) : null}
                {!incerta && nivel === 'baixa' ? (
                    <View style={estilos.avisoConfiabilidade}>
                        <WarningCircleIcon size={18} color={cores.feedback.aviso} weight="fill" />
                        <Text style={estilos.textoAvisoBaixa}>Continue registrando seus ciclos para que suas previsões fiquem cada vez mais precisas.</Text>
                    </View>
                ) : null}
            </View>
            <View style={estilos.previsoesSecundarias}>
                <View style={estilos.cartaoSecundario}>
                    <View style={estilos.cabecalhoCartaoSecundario}>
                        <SunIcon size={18} color={cores.feedback.informacao} weight="fill" />
                        <Text style={estilos.rotuloPrevisaoSecundaria}>Ovulação</Text>
                    </View>
                    <Text style={estilos.valorOvulacao}>{formatarDataLonga(previsao.dataOvulacaoEstimada)}</Text>
                </View>
                <View style={estilos.cartaoSecundario}>
                    <View style={estilos.cabecalhoCartaoSecundario}>
                        <SparkleIcon size={18} color={cores.ciclo.iconeEscuro} weight="fill" />
                        <Text style={estilos.rotuloPrevisaoSecundaria}>Janela fértil</Text>
                    </View>
                    <Text style={estilos.valorSecundario}>{janela ? `${formatarDataLonga(janela.inicio)} até ${formatarDataLonga(janela.fim)}` : 'Indisponível'}</Text>
                </View>
            </View>
            <Text style={estilos.aviso}>{AVISO_MEDICO}</Text>
        </View>
    );
}

function ConteudoFase({ conteudo, fase }) {
    if (!conteudo) return null;
    const cor = CORES_CONTEUDO[fase];
    return (
        <View>
            <View style={estilos.secaoTexto}>
                <Text style={estilos.tituloSecao}>{conteudo.tituloExplicacao}</Text>
                <View style={estilos.textoComMarcador}><View style={[estilos.marcador, { backgroundColor: cor }]} /><Text style={estilos.descricaoFase}>{conteudo.descricao}</Text></View>
            </View>
            <View style={estilos.secaoSintomas}>
                <Text style={estilos.tituloSecao}>Sintomas comuns</Text>
                <View style={estilos.listaSintomas}>
                    {conteudo.sintomas.map((sintoma) => <View key={sintoma} style={estilos.sintoma}><View style={[estilos.marcadorSintoma, { backgroundColor: cor }]} /><Text style={estilos.textoSintoma}>{sintoma}</Text></View>)}
                </View>
            </View>
            <View style={estilos.secaoDicas}>
                <Text style={estilos.tituloSecao}>Dicas para hoje</Text>
                {conteudo.dicas.map((dica, indice) => <View key={dica} style={estilos.dica}><View style={estilos.numeroDica}><Text style={[estilos.textoNumeroDica, { color: cor }]}>{indice + 1}</Text></View><Text style={estilos.textoDica}>{dica}</Text></View>)}
            </View>
        </View>
    );
}

function EstadoSemCiclo({ aoCadastrarMenstruacao, aoAbrirDiario, aoAbrirAnticoncepcional }) {
    return (
        <View style={estilos.estadoSemCiclo}>
            <View style={estilos.cartaoIntroducao}>
                <FormaProvisoria compacta />
                <EmptyState
                    variante="apresentacao"
                    titulo="Conheça seu ciclo"
                    mensagem="Registre sua menstruação e descubra padrões, previsões e insights personalizados sobre o seu corpo."
                    acao={(
                        <View style={estilos.acoesSemCiclo}>
                            <BotaoAcao texto="Cadastrar Menstruação" Icone={GotaPreenchidaIcon} destaque aoPressionar={aoCadastrarMenstruacao} />
                            <BotaoAcao texto="Cadastrar no Diário" Icone={NotepadIcon} aoPressionar={aoAbrirDiario} />
                            <BotaoAcao texto="Anticoncepcional" Icone={PillIcon} aoPressionar={aoAbrirAnticoncepcional} />
                        </View>
                    )}
                />
            </View>
            <Text style={estilos.chamadaRecursos}>O QUE VOCÊ VAI ACOMPANHAR</Text>
            <View style={estilos.recursos}>
                {RECURSOS_SEM_CICLO.map(({ titulo, descricao, Icone, cor, peso = 'regular' }) => <View key={titulo} style={estilos.recurso}><View style={estilos.iconeRecurso}><Icone size={20} color={cor} weight={peso} /></View><View style={estilos.textoRecurso}><Text style={estilos.tituloRecurso}>{titulo}</Text><Text style={estilos.descricaoRecurso}>{descricao}</Text></View></View>)}
            </View>
        </View>
    );
}

function CycleForecastPanel({ fase = 'desconhecida', diaCiclo, janelaFertil, previsao, conteudoDaFase, aoCadastrarMenstruacao, aoAbrirDiario, aoAbrirAnticoncepcional }) {
    if (!previsao) return <EstadoSemCiclo aoCadastrarMenstruacao={aoCadastrarMenstruacao} aoAbrirDiario={aoAbrirDiario} aoAbrirAnticoncepcional={aoAbrirAnticoncepcional} />;
    const faseAtual = Object.hasOwn(ROTULOS, fase) ? fase : 'desconhecida';
    return (
        <View style={estilos.conteudo}>
            <View style={[estilos.heroiFase, (faseAtual === 'folicular' || faseAtual === 'ovulatoria') && estilos.heroiFaseFertil]}>
                <FormaProvisoria fase={faseAtual} />
                <Text accessibilityRole="header" style={estilos.tituloFase}>{ROTULOS[faseAtual]}</Text>
                {diaCiclo ? <Text style={estilos.diaCiclo}>Dia {diaCiclo} do ciclo</Text> : null}
                {faseAtual === 'folicular' || faseAtual === 'ovulatoria' ? (
                    <View style={[estilos.destaqueFertil, { borderColor: CORES_FORMA[faseAtual] }]}>
                        <View style={estilos.iconeDestaqueFertil}><SparkleIcon size={22} color={CORES_FORMA[faseAtual]} weight="fill" /></View>
                        <View><Text style={estilos.tituloDestaqueFertil}>Janela fértil</Text><Text style={estilos.textoDestaqueFertil}>Você está na janela fértil.</Text></View>
                    </View>
                ) : null}
            </View>
            <View style={estilos.acoes}>
                <BotaoAcao texto="Cadastrar Menstruação" Icone={GotaPreenchidaIcon} destaque aoPressionar={aoCadastrarMenstruacao} />
                <BotaoAcao texto="Cadastrar no Diário" Icone={NotepadIcon} aoPressionar={aoAbrirDiario} />
                <BotaoAcao texto="Anticoncepcional" Icone={PillIcon} aoPressionar={aoAbrirAnticoncepcional} />
            </View>
            <PainelPrevisao previsao={previsao} janelaFertil={janelaFertil} />
            <ConteudoFase conteudo={conteudoDaFase} fase={faseAtual} />
        </View>
    );
}

export { AVISO_MEDICO, CycleForecastPanel };
