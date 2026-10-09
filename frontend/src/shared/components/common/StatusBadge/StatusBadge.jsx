import { Text, View } from 'react-native';
import { ArrowsClockwiseIcon, WarningCircleIcon } from '../../icons/AppIcons';
import { estilos, variantes } from './StatusBadge.styles';

// Preserva a largura do Figma, limitada pelo espaço disponível, e permite crescer em altura.
// No Android, o padding tipográfico padrão também excedia as caixas de 15/17px.
function dimensoesFlexiveis(estilo) {
    return {
        width: estilo.width,
        height: 'auto',
        minHeight: estilo.height,
        maxWidth: '100%'
    };
}

function textoFlexivel(estilo) {
    return {
        width: 'auto',
        height: 'auto',
        minHeight: estilo.height,
        maxWidth: '100%',
        flexShrink: 1,
        includeFontPadding: false,
        textAlignVertical: 'center'
    };
}

const estados = Object.freeze({
    pendente: { rotulo: 'Pendente de Uso', variante: 'pendenteDeUso', ponto: true },
    pendenteDeUso: { rotulo: 'Pendente de Uso', variante: 'pendenteDeUso', ponto: true },
    alertaLeve: { rotulo: 'Alerta Leve', variante: 'alertaLeve', ponto: true },
    alertaModerado: { rotulo: 'Alerta Moderado', variante: 'alertaModerado', ponto: true },
    alertaCritico: { rotulo: 'Alerta Crítico', variante: 'alertaCritico', ponto: true },
    'alertaCrítico': { rotulo: 'Alerta Crítico', variante: 'alertaCritico', ponto: true },
    atrasado: { rotulo: 'Atrasado', variante: 'atrasadoProximosHorarios' },
    atrasadoProximosHorarios: { rotulo: 'Atrasado', variante: 'atrasadoProximosHorarios' },
    confirmado: { rotulo: 'Confirmado', variante: 'confirmado', ponto: true },
    confirmadoHistorico: { rotulo: 'Confirmado', variante: 'confirmadoHistoricoUso' },
    confirmadoHistoricoUso: { rotulo: 'Confirmado', variante: 'confirmadoHistoricoUso' },
    confirmadoForaDoPrazo: {
        rotulo: 'Confirmado fora do prazo',
        variante: 'confirmadoForaPrazoHistoricoUso'
    },
    confirmadoForaPrazoHistoricoUso: {
        rotulo: 'Confirmado fora do prazo',
        variante: 'confirmadoForaPrazoHistoricoUso'
    },
    naoConfirmado: { rotulo: 'Não confirmado', variante: 'naoConfirmadoHistoricoUso' },
    naoConfirmadoHistoricoUso: { rotulo: 'Não confirmado', variante: 'naoConfirmadoHistoricoUso' },
    validadeAindaPrazo: { rotulo: '30 meses restantes', variante: 'validadeAindaPrazo' },
    diasMenstruacao: {
        rotulo: '6 dias menstruação',
        variante: 'diasMenstruacao',
        composto: true
    },
    'diasMenstruação': {
        rotulo: '6 dias menstruação',
        variante: 'diasMenstruacao',
        composto: true
    },
    diasCiclo: {
        rotulo: '29 dias ciclo',
        variante: 'diasCiclo',
        iconeCiclo: true,
        composto: true
    },
    estimativaIncerta: {
        rotulo: 'Estimativa incerta',
        variante: 'estimativaIncerta',
        descricao: 'Os dados deste ciclo podem ser imprecisos.',
        estimativa: true
    },
    emAndamento: { rotulo: 'Em andamento', variante: 'confirmado', ponto: true }
});

// A correção pertence somente às variantes das HU-019/HU-023.
const variantesDeUso = new Set([
    'pendenteDeUso', 'alertaLeve', 'alertaModerado', 'alertaCritico',
    'atrasadoProximosHorarios', 'confirmado', 'confirmadoHistoricoUso',
    'confirmadoForaPrazoHistoricoUso', 'naoConfirmadoHistoricoUso', 'validadeAindaPrazo'
]);

function StatusBadge({ estado, rotulo }) {
    const configuracao = estados[estado];

    if (!configuracao) {
        throw new Error(`Estado de StatusBadge inválido: ${estado}`);
    }

    const visual = variantes[configuracao.variante];
    const texto = rotulo || configuracao.rotulo;
    const ajustarTextoDeUso = estado !== 'emAndamento' && variantesDeUso.has(configuracao.variante);
    const confirmadoNoHistorico = configuracao.variante === 'confirmadoHistoricoUso' && texto === 'Confirmado';

    if (configuracao.estimativa) {
        const acessibilidade = `${texto}. ${configuracao.descricao}`;

        return (
            <View
                accessible
                accessibilityRole="text"
                accessibilityLabel={acessibilidade}
                style={[estilos.container, visual.container]}
            >
                <WarningCircleIcon size={18} color={visual.texto.color} />
                <View style={estilos.conteudoEstimativa}>
                    <Text numberOfLines={1} style={estilos.tituloEstimativa}>{texto}</Text>
                    <Text numberOfLines={1} style={estilos.descricaoEstimativa}>
                        {configuracao.descricao}
                    </Text>
                </View>
            </View>
        );
    }

    const partes = configuracao.composto ? texto.split(' ') : [];
    const valor = partes.slice(0, 2).join(' ');
    const sufixo = partes.slice(2).join(' ');

    return (
        <View
            accessible
            accessibilityRole="text"
            accessibilityLabel={texto}
            style={[estilos.container, visual.container, ajustarTextoDeUso && dimensoesFlexiveis(visual.container), confirmadoNoHistorico && { width: 'auto', minWidth: visual.container.width }]}
        >
            {configuracao.iconeCiclo ? (
                <ArrowsClockwiseIcon size={13} color={visual.texto.color} />
            ) : null}
            {configuracao.ponto ? (
                <Text style={[estilos.ponto, { color: visual.texto.color }, ajustarTextoDeUso && { includeFontPadding: false }]}>●</Text>
            ) : null}
            <Text numberOfLines={confirmadoNoHistorico || !ajustarTextoDeUso ? 1 : undefined} style={[estilos.texto, visual.texto, ajustarTextoDeUso && textoFlexivel(visual.texto), confirmadoNoHistorico && { flexShrink: 0 }]}>{valor || texto}</Text>
            {sufixo ? (
                <Text numberOfLines={1} style={[estilos.texto, visual.sufixo]}>{sufixo}</Text>
            ) : null}
        </View>
    );
}

export { StatusBadge };
