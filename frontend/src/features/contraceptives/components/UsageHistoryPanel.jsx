import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBadge } from '../../../shared/components/common/StatusBadge/StatusBadge';
import { CaretDownIcon, CaretUpIcon, ClockCounterClockwiseIcon } from '../../../shared/components/icons/AppIcons';
import { UsageCalendar } from './UsageCalendar';
import { estilosUso } from './usageComponents.styles';
function ListaDeUsos({ registros }) {
    return (
        <View style={estilosUso.listaRegistros}>
            {registros.map((registro, indice) => <View key={registro.id ?? `${registro.data}-${registro.horario}-${indice}`} style={estilosUso.registro}>
                <View style={estilosUso.cabecalhoRegistro}>
                <Text style={estilosUso.dataRegistro}>{registro.data}</Text>
                    <StatusBadge
                        estado={registro.estado === 'foraDoPrazo' ? 'confirmadoForaDoPrazo'
                            : registro.estado === 'naoConfirmado' ? 'naoConfirmado'
                                : 'confirmadoHistorico'}
                        rotulo={registro.rotuloEstado}
                    />
                </View>
                {registro.horarioProgramado || registro.horario ? (
                    <View style={estilosUso.linhaHorario}>
                        <Text style={estilosUso.rotuloHorario}>Horário programado:</Text>
                        <Text style={estilosUso.horaRegistro}>{registro.horarioProgramado || registro.horario}</Text>
                    </View>
                ) : null}
                {registro.horarioConfirmacao ? (
                    <View style={estilosUso.linhaConfirmacao}>
                        <Text style={estilosUso.rotuloHorario}>Confirmado às:</Text>
                        <Text style={estilosUso.horaRegistro}>{registro.horarioConfirmacao}</Text>
                    </View>
                ) : null}
            </View>)}
        </View>
    );
}
function mesInicial(registros) {
    const dataIso = registros.find((registro) => /^\d{4}-\d{2}/.test(registro.data))?.data;
    return dataIso?.slice(0, 7) ?? new Date().toISOString().slice(0, 7);
}
function deslocarMes(mes, deslocamento) {
    const [ano, numeroMes] = mes.split('-').map(Number);
    const data = new Date(Date.UTC(ano, numeroMes - 1 + deslocamento, 1));
    return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}`;
}
function UsageHistoryPanel({ expandido = false, registros, modo = 'lista', aoAlternar }) {
    const [mes, setMes] = useState(() => mesInicial(registros));
    const registrosDoMes = registros.filter((registro) => !registro.data || registro.data.startsWith(mes));
    return (
        <View style={estilosUso.painel}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: expandido }} onPress={aoAlternar} style={estilosUso.cabecalhoPainel}>
                <ClockCounterClockwiseIcon size={13} color="#5C5C59" />
                <Text style={estilosUso.tituloPainel}>Histórico de uso</Text>
                {expandido ? <CaretUpIcon size={11} color="#5C5C59" /> : <CaretDownIcon size={11} color="#5C5C59" />}
            </Pressable>
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
