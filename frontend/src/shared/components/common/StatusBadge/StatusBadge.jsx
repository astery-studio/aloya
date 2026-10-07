import { Text, View } from 'react-native';
import { ArrowsClockwiseIcon } from '../../icons/AppIcons';
import { estilos, variantes } from './StatusBadge.styles';

const estados = Object.freeze({
    pendente: { rotulo: 'Pendente de uso', variante: 'aviso', ponto: true },
    pendenteDeUso: { rotulo: 'Pendente de uso', variante: 'aviso', ponto: true },
    alertaLeve: { rotulo: 'Alerta leve', variante: 'informacao', ponto: true },
    alertaModerado: { rotulo: 'Alerta moderado', variante: 'informacao', ponto: true },
    alertaCritico: { rotulo: 'Alerta crítico', variante: 'informacao', ponto: true },
    atrasado: { rotulo: 'Atrasado', variante: 'atrasado' },
    atrasadoProximosHorarios: { rotulo: 'Atrasado', variante: 'atrasado' },
    confirmado: { rotulo: 'Confirmado', variante: 'sucesso', ponto: true },
    confirmadoHistorico: { rotulo: 'Confirmado', variante: 'sucessoCompacto' },
    confirmadoForaDoPrazo: { rotulo: 'Confirmado fora do prazo', variante: 'foraDoPrazo' },
    confirmadoForaPrazoHistoricoUso: { rotulo: 'Confirmado fora do prazo', variante: 'foraDoPrazo' },
    naoConfirmado: { rotulo: 'Não confirmado', variante: 'neutro' },
    naoConfirmadoHistoricoUso: { rotulo: 'Não confirmado', variante: 'neutro' },
    validadeAindaPrazo: { rotulo: '30 meses restantes', variante: 'validade' },
    diasMenstruacao: { rotulo: '6 dias menstruação', variante: 'menstruacao', composto: true },
    diasCiclo: { rotulo: '29 dias ciclo', variante: 'ciclo', icone: true, composto: true },
    emAndamento: { rotulo: 'Em andamento', variante: 'sucesso', ponto: true }
});

function StatusBadge({ estado, rotulo }) {
    const configuracao = estados[estado];

    if (!configuracao) {
        throw new Error(`Estado de StatusBadge inválido: ${estado}`);
    }

    const visual = variantes[configuracao.variante];
    const texto = rotulo || configuracao.rotulo;
    const partes = configuracao.composto ? texto.split(' ') : [];
    const valor = partes.slice(0, 2).join(' ');
    const sufixo = partes.slice(2).join(' ');

    return (
        <View
            accessible
            accessibilityRole="text"
            accessibilityLabel={texto}
            style={[estilos.container, visual.container]}
        >
            {configuracao.icone ? <ArrowsClockwiseIcon size={13} color={visual.texto.color} /> : null}
            {configuracao.ponto ? <View style={[estilos.ponto, { backgroundColor: visual.texto.color }]} /> : null}
            <Text numberOfLines={1} style={[estilos.texto, visual.texto]}>{valor || texto}</Text>
            {sufixo ? <Text numberOfLines={1} style={[estilos.texto, visual.sufixo]}>{sufixo}</Text> : null}
        </View>
    );
}

export { StatusBadge };
