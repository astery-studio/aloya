import { Text, View } from 'react-native';
import { obterFrequencia, obterTipo } from '../constants/contraceptiveOptions';
import { ContraceptiveAlert } from './ContraceptiveAlert';
import { ScheduleList } from './ScheduleList';
import { estilos } from './contraceptives.styles';

function ContraceptiveCard({ anticoncepcional }) {
    const tipo = obterTipo(anticoncepcional.tipo)?.label ?? anticoncepcional.tipo;
    const programacao = anticoncepcional.programacao;
    const frequencia = programacao ? obterFrequencia(anticoncepcional.tipo, programacao.frequenciaId)?.label : null;
    return (
        <View style={estilos.card} accessibilityLabel={`${anticoncepcional.nome}, ${tipo}`}>
            <View style={estilos.cabecalhoCard}>
                <View style={estilos.titulosCard}><Text style={estilos.nome}>{anticoncepcional.nome}</Text><Text style={estilos.textoSecundario}>{tipo}</Text></View>
                <ContraceptiveAlert intensidade={anticoncepcional.intensidadeAlerta} />
            </View>
            {frequencia ? <Text style={estilos.frequencia}>{frequencia}</Text> : null}
            {programacao ? <ScheduleList horarios={programacao.horarios} /> : <Text style={estilos.frequencia}>Validade: {anticoncepcional.dataValidade}</Text>}
            {programacao?.horarios?.[0] ? <Text style={estilos.proximo}>Próximo uso previsto: {programacao.horarios[0]}</Text> : null}
        </View>
    );
}

export { ContraceptiveCard };
