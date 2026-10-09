import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { CheckIcon, ClockIcon } from 'phosphor-react-native';
import { PencilSimpleIcon } from 'phosphor-react-native/src/icons/PencilSimple';
import { ShieldPlusIcon } from 'phosphor-react-native/src/icons/ShieldPlus';
import Button from '../../../shared/components/common/Button/Button';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import { StatusBadge } from '../../../shared/components/common/StatusBadge/StatusBadge';
import { estilos as estilosBadge, variantes as variantesBadge } from '../../../shared/components/common/StatusBadge/StatusBadge.styles';
import { ArrowsClockwiseIcon, FirstAidKitIcon, PillIcon, TrashIcon } from '../../../shared/components/icons/AppIcons';
import { horarioValido } from '../../../shared/utils/validation/isValidTime';
import { obterTipo } from '../constants/contraceptiveOptions';
import { estadoRegistroUso } from '../utils/usageHistory';
import { UsageHistoryPanel } from './UsageHistoryPanel';
import { estilosCartao } from './ContraceptiveUsageCard.styles';

const ESCALA_BOTAO_USO = 13 / 16;
const ICONES_TIPO = Object.freeze({
    pilula: PillIcon,
    adesivo: ShieldPlusIcon,
    anel_vaginal: ArrowsClockwiseIcon,
    diu_hormonal: ArrowsClockwiseIcon,
    injetavel: FirstAidKitIcon
});
const ROTULOS_TIPO = Object.freeze({
    injetavel: 'Injeção',
    anel_vaginal: 'Anel vaginal',
    diu_hormonal: 'DIU hormonal'
});

function criarUsos(anticoncepcional) {
    if (anticoncepcional.tipo === 'diu_hormonal') return [];
    if (Array.isArray(anticoncepcional.usosHoje)) return anticoncepcional.usosHoje;

    return (anticoncepcional.programacao?.horarios ?? []).map((horario, indice) => ({
        id: `${anticoncepcional.id}-${horario}-${indice}`,
        horario,
        status: 'pendente',
        atrasado: indice === 0 && Boolean(anticoncepcional.usoAtrasado)
    }));
}

function usoConfirmado(uso) {
    return ['confirmado', 'confirmadoForaDoPrazo', 'foraDoPrazo'].includes(uso.status);
}

function horarioUsoInvalido(uso) {
    return uso.horario !== undefined && !horarioValido(uso.horario);
}

function estadoAlerta(intensidade = 'critico') {
    return `alerta${intensidade.charAt(0).toUpperCase()}${intensidade.slice(1)}`;
}

function formatarValidade(valor) {
    const data = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor ?? '');
    return data ? `${data[3]}/${data[2]}/${data[1]}` : valor;
}

function IconeConfirmacao({ color }) {
    return <CheckIcon size={13 / ESCALA_BOTAO_USO} color={color} weight="bold" />;
}

function AcaoDeUso({ confirmado, aoPressionar, desativado }) {
    const largura = confirmado ? 144 : 119;
    return (
        <View style={[estilosCartao.espacoBotaoUso, { width: largura }]}>
            <View style={[estilosCartao.escalaBotaoUso, { width: largura / ESCALA_BOTAO_USO }]}>
                <Button
                    texto={confirmado ? 'Desmarcar Uso' : 'Marcar Uso'}
                    variante={confirmado ? 'branco' : 'verde'}
                    tamanho="compacto"
                    largura={largura / ESCALA_BOTAO_USO}
                    icone={IconeConfirmacao}
                    desativado={desativado}
                    estilo={[estilosCartao.botaoUso, confirmado && estilosCartao.botaoUsoConfirmado]}
                    aoPressionar={aoPressionar}
                />
            </View>
            {confirmado ? <View pointerEvents="none" style={estilosCartao.bordaBotaoConfirmado} /> : null}
        </View>
    );
}

function AcaoDoCartao({ icone, rotulo, aoPressionar }) {
    return (
        <View style={estilosCartao.espacoAcao}>
            <View style={estilosCartao.escalaAcao}>
                <IconButton icone={icone} rotuloAcessibilidade={rotulo} aoPressionar={aoPressionar} />
            </View>
        </View>
    );
}

function larguraMinimaDosBadges(estados) {
    return Math.max(...estados.map((estado) => {
        const visual = variantesBadge[estado === 'alertaCrítico' ? 'alertaCritico' : estado];
        if (estado.endsWith('HistoricoUso')) return visual.container.width;
        return visual.texto.width + visual.container.paddingHorizontal * 2
            + estilosBadge.ponto.width + visual.container.gap;
    }));
}

function BadgeDoCartao({ estado, larguraMinima }) {
    return (
        <View
            testID={`usage-card-badge-${estado}`}
            style={[estilosCartao.espacoBadge, { minWidth: larguraMinima, flexBasis: larguraMinima }]}
        >
            <StatusBadge estado={estado} />
        </View>
    );
}

function ContraceptiveUsageCard({ anticoncepcional, aoEditar, aoRemover, aoAlternarUso, aoAtualizarUsos }) {
    const [historicoExpandido, setHistoricoExpandido] = useState(false);
    const usosRecebidos = useMemo(() => criarUsos(anticoncepcional), [anticoncepcional]);
    const [usos, setUsos] = useState(usosRecebidos);
    const usosAtuais = useRef(usos);
    const operacoesPendentes = useRef(new Set());
    const IconeTipo = ICONES_TIPO[anticoncepcional.tipo] ?? PillIcon;
    const tipo = ROTULOS_TIPO[anticoncepcional.tipo] ?? obterTipo(anticoncepcional.tipo)?.label ?? anticoncepcional.tipo;
    const historico = anticoncepcional.historico ?? [];
    const removido = Boolean(anticoncepcional.removido || anticoncepcional.ativo === false);
    const possuiUsoPendente = usos.some((uso) => !usoConfirmado(uso));
    const possuiUsoConfirmado = usos.some(usoConfirmado);
    const ultimoEstado = anticoncepcional.statusUltimoUso ?? historico[0]?.estado;
    const estadoUltimoNormalizado = estadoRegistroUso({ estado: ultimoEstado });
    const estadoUso = usos.length ? (possuiUsoPendente ? 'pendenteDeUso' : 'confirmado')
        : ultimoEstado === 'pendente' ? 'pendenteDeUso'
            : estadoUltimoNormalizado === 'naoConfirmado' ? 'naoConfirmadoHistoricoUso'
                : estadoUltimoNormalizado || anticoncepcional.tipo === 'diu_hormonal' ? 'confirmado' : null;
    const alerta = estadoAlerta(anticoncepcional.intensidadeAlerta);
    const larguraMinimaBadge = larguraMinimaDosBadges([estadoUso, alerta].filter(Boolean));
    const permiteHistorico = ['pilula', 'injetavel', 'adesivo', 'anel_vaginal'].includes(anticoncepcional.tipo);
    const modoHistorico = anticoncepcional.tipo === 'pilula' ? 'calendario' : 'lista';

    useEffect(() => {
        // A API ou o fluxo pode atualizar horários e estados após a montagem do cartão.
        usosAtuais.current = usosRecebidos;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUsos(usosRecebidos);
    }, [usosRecebidos]);

    function publicarUsos(novosUsos) {
        usosAtuais.current = novosUsos;
        setUsos(novosUsos);
        aoAtualizarUsos?.(anticoncepcional, novosUsos);
    }

    async function alternarUso(uso) {
        if (typeof aoAlternarUso !== 'function' || horarioUsoInvalido(uso) || operacoesPendentes.current.has(uso.id)) return;
        operacoesPendentes.current.add(uso.id);
        const confirmar = !usoConfirmado(uso);
        const agora = new Date();
        publicarUsos(usosAtuais.current.map((item) => item.id === uso.id ? {
            ...item,
            status: confirmar ? 'confirmado' : 'pendente',
            horarioConfirmacao: confirmar ? `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}` : null,
            confirmadoEm: confirmar ? agora.toISOString() : null
        } : item));

        try {
            const salvo = await aoAlternarUso(anticoncepcional, uso, confirmar);
            // O relógio do servidor e sua avaliação do prazo prevalecem sobre o feedback otimista.
            if (salvo?.data && salvo?.horario) {
                publicarUsos(usosAtuais.current.map((item) => item.id === uso.id ? { ...item, ...salvo } : item));
            }
        } catch {
            publicarUsos(usosAtuais.current.map((item) => item.id === uso.id ? uso : item));
        } finally {
            operacoesPendentes.current.delete(uso.id);
        }
    }

    return (
        <View style={[estilosCartao.card, !possuiUsoPendente && !removido && estilosCartao.cardConfirmado]} accessibilityLabel={`${anticoncepcional.nome}, ${tipo}${removido ? ', removido' : ''}`}>
            <View style={estilosCartao.faixaSuperior} />
            <View style={[estilosCartao.conteudo, !removido && !usos.length && anticoncepcional.dataValidade && estilosCartao.conteudoValidade, removido && estilosCartao.conteudoRemovido]}>
                <View style={estilosCartao.cabecalho}>
                    <View style={estilosCartao.iconeTipo}>
                        <IconeTipo size={16} color="#5C5C59" weight={anticoncepcional.tipo === 'anel_vaginal' || anticoncepcional.tipo === 'diu_hormonal' ? 'regular' : 'fill'} />
                    </View>
                    <View style={estilosCartao.identificacao}>
                        <Text style={estilosCartao.nome}>{anticoncepcional.nome}</Text>
                        <Text style={estilosCartao.tipo}>{tipo}</Text>
                    </View>
                    {!removido ? (
                        <View style={estilosCartao.acoes}>
                            <AcaoDoCartao icone={PencilSimpleIcon} rotulo={`Editar ${anticoncepcional.nome}`} aoPressionar={aoEditar ? () => aoEditar(anticoncepcional) : undefined} />
                            <AcaoDoCartao icone={TrashIcon} rotulo={`Remover ${anticoncepcional.nome}`} aoPressionar={aoRemover ? () => aoRemover(anticoncepcional) : undefined} />
                        </View>
                    ) : null}
                </View>

                {!removido ? (
                    <View testID="usage-card-badges" style={[estilosCartao.badges, !possuiUsoPendente && estilosCartao.badgesConfirmado]}>
                        {estadoUso ? <BadgeDoCartao estado={estadoUso} larguraMinima={larguraMinimaBadge} />
                            : <Text style={estilosCartao.tipo}>Sem usos registrados</Text>}
                        <BadgeDoCartao estado={alerta} larguraMinima={larguraMinimaBadge} />
                    </View>
                ) : null}

                {!removido && anticoncepcional.tipo === 'diu_hormonal' && anticoncepcional.dataValidade ? (
                    <View style={estilosCartao.validade}>
                        <ClockIcon size={11} color="#5C5C59" />
                        <Text style={estilosCartao.textoValidade}><Text style={estilosCartao.rotuloValidade}>Validade: </Text>{formatarValidade(anticoncepcional.dataValidade)}</Text>
                        {anticoncepcional.validadeRestante ? anticoncepcional.validadeExpirada
                            ? <Text accessibilityRole="alert" style={estilosCartao.textoValidade}>{anticoncepcional.validadeRestante}</Text>
                            : <StatusBadge estado="validadeAindaPrazo" rotulo={anticoncepcional.validadeRestante} /> : null}
                    </View>
                ) : null}

                {!removido && usos.length > 0 ? <View style={estilosCartao.divisor} /> : null}
                {!removido && !usos.length && anticoncepcional.programacao?.proximoUsoPrevisto ? (
                    <Text style={estilosCartao.confirmadoAs}>Próximo uso: {new Date(anticoncepcional.programacao.proximoUsoPrevisto).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</Text>
                ) : null}

                {!removido && possuiUsoPendente ? (
                    <View style={estilosCartao.blocoUsos}>
                        <Text style={estilosCartao.rotuloSecao}>PRÓXIMOS HORÁRIOS</Text>
                        {usos.filter((uso) => !usoConfirmado(uso)).map((uso, indice) => (
                            <View key={uso.id} style={[estilosCartao.linhaUso, indice > 0 && estilosCartao.linhaUsoSeparada]}>
                                <View style={estilosCartao.horarioComIcone}>
                                    <ClockIcon size={11} color="#5C5C59" />
                                    <Text style={estilosCartao.horario}>{uso.horario}</Text>
                                    {uso.atrasado ? <StatusBadge estado="atrasadoProximosHorarios" /> : null}
                                </View>
                                <AcaoDeUso confirmado={false} desativado={typeof aoAlternarUso !== 'function' || horarioUsoInvalido(uso)} aoPressionar={() => alternarUso(uso)} />
                            </View>
                        ))}
                    </View>
                ) : null}

                {!removido && possuiUsoConfirmado ? (
                    <View style={estilosCartao.blocoUsos}>
                        <Text style={estilosCartao.rotuloSecao}>USADOS</Text>
                        {usos.filter(usoConfirmado).map((uso, indice) => (
                            <View key={uso.id} style={[estilosCartao.linhaUso, indice > 0 && estilosCartao.linhaUsoSeparada]}>
                                <View style={estilosCartao.horarioConfirmado}>
                                    <View style={estilosCartao.horarioComIcone}>
                                        <ClockIcon size={11} color="#5C5C59" />
                                        <Text style={estilosCartao.horario}>{uso.horario}</Text>
                                    </View>
                                    {uso.horarioConfirmacao ? <Text style={estilosCartao.confirmadoAs}>Confirmado às <Text style={estilosCartao.horaConfirmacao}>{uso.horarioConfirmacao}</Text></Text> : null}
                                </View>
                                <AcaoDeUso confirmado desativado={typeof aoAlternarUso !== 'function' || horarioUsoInvalido(uso)} aoPressionar={() => alternarUso(uso)} />
                            </View>
                        ))}
                    </View>
                ) : null}

                {permiteHistorico ? (
                    <View style={[estilosCartao.historico, removido && estilosCartao.historicoRemovido]}>
                        <UsageHistoryPanel
                            expandido={historicoExpandido}
                            registros={historico}
                            modo={modoHistorico}
                            aoAlternar={() => setHistoricoExpandido((atual) => !atual)}
                        />
                    </View>
                ) : null}
            </View>
        </View>
    );
}

export { ContraceptiveUsageCard, criarUsos, usoConfirmado };
