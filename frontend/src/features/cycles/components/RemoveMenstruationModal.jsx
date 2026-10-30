import { Pressable, Text, View } from 'react-native';
import AlertModal from '../../../shared/components/feedback/Modal/AlertModal/AlertModal';
import { BottomSheet } from '../../../shared/components/feedback/BottomSheet/BottomSheet';
import { BottomSheetLayout } from '../../../shared/layouts/BottomSheet/BottomSheetLayout';
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
    if (!['dia', 'cicloCompleto'].includes(modo))
        throw new TypeError('O modo de remoção da menstruação é inválido.');
    const tipoAlerta = alerta || (modo === 'cicloCompleto' ? 'confirmacao' : null);
    const mensagemConfirmacao = `Período: ${obterPeriodo(ciclo)}.\n\nEsta ação não pode ser desfeita. As previsões serão recalculadas.`;
    let modalAlerta = null;

    if (tipoAlerta === 'confirmacao') {
        modalAlerta = (
            <AlertModal
                visivel
                titulo="Excluir ciclo inteiro?"
                mensagem={mensagemConfirmacao}
                aoFechar={onCancelarExclusao}
                acaoPrincipal={{
                    texto: 'Excluir',
                    variante: 'vermelho',
                    aoPressionar: onExcluirCiclo,
                    carregando
                }}
                acaoSecundaria={{ texto: 'Cancelar', aoPressionar: onCancelarExclusao }}
            />
        );
    } else if (tipoAlerta === 'erro') {
        modalAlerta = (
            <AlertModal
                visivel
                titulo="Algo deu errado"
                mensagem="Ocorreu um erro ao excluir este registro. Tente novamente."
                aoFechar={onFecharAlerta}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: onTentarNovamente,
                    carregando
                }}
                acaoSecundaria={{ texto: 'Voltar', aoPressionar: onFecharAlerta }}
            />
        );
    } else if (tipoAlerta === 'sucesso-excluir' || tipoAlerta === 'sucesso-atualizar') {
        modalAlerta = (
            <AlertModal
                visivel
                titulo={
                    tipoAlerta === 'sucesso-excluir'
                        ? 'Ciclo excluído com sucesso'
                        : 'Ciclo atualizado com sucesso'
                }
                mensagem="Registro de menstruação excluído com sucesso."
                aoFechar={onFecharAlerta}
                acaoPrincipal={{ texto: 'OK', variante: 'verde', aoPressionar: onFecharAlerta }}
            />
        );
    }

    return (
        <>
            {visivel ? (
                <BottomSheet
                    visivel={visivel}
                    onFechar={carregando ? undefined : onFechar}
                    bloquearFechamento={carregando}
                >
                    <BottomSheetLayout
                        titulo="Remover Menstruação"
                        onFechar={onFechar}
                        bloquearFechamento={carregando}
                        compacto
                    >
                        <View
                            style={estilos.conteudo}
                            accessibilityHint={
                                dataSelecionada ? `Dia selecionado: ${dataSelecionada}` : undefined
                            }
                        >
                            <Text style={estilos.instrucao}>
                                Toque em um dia preenchido para desmarcá-lo.
                            </Text>
                            <View style={estilos.calendario}>
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
            ) : null}
            {modalAlerta}
        </>
    );
}

export { RemoveMenstruationModal, obterPeriodo };
