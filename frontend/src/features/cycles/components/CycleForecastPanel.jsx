import { Text, View } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { formatarDataLonga } from '../utils/cyclePresentation';
import { estilos } from './CycleForecastPanel.styles';

const AVISO_MEDICO = 'Esta é uma estimativa baseada no seu histórico e não substitui orientação médica nem garante eficácia como método contraceptivo.';
const ROTULOS = { menstrual: 'Fase Menstrual', folicular: 'Fase Folicular', ovulatoria: 'Fase Ovulatória', lutea: 'Fase Lútea', desconhecida: 'Seu ciclo' };
const SIMBOLOS_FASE = { menstrual: '●', folicular: '○', ovulatoria: '✦', lutea: '◐', desconhecida: '?' };

function CartaoPrevisao({ rotulo, valor, children }) {
    return <View style={estilos.cartao}><Text style={estilos.rotulo}>{rotulo}</Text><Text style={estilos.valor}>{valor}</Text>{children}</View>;
}

function CycleForecastPanel({ fase = 'desconhecida', diaCiclo, previsao, conteudoDaFase, aoCadastrarMenstruacao, aoAbrirDiario }) {
    if (!previsao) {
        return <View style={estilos.conteudo}><View style={estilos.simbolo}><Text style={estilos.simboloTexto}>?</Text></View><Text style={estilos.titulo}>Conheça seu ciclo</Text><Text style={estilos.descricao}>Registre sua menstruação e descubra padrões, previsões e informações sobre cada fase.</Text><ButtonScreen texto="Cadastrar Menstruação" variante="preto" aoPressionar={aoCadastrarMenstruacao} /></View>;
    }

    const nivel = previsao.confiabilidadeMenstrual?.nivel?.toLowerCase() || 'baixa';
    const janela = previsao.janelaFertilEstimada;
    const incerta = previsao.status === 'PARCIALMENTE_DISPONIVEL';
    return (
        <View style={estilos.conteudo}>
            <View style={[estilos.simbolo, estilos[`simbolo_${fase}`]]}><Text style={estilos.simboloTexto}>{SIMBOLOS_FASE[fase]}</Text></View>
            <Text accessibilityRole="header" style={estilos.titulo}>{ROTULOS[fase]}</Text>
            {diaCiclo ? <Text style={estilos.diaCiclo}>Dia {diaCiclo} do ciclo</Text> : null}
            <View style={estilos.acoes}><ButtonScreen texto="Cadastrar Menstruação" variante="preto" aoPressionar={aoCadastrarMenstruacao} /><ButtonScreen texto="Cadastrar no Diário" variante="branco" aoPressionar={aoAbrirDiario} /></View>
            <View style={estilos.previsoes}>
                <CartaoPrevisao rotulo="Próximo ciclo" valor={formatarDataLonga(previsao.proximoInicioEstimado)}>
                    <View style={[estilos.confianca, estilos[`confianca_${nivel}`]]}><Text style={estilos.confiancaTexto}>Confiabilidade: {nivel}</Text></View>
                    {nivel === 'baixa' ? <Text style={estilos.incentivo}>Continue registrando seus ciclos para que suas previsões fiquem cada vez mais precisas.</Text> : null}
                    {incerta ? <Text style={estilos.alerta}>Estimativa incerta para este ciclo</Text> : null}
                </CartaoPrevisao>
                <CartaoPrevisao rotulo="Ovulação" valor={formatarDataLonga(previsao.dataOvulacaoEstimada)} />
                <CartaoPrevisao rotulo="Janela fértil" valor={janela ? `${formatarDataLonga(janela.inicio)} até ${formatarDataLonga(janela.fim)}` : 'Indisponível para este ciclo'} />
                <Text style={estilos.aviso}>{AVISO_MEDICO}</Text>
            </View>
            {conteudoDaFase ? <View style={estilos.explicacao}><Text style={estilos.subtitulo}>Sobre sua fase</Text><Text style={estilos.descricao}>{conteudoDaFase.descricao}</Text><Text style={estilos.subtitulo}>Sintomas comuns</Text>{conteudoDaFase.sintomas.map((item) => <Text key={item} style={estilos.item}>• {item}</Text>)}</View> : null}
        </View>
    );
}

export { AVISO_MEDICO, CycleForecastPanel, SIMBOLOS_FASE };
