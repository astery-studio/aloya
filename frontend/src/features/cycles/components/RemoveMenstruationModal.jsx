import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { CycleCalendar } from '../../calendar/components/CycleCalendar/CycleCalendar';

const estilos = Object.freeze({
    fundo: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.45)'
    },
    painel: { maxHeight: '92%', borderRadius: 20, padding: 24, backgroundColor: '#FFFFFF' },
    titulo: { fontSize: 20, fontWeight: '700', color: '#222222', marginBottom: 12 },
    texto: { fontSize: 16, lineHeight: 24, color: '#5C5C59', marginBottom: 12 },
    aviso: { fontSize: 14, lineHeight: 20, color: '#8D3C30', marginBottom: 16 },
    erro: { fontSize: 14, lineHeight: 20, color: '#B23B36', marginBottom: 12 },
    sucesso: { fontSize: 14, lineHeight: 20, color: '#2C4C3B', marginBottom: 12 },
    acoes: { gap: 10, marginTop: 16 },
    botao: {
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingHorizontal: 16
    },
    botaoExcluir: { backgroundColor: '#C85A44' },
    botaoCancelar: { backgroundColor: '#F7F5F0', borderWidth: 1, borderColor: '#A8A49C' },
    textoBotao: { fontSize: 16, fontWeight: '600', color: '#222222' },
    textoBotaoExcluir: { color: '#FFFFFF' }
});

function obterPeriodo(ciclo) {
    if (typeof ciclo?.periodo === 'string' && ciclo.periodo.trim()) {
        return ciclo.periodo.trim();
    }

    if (typeof ciclo?.dataInicio === 'string') {
        const fim = typeof ciclo.dataFim === 'string' ? ciclo.dataFim : 'em andamento';
        return `${ciclo.dataInicio} até ${fim}`;
    }

    return 'Período não informado';
}

function Acao({
    texto,
    aoPressionar,
    primaria = false,
    desativada,
    carregando = false,
    rotuloAcessibilidade
}) {
    const estiloBotao = primaria ? estilos.botaoExcluir : estilos.botaoCancelar;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={rotuloAcessibilidade || texto}
            accessibilityState={{ disabled: desativada || carregando, busy: carregando }}
            disabled={desativada || carregando}
            onPress={aoPressionar}
            style={[estilos.botao, estiloBotao, (desativada || carregando) && { opacity: 0.55 }]}
        >
            <Text style={[estilos.textoBotao, primaria && estilos.textoBotaoExcluir]}>
                {carregando ? 'Excluindo...' : texto}
            </Text>
        </Pressable>
    );
}

function RemoveMenstruationModal({
    modo,
    visivel,
    meses = [],
    ciclo,
    carregando = false,
    erro,
    erroAtualizacao,
    sucesso,
    onRemoverDia,
    onExcluirCiclo,
    onFechar
}) {
    if (!['dia', 'cicloCompleto'].includes(modo)) {
        throw new TypeError('O modo de remoção da menstruação é inválido.');
    }

    if (!visivel) return null;

    const removendoDia = modo === 'dia';
    const fechar = carregando ? undefined : onFechar;

    return (
        <Modal transparent animationType="fade" visible onRequestClose={fechar}>
            <View style={estilos.fundo}>
                <View accessibilityViewIsModal style={estilos.painel}>
                    {removendoDia ? (
                        <>
                            <Text accessibilityRole="header" style={estilos.titulo}>
                                Remover dia de menstruação
                            </Text>
                            <Text style={estilos.texto}>
                                Toque em um dia registrado para removê-lo. A remoção do dia é
                                imediata e não pede confirmação.
                            </Text>
                            {erro ? (
                                <Text accessibilityRole="alert" style={estilos.erro}>
                                    {erro}
                                </Text>
                            ) : null}
                            {erroAtualizacao ? (
                                <Text accessibilityRole="alert" style={estilos.erro}>
                                    {erroAtualizacao}
                                </Text>
                            ) : null}
                            {sucesso ? (
                                <Text accessibilityRole="status" style={estilos.sucesso}>
                                    {sucesso}
                                </Text>
                            ) : null}
                            <View style={{ height: 360 }}>
                                <CycleCalendar
                                    meses={meses}
                                    aoPressionarDia={carregando ? undefined : onRemoverDia}
                                />
                            </View>
                            <View style={estilos.acoes}>
                                <Acao texto="Cancelar" aoPressionar={fechar} desativada={!fechar} />
                            </View>
                        </>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text accessibilityRole="header" style={estilos.titulo}>
                                Excluir ciclo
                            </Text>
                            <>
                                <Text style={estilos.texto}>
                                    O período {obterPeriodo(ciclo)} será excluído.
                                </Text>
                                <Text style={estilos.aviso}>
                                    Esta ação não pode ser desfeita. Suas previsões serão
                                    recalculadas.
                                </Text>
                                {erro ? (
                                    <Text accessibilityRole="alert" style={estilos.erro}>
                                        {erro}
                                    </Text>
                                ) : null}
                                {erroAtualizacao ? (
                                    <Text accessibilityRole="alert" style={estilos.erro}>
                                        {erroAtualizacao}
                                    </Text>
                                ) : null}
                                {sucesso ? (
                                    <Text accessibilityRole="status" style={estilos.sucesso}>
                                        {sucesso}
                                    </Text>
                                ) : null}
                            </>
                            <View style={estilos.acoes}>
                                <Acao
                                    texto="Excluir"
                                    primaria
                                    carregando={carregando}
                                    desativada={!ciclo || typeof onExcluirCiclo !== 'function'}
                                    aoPressionar={() => onExcluirCiclo?.(ciclo)}
                                />
                                <Acao texto="Cancelar" aoPressionar={fechar} desativada={!fechar} />
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}

export { RemoveMenstruationModal, obterPeriodo };
