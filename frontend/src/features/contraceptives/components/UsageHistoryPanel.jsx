import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUsageHistoryEdit } from '../hooks/useUsageHistoryEdit';
import { ChartBarIcon } from 'phosphor-react-native/src/icons/ChartBar';
import { StatusBadge } from '../../../shared/components/common/StatusBadge/StatusBadge';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { CaretDownIcon, CaretUpIcon, WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { estadoRegistroUso, formatarDataUso, partesDaDataUso } from '../utils/usageHistory';
import { UsageCalendar } from './UsageCalendar';
import { UsageHistoryEditControls } from './UsageHistoryEditControls';
import { criarEstilosUso } from './usageComponents.styles';

function estadoDoRegistro(registro) {
    if ((registro.estado ?? registro.status) === 'pendente') return 'pendenteDeUso';
    const normalizado = estadoRegistroUso(registro);
    if (normalizado === 'foraDoPrazo') {
        return 'confirmadoForaPrazoHistoricoUso';
    }

    if (normalizado === 'naoConfirmado') {
        return 'naoConfirmadoHistoricoUso';
    }
    if (normalizado === 'naoUsei') return normalizado;

    return normalizado === 'confirmado' ? 'confirmadoHistoricoUso' : null;
}

function ListaDeUsos({ registros, estilosUso, selecao, aoSelecionar, idsEditaveis }) {
    return (
        <View style={estilosUso.listaRegistros}>
            {!registros.length ? (
                <Text style={estilosUso.textoSemConfirmacao}>Nenhum uso registrado ainda.</Text>
            ) : null}
            {registros.map((registro, indice) => {
                const estado = estadoDoRegistro(registro);
                const naoConfirmado = estado === 'naoConfirmadoHistoricoUso';
                const selecionado = selecao !== undefined && selecao === registro.id;
                const editavel = aoSelecionar && idsEditaveis?.has(registro.id);
                const Linha = editavel ? Pressable : View;

                return (
                    <Linha
                        key={registro.id ?? `${registro.data}-${registro.horario}-${indice}`}
                        {...(editavel && {
                            accessibilityRole: 'button', accessibilityState: { selected: selecionado },
                            accessibilityLabel: `${formatarDataUso(registro.data)}, ${registro.horarioProgramado ?? registro.horario}, ${rotulosHistorico[estadoRegistroUso(registro)] ?? 'Sem confirmação'}`,
                            onPress: () => aoSelecionar(registro)
                        })}
                        style={[
                            estilosUso.registro,
                            naoConfirmado && estilosUso.registroNaoConfirmado,
                            selecionado && estilosUso.registroSelecionado
                        ]}
                    >
                        <View style={estilosUso.cabecalhoRegistro}>
                            <Text numberOfLines={1} style={estilosUso.dataRegistro}>
                                {formatarDataUso(registro.data)}
                            </Text>
                            <View style={estilosUso.statusRegistro}>
                                {estado ? (
                                    <StatusBadge estado={estado} rotulo={registro.rotuloEstado} />
                                ) : (
                                    <Text style={estilosUso.textoSemConfirmacao}>
                                        {registro.novo ? 'Sem registro' : 'Status indisponível'}
                                    </Text>
                                )}
                            </View>
                        </View>
                        {registro.horarioProgramado || registro.horario ? (
                            <View style={estilosUso.linhaHorario}>
                                <Text style={estilosUso.rotuloHorarioProgramado}>
                                    Horário programado:
                                </Text>
                                <Text style={estilosUso.horaRegistro}>
                                    {registro.horarioProgramado || registro.horario}
                                </Text>
                            </View>
                        ) : null}
                        {registro.horarioConfirmacao ? (
                            <View style={estilosUso.linhaConfirmacao}>
                                <Text style={estilosUso.rotuloConfirmacao}>Confirmado às:</Text>
                                <Text style={estilosUso.horaRegistro}>
                                    {registro.horarioConfirmacao}
                                </Text>
                            </View>
                        ) : null}
                        {naoConfirmado && !registro.horarioConfirmacao ? (
                            <View style={estilosUso.linhaSemConfirmacao}>
                                <Text style={estilosUso.textoSemConfirmacao}>
                                    Não houve confirmação
                                </Text>
                            </View>
                        ) : null}
                    </Linha>
                );
            })}
        </View>
    );
}

function mesInicial(registros) {
    const partes = registros.map((registro) => partesDaDataUso(registro.data)).find(Boolean);
    const hoje = new Date();
    return (
        partes?.chaveMes ?? `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
    );
}

function deslocarMes(mes, deslocamento) {
    const [ano, numeroMes] = mes.split('-').map(Number);
    const data = new Date(Date.UTC(ano, numeroMes - 1 + deslocamento, 1));
    return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}`;
}

const rotulosHistorico = {
    confirmado: 'Confirmado', foraDoPrazo: 'Fora do prazo', naoConfirmado: 'Não confirmado',
    naoUsei: 'Não usei'
};

function UsageHistoryPanel({
    expandido = false, registros = [], horarios = [], modo = 'lista', aoAlternar, aoSalvarEdicaoHistorico
}) {
    const tema = useTheme();
    const estilosUso = useMemo(() => criarEstilosUso(tema), [tema]);
    const [mes, setMes] = useState(() => mesInicial(registros));
    const {
        sessao, setSessao, salvando, editaveis, alvo, opcoes, alterado, podeSalvar, ocorrenciasDoDia, dataHoje,
        sairDoAlvo, selecionar, selecionarData, salvar, solicitarExclusao, popup, fecharPopup
    } = useUsageHistoryEdit(registros, aoSalvarEdicaoHistorico, horarios);
    const registrosDoMes = registros.filter(
        (registro) => !registro.data || partesDaDataUso(registro.data)?.chaveMes === mes
    );

    function navegarMes(deslocamento) {
        sairDoAlvo(() => {
            if (sessao) setSessao({});
            setMes(deslocarMes(mes, deslocamento));
        });
    }

    const calendario = modo === 'calendario';
    function confirmarPopup() {
        fecharPopup();
        popup?.aoConfirmar?.();
    }

    const configuracaoPopup = {
        diaIndisponivel: {
            titulo: 'Dia indisponível',
            mensagem: 'Escolha um dia anterior. Para hoje, use os controles de próximos horários.'
        },
        descarte: {
            titulo: 'Descartar alteração?',
            mensagem: 'A edição do histórico ainda não foi salva.',
            acaoPrincipal: {
                texto: 'Descartar', varianteVisual: 'sairSemSalvar', variante: 'branco', aoPressionar: confirmarPopup
            },
            acaoSecundaria: { texto: 'Continuar editando', variante: 'verde', aoPressionar: fecharPopup }
        },
        exclusao: {
            titulo: 'Apagar este registro?',
            mensagem: 'O horário voltará a ficar sem registro. A programação do anticoncepcional será preservada.',
            acaoPrincipal: { texto: 'Apagar', variante: 'vermelho', aoPressionar: confirmarPopup },
            acaoSecundaria: { texto: 'Cancelar', variante: 'branco', aoPressionar: fecharPopup }
        },
        erroExclusao: {
            titulo: 'Não foi possível apagar',
            mensagem: 'Tente novamente.'
        }
    }[popup?.tipo];
    const idsEditaveis = new Set([...editaveis, ...ocorrenciasDoDia].map((registro) => registro.id));
    const instrucao = sessao ? (
        <Text style={estilosUso.instrucaoEdicao}>
            {calendario ? 'Selecione um dia para alterar o histórico.' : 'Selecione o registro que deseja editar.'}
        </Text>
    ) : null;
    const grade = calendario ? (
        <UsageCalendar
            mes={mes}
            dias={alterado
                ? [...registrosDoMes.filter((registro) => registro.id !== alvo.id), { ...alvo, estado: sessao.opcao }]
                : registrosDoMes}
            aoMesAnterior={() => navegarMes(-1)}
            aoProximoMes={() => navegarMes(1)}
            emEdicao={Boolean(sessao)}
            dataSelecionada={sessao?.data}
            datasEditaveis={new Set(editaveis.map((registro) => registro.data))}
            editarAntesDe={horarios.length ? dataHoje : undefined}
            aoSelecionarData={selecionarData}
        />
    ) : null;

    return (
        <View style={[estilosUso.painel, expandido && estilosUso.painelExpandido]}>
            <View style={estilosUso.cabecalhoPainel}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Histórico de uso"
                    accessibilityState={{ expanded: expandido }}
                    onPress={() => sairDoAlvo(() => { setSessao(null); aoAlternar?.(); })}
                    style={estilosUso.botaoPainel}
                >
                    <ChartBarIcon size={13} color={tema.cores.interface.textoSecundario} />
                    <Text numberOfLines={1} style={estilosUso.tituloPainel}>
                        Histórico de uso
                    </Text>
                    {expandido ? (
                        <CaretUpIcon size={10.99} color={tema.cores.interface.textoSecundario} />
                    ) : (
                        <CaretDownIcon size={10.99} color={tema.cores.interface.textoSecundario} />
                    )}
                </Pressable>
            </View>
            {expandido ? (
                <View style={estilosUso.conteudoPainel}>
                    {calendario ? (!sessao && grade) : <>
                        {instrucao}
                        <ListaDeUsos registros={registros} estilosUso={estilosUso} selecao={sessao?.id}
                            idsEditaveis={idsEditaveis}
                            aoSelecionar={sessao && !salvando ? selecionar : undefined} />
                    </>}
                    {sessao ? (
                        <UsageHistoryEditControls modo={modo} opcaoSelecionada={sessao.opcao}
                            opcoesDisponiveis={opcoes} podeSalvar={podeSalvar} salvando={salvando}
                            erro={sessao.erro} aoSalvar={salvar}
                            aoApagarRegistro={alvo && !alvo.novo ? solicitarExclusao : undefined}
                            estiloOpcoes={calendario ? estilosUso.calendarioEmEdicao : undefined}
                            aoSelecionarOpcao={(opcao) => setSessao({ ...sessao, opcao, erro: null })}>
                            {calendario ? <>{instrucao}{grade}</> : null}
                            {calendario && ocorrenciasDoDia.length > 1 ? (
                                <>
                                    <Text accessibilityLiveRegion="polite" style={estilosUso.instrucaoEdicao}>
                                        {alvo
                                            ? `Horário selecionado: ${alvo.horarioProgramado}`
                                            : 'Há mais de um uso neste dia. Toque no horário que deseja alterar.'}
                                    </Text>
                                    <ListaDeUsos registros={ocorrenciasDoDia} estilosUso={estilosUso} selecao={sessao.id}
                                        idsEditaveis={idsEditaveis}
                                        aoSelecionar={salvando ? undefined : selecionar} />
                                </>
                            ) : null}
                        </UsageHistoryEditControls>
                    ) : aoSalvarEdicaoHistorico && (editaveis.length || (calendario && horarios.length)) ? (
                        <Pressable accessibilityRole="button" style={estilosUso.alterarHistorico}
                            onPress={() => setSessao({})}>
                            <Text style={estilosUso.textoAlterarHistorico}>Alterar Histórico</Text>
                        </Pressable>
                    ) : null}
                </View>
            ) : null}
            <SimpleModal
                visivel={Boolean(popup)}
                aoFechar={fecharPopup}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                acaoPrincipal={{ texto: 'OK', aoPressionar: fecharPopup }}
                {...configuracaoPopup}
            />
        </View>
    );
}

export { UsageHistoryPanel };
