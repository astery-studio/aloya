//Representa um ciclo registrado e mantém seus estados visuais consistentes no histórico.
import { useMemo } from 'react';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';
import { Text, View } from 'react-native';

import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import {
    ArrowsClockwiseIcon,
    PencilSimpleIcon,
    TrashIcon,
    WarningCircleIcon
} from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './CycleHistoryCard.styles';

const estadosPermitidos = Object.freeze(['emAndamento', 'concluido', 'incerto']);

function normalizarNumeroDoCiclo(valor) {
    if (!Number.isInteger(valor) || valor <= 0) {
        return '--';
    }

    return String(valor).padStart(2, '0');
}

function normalizarQuantidade(valor) {
    if (!Number.isInteger(valor) || valor < 0) {
        return null;
    }

    return valor;
}

function normalizarPeriodo(valor) {
    if (typeof valor !== 'string' || !valor.trim()) {
        return 'Período não informado';
    }

    return valor.trim();
}

function obterEstado(valor) {
    if (estadosPermitidos.includes(valor)) {
        return valor;
    }

    return 'incerto';
}

function obterTextoDosDias(quantidade) {
    return quantidade === 1 ? '1 dia' : `${quantidade} dias`;
}

function CycleHistoryCard({ ciclo, aoEditar, aoExcluir, somenteLeitura = false }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const coresDoCiclo = {
        ativa: tema.escuro ? coresNoturnasConteudo.verde : '#2C4C3B',
        desativada: tema.cores.interface.textoDesabilitado
    };
    const corDoAviso = tema.escuro ? coresNoturnasConteudo.amarelo : '#B97D22';
    const cicloSeguro = ciclo && typeof ciclo === 'object' ? ciclo : {};
    const numero = normalizarNumeroDoCiclo(cicloSeguro.numero);
    const periodo = normalizarPeriodo(cicloSeguro.periodo);
    const diasMenstruais = normalizarQuantidade(cicloSeguro.diasMenstruais);
    const duracaoDias = normalizarQuantidade(cicloSeguro.duracaoDias);
    const estado = obterEstado(cicloSeguro.status);
    const estaEmAndamento = estado === 'emAndamento';
    const estimativaIncerta = estado === 'incerto';
    const duracaoDisponivel = !estaEmAndamento && duracaoDias !== null;
    const rotuloDoCiclo = numero === '--' ? 'Ciclo sem número' : `Ciclo ${numero}`;

    function editar() {
        if (typeof aoEditar === 'function') {
            aoEditar(ciclo);
        }
    }

    function excluir() {
        if (typeof aoExcluir === 'function') {
            aoExcluir(ciclo);
        }
    }

    return (
        <View testID="cycle-history-card" style={estilos.container}>
            <View
                style={[
                    estilos.cabecalho,
                    somenteLeitura && estilos.cabecalhoSomenteLeitura,
                    estaEmAndamento && estilos.cabecalhoEmAndamento
                ]}
            >
                <View style={estilos.linhaDoCabecalho}>
                    <View
                        style={[
                            estilos.identificacao,
                            somenteLeitura && estilos.identificacaoSomenteLeitura
                        ]}
                    >
                        <View
                            accessible
                            accessibilityRole="text"
                            accessibilityLabel={rotuloDoCiclo}
                            style={estilos.numero}
                        >
                            <Text style={estilos.textoDoNumero}>{numero}</Text>
                        </View>

                        <View style={estilos.textos}>
                            <Text
                                numberOfLines={2}
                                style={[
                                    estilos.periodo,
                                    somenteLeitura && estilos.textoCentralizado
                                ]}
                            >
                                {periodo}
                            </Text>

                            {estaEmAndamento ? (
                                <Text
                                    style={[
                                        estilos.status,
                                        somenteLeitura && estilos.textoCentralizado
                                    ]}
                                >
                                    Em andamento
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    {somenteLeitura ? null : (
                        <View style={estilos.acoes}>
                            <IconButton
                                icone={PencilSimpleIcon}
                                corIcone={tema.escuro ? '#999999' : undefined}
                                aoPressionar={typeof aoEditar === 'function' ? editar : undefined}
                                rotuloAcessibilidade={`Editar ${rotuloDoCiclo.toLowerCase()}`}
                                variante="neutro"
                            />

                            <IconButton
                                icone={TrashIcon}
                                corIcone={tema.escuro ? '#999999' : undefined}
                                aoPressionar={typeof aoExcluir === 'function' ? excluir : undefined}
                                rotuloAcessibilidade={`Excluir ${rotuloDoCiclo.toLowerCase()}`}
                                variante="neutro"
                            />
                        </View>
                    )}
                </View>
            </View>

            <View style={estilos.separador} />

            <View style={estilos.conteudoInferior}>
                <View
                    testID="cycle-history-indicators"
                    style={[
                        estilos.indicadores,
                        somenteLeitura && estilos.indicadoresSomenteLeitura
                    ]}
                >
                    <View
                        accessible
                        accessibilityRole="text"
                        accessibilityLabel={
                            diasMenstruais === null
                                ? 'Dias de menstruação não informados'
                                : `${obterTextoDosDias(diasMenstruais)} de menstruação`
                        }
                        style={[
                            estilos.indicador,
                            somenteLeitura && estilos.indicadorSomenteLeitura,
                            estilos.indicadorMenstruacao
                        ]}
                    >
                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit={somenteLeitura}
                            style={[
                                estilos.valorDoIndicador,
                                somenteLeitura && estilos.valorSomenteLeitura,
                                estilos.textoMenstruacao
                            ]}
                        >
                            {diasMenstruais === null ? '—' : obterTextoDosDias(diasMenstruais)}
                        </Text>

                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.85}
                            style={[estilos.descricaoDoIndicador, estilos.textoMenstruacao]}
                        >
                            menstruação
                        </Text>
                    </View>

                    <View
                        accessible
                        accessibilityRole="text"
                        accessibilityLabel={
                            duracaoDisponivel
                                ? `${obterTextoDosDias(duracaoDias)} de ciclo`
                                : 'Duração do ciclo ainda não disponível'
                        }
                        style={[
                            estilos.indicador,
                            somenteLeitura && estilos.indicadorSomenteLeitura,
                            estilos.indicadorCiclo,
                            !duracaoDisponivel && estilos.indicadorIndisponivel
                        ]}
                    >
                        <ArrowsClockwiseIcon
                            size={16}
                            color={duracaoDisponivel ? coresDoCiclo.ativa : coresDoCiclo.desativada}
                            weight="regular"
                        />

                        <Text
                            numberOfLines={somenteLeitura ? 1 : undefined}
                            adjustsFontSizeToFit={somenteLeitura}
                            style={[
                                estilos.valorDoIndicador,
                                somenteLeitura && estilos.valorSomenteLeitura,
                                estilos.textoCiclo,
                                !duracaoDisponivel && estilos.textoIndisponivel
                            ]}
                        >
                            {duracaoDisponivel ? obterTextoDosDias(duracaoDias) : '—'}
                        </Text>

                        <Text
                            numberOfLines={1}
                            style={[
                                estilos.descricaoDoIndicador,
                                estilos.textoCiclo,
                                !duracaoDisponivel && estilos.textoIndisponivel
                            ]}
                        >
                            ciclo
                        </Text>
                    </View>
                </View>

                {estimativaIncerta ? (
                    <View
                        accessible
                        accessibilityRole="alert"
                        accessibilityLabel="Estimativa incerta. Os dados deste ciclo podem ser imprecisos."
                        style={estilos.aviso}
                    >
                        <WarningCircleIcon size={20} color={corDoAviso} weight="fill" />

                        <View style={estilos.textosDoAviso}>
                            <Text style={estilos.tituloDoAviso}>Estimativa incerta</Text>

                            <Text style={estilos.mensagemDoAviso}>
                                Os dados deste ciclo podem ser imprecisos.
                            </Text>
                        </View>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

export { CycleHistoryCard };
