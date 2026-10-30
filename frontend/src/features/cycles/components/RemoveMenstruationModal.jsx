import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BottomSheet } from '../../../shared/components/feedback/BottomSheet/BottomSheet';
import { BottomSheetLayout } from '../../../shared/layouts/BottomSheet/BottomSheetLayout';
import { CycleRemovalFeedbackModal } from './CycleRemovalFeedbackModal';
import { MenstrualDaysCalendar } from './MenstrualDaysCalendar';
import { obterHojeLocal } from '../../calendar/utils/cycleCalendar.utils';
import { estilos } from './RemoveMenstruationModal.styles';

function formatarData(data) {
    if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return 'data não informada';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function obterPeriodo(ciclo) {
    if (!ciclo?.dataInicio) return 'Período não informado';
    return `${formatarData(ciclo.dataInicio)} a ${formatarData(ciclo.dataFim || obterHojeLocal())}`;
}

function Botao({ texto, primaria, grande = false, desativado, onPress }) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={texto}
            accessibilityState={{ disabled: Boolean(desativado) }}
            disabled={desativado}
            onPress={onPress}
            style={[
                estilos.botao,
                primaria ? estilos.botaoPrimario : estilos.botaoSecundario,
                grande && estilos.botaoGrande,
                desativado && estilos.desativado
            ]}
        >
            <Text style={[estilos.textoBotao, primaria && estilos.textoBotaoPrimario]}>
                {texto}
            </Text>
        </Pressable>
    );
}

function RemoveMenstruationModal({
    modo = 'dia',
    visivel,
    ciclo,
    meses = [],
    dataSelecionada,
    carregandoMeses = false,
    erroMeses,
    carregando = false,
    diasAlterados = false,
    alerta,
    onRemoverDia,
    onExcluirCiclo,
    onSolicitarExcluirCiclo,
    onFechar,
    onCancelarExclusao,
    onTentarNovamente,
    onFecharAlerta,
    onConcluir
}) {
    const [larguraCalendario, setLarguraCalendario] = useState(312);
    const tipoSolicitado = alerta || (modo === 'cicloCompleto' ? 'confirmacao' : null);
    const [tipoAlerta, setTipoAlerta] = useState(tipoSolicitado);
    const [superficie, setSuperficie] = useState(() =>
        tipoSolicitado ? 'feedback' : visivel ? 'sheet' : 'oculto'
    );

    useEffect(() => {
        if (superficie === 'sheet' && (!visivel || tipoSolicitado)) {
            setSuperficie('fechando-sheet');
        } else if (superficie === 'feedback') {
            if (!tipoSolicitado) setSuperficie('fechando-feedback');
            else setTipoAlerta(tipoSolicitado);
        } else if (superficie === 'oculto') {
            if (tipoSolicitado) {
                setTipoAlerta(tipoSolicitado);
                setSuperficie('feedback');
            } else if (visivel) setSuperficie('sheet');
        }
    }, [superficie, tipoSolicitado, visivel]);
    const feedbackProps = {
        visivel: superficie === 'feedback',
        onOcultar: () =>
            setSuperficie((atual) => (atual === 'fechando-feedback' ? 'oculto' : atual))
    };

    if (!['dia', 'cicloCompleto'].includes(modo))
        throw new TypeError('O modo de remoção da menstruação é inválido.');
    let modalAlerta = null;

    if (tipoAlerta === 'confirmacao') {
        modalAlerta = (
            <CycleRemovalFeedbackModal
                {...feedbackProps}
                tipo="confirmacao"
                periodo={obterPeriodo(ciclo)}
                carregando={carregando}
                onConfirmar={onExcluirCiclo}
                onCancelar={onCancelarExclusao}
            />
        );
    } else if (tipoAlerta === 'erro') {
        modalAlerta = (
            <CycleRemovalFeedbackModal
                {...feedbackProps}
                tipo="erro"
                carregando={carregando}
                onTentarNovamente={onTentarNovamente}
                onFechar={onFecharAlerta}
            />
        );
    } else if (tipoAlerta === 'sucesso-excluir' || tipoAlerta === 'sucesso-atualizar') {
        modalAlerta = (
            <CycleRemovalFeedbackModal
                {...feedbackProps}
                tipo={tipoAlerta}
                onFechar={onFecharAlerta}
            />
        );
    }

    return (
        <>
            <BottomSheet
                visivel={superficie === 'sheet'}
                onOcultar={() =>
                    setSuperficie((atual) => (atual === 'fechando-sheet' ? 'oculto' : atual))
                }
                onFechar={carregando ? undefined : onFechar}
                bloquearFechamento={carregando}
            >
                <BottomSheetLayout
                    titulo="Remover Menstruação"
                    onFechar={onFechar}
                    bloquearFechamento={carregando}
                    compacto
                >
                    <ScrollView
                        style={estilos.conteudoRolavel}
                        contentContainerStyle={estilos.conteudoRolavelInterno}
                        showsVerticalScrollIndicator={false}
                        accessibilityHint={
                            dataSelecionada ? `Dia selecionado: ${dataSelecionada}` : undefined
                        }
                    >
                        <View>
                            <Text style={estilos.instrucao}>
                                Toque em um dia preenchido para desmarcá-lo.
                            </Text>
                            <View
                                style={estilos.calendario}
                                onLayout={(evento) => {
                                    const largura = evento.nativeEvent.layout.width - 30;
                                    if (largura > 0) {
                                        setLarguraCalendario(largura);
                                    }
                                }}
                            >
                                {erroMeses ? (
                                    <Text accessibilityRole="alert" style={estilos.erro}>
                                        {erroMeses}
                                    </Text>
                                ) : (
                                    <MenstrualDaysCalendar
                                        meses={meses}
                                        desativado={carregando || carregandoMeses}
                                        carregando={carregandoMeses}
                                        aoPressionarDia={onRemoverDia}
                                        larguraMes={larguraCalendario}
                                    />
                                )}
                            </View>
                            <View style={estilos.aviso}>
                                <Text style={estilos.avisoIcone}>ⓘ</Text>
                                <Text style={estilos.avisoTexto}>
                                    A remoção é imediata e altera somente o dia escolhido.
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                    <View style={estilos.rodape}>
                        <Botao
                            texto="Concluir"
                            primaria={diasAlterados}
                            desativado={carregando || carregandoMeses}
                            onPress={onConcluir}
                        />
                        <Botao
                            texto="Excluir ciclo inteiro"
                            primaria={!diasAlterados}
                            grande
                            desativado={carregando || carregandoMeses || !ciclo}
                            onPress={onSolicitarExcluirCiclo}
                        />
                    </View>
                </BottomSheetLayout>
            </BottomSheet>
            {modalAlerta}
        </>
    );
}

export { RemoveMenstruationModal, obterPeriodo };
