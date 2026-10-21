import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChartBarIcon } from 'phosphor-react-native/src/icons/ChartBar';
import { StatusBadge } from '../../../shared/components/common/StatusBadge/StatusBadge';
import { CaretDownIcon, CaretUpIcon } from '../../../shared/components/icons/AppIcons';
import { estadoRegistroUso, formatarDataUso, partesDaDataUso } from '../utils/usageHistory';
import { UsageCalendar } from './UsageCalendar';
import { estilosUso } from './usageComponents.styles';

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

function ListaDeUsos({ registros }) {
    return (
        <View style={estilosUso.listaRegistros}>
            {!registros.length ? <Text style={estilosUso.textoSemConfirmacao}>Nenhum uso registrado ainda.</Text> : null}
            {registros.map((registro, indice) => {
                const estado = estadoDoRegistro(registro);
                const naoConfirmado = estado === 'naoConfirmadoHistoricoUso';

                return (
                    <View
                        key={registro.id ?? `${registro.data}-${registro.horario}-${indice}`}
                        style={[estilosUso.registro, naoConfirmado && estilosUso.registroNaoConfirmado]}
                    >
                        <View style={estilosUso.cabecalhoRegistro}>
                            <Text numberOfLines={1} style={estilosUso.dataRegistro}>{formatarDataUso(registro.data)}</Text>
                            <View style={estilosUso.statusRegistro}>
                                {estado ? <StatusBadge estado={estado} rotulo={registro.rotuloEstado} />
                                    : <Text style={estilosUso.textoSemConfirmacao}>Status indisponível</Text>}
                            </View>
                        </View>
                        {registro.horarioProgramado || registro.horario ? (
                            <View style={estilosUso.linhaHorario}>
                                <Text style={estilosUso.rotuloHorarioProgramado}>Horário programado:</Text>
                                <Text style={estilosUso.horaRegistro}>
                                    {registro.horarioProgramado || registro.horario}
                                </Text>
                            </View>
                        ) : null}
                        {registro.horarioConfirmacao ? (
                            <View style={estilosUso.linhaConfirmacao}>
                                <Text style={estilosUso.rotuloConfirmacao}>Confirmado às:</Text>
                                <Text style={estilosUso.horaRegistro}>{registro.horarioConfirmacao}</Text>
                            </View>
                        ) : null}
                        {naoConfirmado && !registro.horarioConfirmacao ? (
                            <View style={estilosUso.linhaSemConfirmacao}>
                                <Text style={estilosUso.textoSemConfirmacao}>Não houve confirmação</Text>
                            </View>
                        ) : null}
                    </View>
                );
            })}
        </View>
    );
}

function mesInicial(registros) {
    const partes = registros.map((registro) => partesDaDataUso(registro.data)).find(Boolean);
    const hoje = new Date();
    return partes?.chaveMes ?? `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
}

function deslocarMes(mes, deslocamento) {
    const [ano, numeroMes] = mes.split('-').map(Number);
    const data = new Date(Date.UTC(ano, numeroMes - 1 + deslocamento, 1));
    return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}`;
}

function UsageHistoryPanel({ expandido = false, registros = [], modo = 'lista', aoAlternar }) {
    const [mes, setMes] = useState(() => mesInicial(registros));
    const registrosDoMes = registros.filter((registro) => (
        !registro.data || partesDaDataUso(registro.data)?.chaveMes === mes
    ));

    return (
        <View style={[estilosUso.painel, expandido && estilosUso.painelExpandido]}>
            <View style={estilosUso.cabecalhoPainel}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Histórico de uso"
                    accessibilityState={{ expanded: expandido }}
                    onPress={aoAlternar}
                    style={estilosUso.botaoPainel}
                >
                    <ChartBarIcon size={13} color="#5C5C59" />
                    <Text numberOfLines={1} style={estilosUso.tituloPainel}>Histórico de uso</Text>
                    {expandido
                        ? <CaretUpIcon size={10.99} color="#5C5C59" />
                        : <CaretDownIcon size={10.99} color="#5C5C59" />}
                </Pressable>
            </View>
            {expandido ? (
                <View style={estilosUso.conteudoPainel}>
                    {modo === 'calendario'
                        ? <UsageCalendar
                            mes={mes}
                            dias={registrosDoMes}
                            aoMesAnterior={() => setMes((atual) => deslocarMes(atual, -1))}
                            aoProximoMes={() => setMes((atual) => deslocarMes(atual, 1))}
                        />
                        : <ListaDeUsos registros={registros} />}
                </View>
            ) : null}
        </View>
    );
}

export { UsageHistoryPanel };
