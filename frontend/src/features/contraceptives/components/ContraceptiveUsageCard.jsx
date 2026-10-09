import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { CheckIcon, ClockIcon } from 'phosphor-react-native';
import Button from '../../../shared/components/common/Button/Button';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import { StatusBadge } from '../../../shared/components/common/StatusBadge/StatusBadge';
import {
    ArrowsClockwiseIcon,
    FirstAidKitIcon,
    NotePencilIcon,
    PillIcon,
    TrashIcon
} from '../../../shared/components/icons/AppIcons';
import { obterTipo } from '../constants/contraceptiveOptions';
import { UsageHistoryPanel } from './UsageHistoryPanel';
import { estilosCartao } from './ContraceptiveUsageCard.styles';

const ICONES_TIPO = Object.freeze({
    pilula: PillIcon,
    adesivo: FirstAidKitIcon,
    anel_vaginal: ArrowsClockwiseIcon,
    diu_hormonal: ArrowsClockwiseIcon,
    injetavel: FirstAidKitIcon
});

function criarUsos(anticoncepcional) {
    if (anticoncepcional.usosHoje?.length) return anticoncepcional.usosHoje;

    return (anticoncepcional.programacao?.horarios ?? []).map((horario, indice) => ({
        id: `${anticoncepcional.id}-${horario}-${indice}`,
        horario,
        status: 'pendente',
        atrasado: indice === 0 && Boolean(anticoncepcional.usoAtrasado)
    }));
}

function estadoAlerta(intensidade = 'critico') {
    return `alerta${intensidade.charAt(0).toUpperCase()}${intensidade.slice(1)}`;
}

function ContraceptiveUsageCard({
    anticoncepcional,
    aoEditar,
    aoRemover,
    aoAlternarUso
}) {
    const [historicoExpandido, setHistoricoExpandido] = useState(false);
    const [usos, setUsos] = useState(() => criarUsos(anticoncepcional));
    const IconeTipo = ICONES_TIPO[anticoncepcional.tipo] ?? PillIcon;
    const tipo = obterTipo(anticoncepcional.tipo)?.label ?? anticoncepcional.tipo;
    const historico = anticoncepcional.historico ?? [];
    const possuiUsoPendente = usos.some((uso) => uso.status !== 'confirmado');
    const possuiUsoConfirmado = usos.some((uso) => uso.status === 'confirmado');

    const statusPrincipal = useMemo(() => {
        if (possuiUsoPendente) return { estado: 'pendenteDeUso', rotulo: 'Pendente de Uso' };
        return { estado: 'confirmado', rotulo: 'Confirmado' };
    }, [possuiUsoPendente]);

    async function alternarUso(uso) {
        const confirmar = uso.status !== 'confirmado';
        const statusAnterior = uso.status;

        setUsos((atuais) => atuais.map((item) => item.id === uso.id
            ? { ...item, status: confirmar ? 'confirmado' : 'pendente' }
            : item));

        try {
            await aoAlternarUso?.(anticoncepcional, uso, confirmar);
        } catch {
            setUsos((atuais) => atuais.map((item) => item.id === uso.id
                ? { ...item, status: statusAnterior }
                : item));
        }
    }

    return (
        <View style={estilosCartao.card} accessibilityLabel={`${anticoncepcional.nome}, ${tipo}`}>
            <View style={estilosCartao.faixaSuperior} />
            <View style={estilosCartao.conteudo}>
                <View style={estilosCartao.cabecalho}>
                    <View style={estilosCartao.iconeTipo}>
                        <IconeTipo size={18} color="#5C5C59" weight="fill" />
                    </View>
                    <View style={estilosCartao.identificacao}>
                        <Text style={estilosCartao.nome}>{anticoncepcional.nome}</Text>
                        <Text style={estilosCartao.tipo}>{tipo}</Text>
                    </View>
                    <View style={estilosCartao.acoes}>
                        <IconButton icone={NotePencilIcon} rotuloAcessibilidade={`Editar ${anticoncepcional.nome}`} aoPressionar={() => aoEditar?.(anticoncepcional)} />
                        <IconButton icone={TrashIcon} rotuloAcessibilidade={`Remover ${anticoncepcional.nome}`} aoPressionar={() => aoRemover?.(anticoncepcional)} />
                    </View>
                </View>

                {usos.length ? (
                    <View style={estilosCartao.badges}>
                        <StatusBadge estado={statusPrincipal.estado} rotulo={statusPrincipal.rotulo} />
                        <StatusBadge estado={estadoAlerta(anticoncepcional.intensidadeAlerta)} rotulo={`Alerta ${anticoncepcional.intensidadeAlerta === 'critico' ? 'Crítico' : anticoncepcional.intensidadeAlerta === 'moderado' ? 'Moderado' : 'Leve'}`} />
                    </View>
                ) : null}

                {anticoncepcional.dataValidade ? (
                    <View style={estilosCartao.validade}>
                        <ClockIcon size={14} color="#5C5C59" />
                        <Text style={estilosCartao.textoValidade}><Text style={estilosCartao.rotuloValidade}>Validade: </Text>{anticoncepcional.dataValidade}</Text>
                        {anticoncepcional.validadeRestante ? <StatusBadge estado="validadeAindaPrazo" rotulo={anticoncepcional.validadeRestante} /> : null}
                    </View>
                ) : null}

                {usos.length ? <View style={estilosCartao.divisor} /> : null}

                {possuiUsoPendente ? (
                    <View style={estilosCartao.blocoUsos}>
                        <Text style={estilosCartao.rotuloSecao}>PRÓXIMOS HORÁRIOS</Text>
                        {usos.filter((uso) => uso.status !== 'confirmado').map((uso) => (
                            <View key={uso.id} style={estilosCartao.linhaUso}>
                                <View style={estilosCartao.horarioComIcone}>
                                    <ClockIcon size={14} color="#5C5C59" />
                                    <Text style={estilosCartao.horario}>{uso.horario}</Text>
                                    {uso.atrasado ? <StatusBadge estado="atrasadoProximosHorarios" /> : null}
                                </View>
                                <Button texto="Marcar Uso" variante="verde" tamanho="compacto" largura={142} icone={CheckIcon} aoPressionar={() => alternarUso(uso)} />
                            </View>
                        ))}
                    </View>
                ) : null}

                {possuiUsoConfirmado ? (
                    <View style={estilosCartao.blocoUsos}>
                        <Text style={estilosCartao.rotuloSecao}>USADOS</Text>
                        {usos.filter((uso) => uso.status === 'confirmado').map((uso) => (
                            <View key={uso.id} style={estilosCartao.linhaUso}>
                                <View style={estilosCartao.horarioConfirmado}>
                                    <View style={estilosCartao.horarioComIcone}>
                                        <ClockIcon size={14} color="#5C5C59" />
                                        <Text style={estilosCartao.horario}>{uso.horario}</Text>
                                    </View>
                                    {uso.horarioConfirmacao ? <Text style={estilosCartao.confirmadoAs}>Confirmado às {uso.horarioConfirmacao}</Text> : null}
                                </View>
                                <Button texto="Desmarcar Uso" variante="branco" tamanho="compacto" largura={178} icone={CheckIcon} aoPressionar={() => alternarUso(uso)} />
                            </View>
                        ))}
                    </View>
                ) : null}

                {historico.length ? (
                    <UsageHistoryPanel
                        expandido={historicoExpandido}
                        registros={historico}
                        modo={anticoncepcional.modoHistorico ?? 'lista'}
                        aoAlternar={() => setHistoricoExpandido((atual) => !atual)}
                    />
                ) : null}
            </View>
        </View>
    );
}

export { ContraceptiveUsageCard, criarUsos };
