import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useUsageHistoryEdit } from '../hooks/useUsageHistoryEdit';
import { ChartBarIcon } from 'phosphor-react-native/src/icons/ChartBar';
import { StatusBadge } from '../../../shared/components/common/StatusBadge/StatusBadge';
import { CaretDownIcon, CaretUpIcon } from '../../../shared/components/icons/AppIcons';
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

    return normalizado === 'confirmado' ? 'confirmadoHistoricoUso' : null;
}

function ListaDeUsos({ registros, estilosUso, selecao, aoSelecionar }) {
    return (
        <View style={estilosUso.listaRegistros}>
            {!registros.length ? (
                <Text style={estilosUso.textoSemConfirmacao}>Nenhum uso registrado ainda.</Text>
            ) : null}
            {registros.map((registro, indice) => {
                const estado = estadoDoRegistro(registro);
                const naoConfirmado = estado === 'naoConfirmadoHistoricoUso';
                const selecionado = selecao !== undefined && selecao === registro.id;
                const editavel = aoSelecionar && registro.id && estadoRegistroUso(registro);
                const Linha = editavel ? Pressable : View;

                return (
                    <Linha
                        key={registro.id ?? `${registro.data}-${registro.horario}-${indice}`}
                        {...(editavel && {
                            accessibilityRole: 'button', accessibilityState: { selected: selecionado },
                            accessibilityLabel: `${formatarDataUso(registro.data)}, ${registro.horarioProgramado ?? registro.horario}, ${rotulosHistorico[estadoRegistroUso(registro)]}`,
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
                                        Status indisponível
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
    confirmado: 'Confirmado', foraDoPrazo: 'Fora do prazo', naoConfirmado: 'Não confirmado'
};

function UsageHistoryPanel({
    expandido = false, registros = [], modo = 'lista', aoAlternar, aoSalvarEdicaoHistorico
}) {
    const tema = useTheme();
    const estilosUso = useMemo(() => criarEstilosUso(tema), [tema]);
    const [mes, setMes] = useState(() => mesInicial(registros));
    const {
        sessao, setSessao, salvando, editaveis, alvo, opcoes, alterado, podeSalvar, ocorrenciasDoDia,
        sairDoAlvo, selecionar, selecionarData, salvar
    } = useUsageHistoryEdit(registros, aoSalvarEdicaoHistorico);
    const registrosDoMes = registros.filter(
        (registro) => !registro.data || partesDaDataUso(registro.data)?.chaveMes === mes
    );
    const calendario = modo === 'calendario';
    const instrucao = sessao ? (
        <Text style={estilosUso.instrucaoEdicao}>
            {calendario ? 'Para editar clique na célula do dia correspondente:' : 'Para editar, selecione o registro correspondente:'}
        </Text>
    ) : null;
    const grade = calendario ? (
        <UsageCalendar
            mes={mes}
            dias={alterado ? registrosDoMes.map((registro) => registro.id === alvo.id
                ? { ...registro, estado: sessao.opcao } : registro) : registrosDoMes}
            aoMesAnterior={() => navegarMes(-1)}
            aoProximoMes={() => navegarMes(1)}
            emEdicao={Boolean(sessao)}
            dataSelecionada={sessao?.data}
            datasEditaveis={new Set(editaveis.map((registro) => registro.data))}
            aoSelecionarData={selecionarData}
        />
    ) : null;

    function navegarMes(deslocamento) {
        sairDoAlvo(() => {
            if (sessao) setSessao({});
            setMes(deslocarMes(mes, deslocamento));
        });
    }

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
                            aoSelecionar={sessao && !salvando ? selecionar : undefined} />
                    </>}
                    {sessao ? (
                        <UsageHistoryEditControls modo={modo} opcaoSelecionada={sessao.opcao}
                            opcoesDisponiveis={opcoes} podeSalvar={podeSalvar} salvando={salvando}
                            erro={sessao.erro} aoSalvar={salvar}
                            estiloOpcoes={calendario ? estilosUso.calendarioEmEdicao : undefined}
                            aoSelecionarOpcao={(opcao) => setSessao({ ...sessao, opcao, erro: null })}>
                            {calendario ? <>{instrucao}{grade}</> : null}
                            {calendario && ocorrenciasDoDia.length > 1 ? (
                                <ListaDeUsos registros={ocorrenciasDoDia} estilosUso={estilosUso} selecao={sessao.id}
                                    aoSelecionar={salvando ? undefined : selecionar} />
                            ) : null}
                        </UsageHistoryEditControls>
                    ) : aoSalvarEdicaoHistorico && editaveis.length ? (
                        <Pressable accessibilityRole="button" style={estilosUso.alterarHistorico}
                            onPress={() => setSessao({})}>
                            <Text style={estilosUso.textoAlterarHistorico}>Alterar Histórico</Text>
                        </Pressable>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
}

export { UsageHistoryPanel };
