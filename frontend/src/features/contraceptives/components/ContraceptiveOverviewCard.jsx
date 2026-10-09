import { useState } from 'react';
import { Text, View } from 'react-native';
import { StatusBadge } from '../../../shared/components/common/StatusBadge/StatusBadge';
import { obterTipo } from '../constants/contraceptiveOptions';
import { DailyUseControl } from './DailyUseControl';
import { UsageHistoryPanel } from './UsageHistoryPanel';
import { estilosAcompanhamento } from './contraceptiveTracking.styles';

const TIPOS_SEM_MARCACAO_DIARIA = new Set(['diu_hormonal', 'anel_vaginal']);

function textoValidade(anticoncepcional) {
    return anticoncepcional.contagemValidade
        || anticoncepcional.validadeRestante
        || (anticoncepcional.dataValidade ? `Validade: ${anticoncepcional.dataValidade}` : 'Validade não informada');
}

function ContraceptiveOverviewCard({
    anticoncepcional,
    aoAlternarUso,
    renderizarAcoes
}) {
    const [historicoAberto, setHistoricoAberto] = useState(false);
    const tipo = obterTipo(anticoncepcional.tipo)?.label ?? anticoncepcional.tipo;
    const semMarcacaoDiaria = TIPOS_SEM_MARCACAO_DIARIA.has(anticoncepcional.tipo);
    const usos = anticoncepcional.usosHoje ?? [];
    const pendente = usos.some((uso) => uso.status !== 'confirmado');

    return (
        <View
            accessibilityLabel={`${anticoncepcional.nome}, ${tipo}${pendente ? ', possui uso pendente' : ''}`}
            style={[estilosAcompanhamento.card, pendente && estilosAcompanhamento.cardPendente]}
        >
            <View style={estilosAcompanhamento.cabecalhoCard}>
                <View style={estilosAcompanhamento.identificacao}>
                    <Text style={estilosAcompanhamento.nome}>{anticoncepcional.nome}</Text>
                    <Text style={estilosAcompanhamento.tipo}>{tipo}</Text>
                </View>
                {renderizarAcoes?.(anticoncepcional)}
            </View>

            <View style={estilosAcompanhamento.badges}>
                {pendente ? <StatusBadge estado="pendente" rotulo="Pendente de uso" /> : null}
                <StatusBadge estado={`alerta${anticoncepcional.intensidadeAlerta?.[0]?.toUpperCase() ?? ''}${anticoncepcional.intensidadeAlerta?.slice(1) ?? ''}`} rotulo={`Alerta ${anticoncepcional.intensidadeAlerta ?? 'não definido'}`} />
            </View>

            {semMarcacaoDiaria ? (
                <Text style={estilosAcompanhamento.validade}>{textoValidade(anticoncepcional)}</Text>
            ) : (
                <View style={estilosAcompanhamento.listaUsos}>
                    <Text style={estilosAcompanhamento.rotuloSecao}>PRÓXIMOS HORÁRIOS</Text>
                    {usos.map((uso) => (
                        <DailyUseControl
                            key={uso.id ?? `${anticoncepcional.id}-${uso.horario}`}
                            uso={uso}
                            aoAlternar={(item, confirmar) => aoAlternarUso?.(anticoncepcional, item, confirmar)}
                        />
                    ))}
                </View>
            )}

            {!semMarcacaoDiaria && anticoncepcional.historico?.length ? (
                <UsageHistoryPanel
                    expandido={historicoAberto}
                    registros={anticoncepcional.historico}
                    modo={anticoncepcional.modoHistorico ?? 'lista'}
                    aoAlternar={() => setHistoricoAberto((atual) => !atual)}
                />
            ) : null}
        </View>
    );
}

export { ContraceptiveOverviewCard, TIPOS_SEM_MARCACAO_DIARIA };
