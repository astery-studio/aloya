// Exibe sob demanda os dados autorizados de um registro dentro do modal de detalhes.
import { memo, useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import ButtonPopup from '../../../../shared/components/common/Button/ButtonPopup/ButtonPopup';
import { RepeatIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterCoresDiario } from '../../config/diaryColors';
import { formatarDataDiario } from '../../utils/diaryDate';
import { obterApresentacaoFase } from '../../utils/diaryPhasePresentation';
import { DiaryDateNavigator } from '../DiaryDateNavigator/DiaryDateNavigator';
import { DiaryPhaseBadge } from '../DiaryPhaseBadge/DiaryPhaseBadge';
import { DiaryRecordActions, criarEstiloBotaoAcao } from '../DiaryRecordActions/DiaryRecordActions';
import {
    DiaryRecordCategorySection,
    formatarDuracao,
    obterCoresCategoria,
    valorEscalado
} from '../DiaryRecordCategorySection/DiaryRecordCategorySection';
import { criarEstilos } from './DiaryRecordDetails.styles';

// Valida a identidade e prepara as categorias do detalhe sem persistir dados.
function normalizarDetalhe(registro) {
    if (!registro || typeof registro !== 'object' || Array.isArray(registro)) return null;
    const dataFormatada = formatarDataDiario(registro.data);
    if (!Number.isSafeInteger(registro.id) || registro.id <= 0 || !dataFormatada) return null;
    return {
        ...registro,
        dataFormatada,
        categorias: Array.isArray(registro.categorias)
            ? registro.categorias.filter(
                  (categoria) =>
                      categoria &&
                      typeof categoria === 'object' &&
                      typeof categoria.id === 'string' &&
                      typeof categoria.nome === 'string'
              )
            : []
    };
}

function criarIntroducaoRegistro(detalhe, nome) {
    const dia = detalhe?.ciclo?.dia;
    const numero = detalhe?.ciclo?.numero;
    if (Number.isSafeInteger(dia) && dia > 0 && Number.isSafeInteger(numero) && numero > 0) {
        const cicloFormatado = String(numero).padStart(2, '0');
        if (nome) {
            return `No dia ${String(dia).padStart(2, '0')} do ciclo ${cicloFormatado} ${nome} registrou:`;
        }
        return `No dia ${dia} do seu ciclo ${cicloFormatado} você registrou:`;
    }
    return `Neste dia ${nome || 'você'} registrou:`;
}

// Compõe loading, erro ou conteúdo completo e devolve as ações disponíveis.
function DiaryRecordDetails({
    registro,
    carregando = false,
    erro,
    aoTentarNovamente,
    aoEditar,
    aoExcluir,
    aoFechar,
    aoAnterior,
    aoProximo,
    acaoEmAndamento = null,
    nomeTitular,
    somenteLeitura = false
}) {
    const tema = useTheme();
    const cores = obterCoresDiario(tema).interface;
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const detalhe = normalizarDetalhe(registro);
    const nome = typeof nomeTitular === 'string' ? nomeTitular.trim() : '';
    const bloqueado = acaoEmAndamento !== null;
    const apresentacaoFase = obterApresentacaoFase(detalhe?.fase, tema);
    const fundoFase =
        !tema.escuro && ['ovulacao', 'ovulatoria'].includes(detalhe?.fase)
            ? 'rgba(74, 117, 142, 0.20)'
            : apresentacaoFase?.fundo;

    if (carregando) {
        return (
            <View
                testID="diary-details-loading"
                accessibilityLiveRegion="polite"
                style={estilos.estado}
            >
                <ActivityIndicator color={cores.destaque} />
                <Text style={estilos.mensagemEstado}>Carregando registro...</Text>
            </View>
        );
    }

    if (typeof erro === 'string' && erro.trim()) {
        return (
            <View accessibilityRole="alert" style={estilos.estado}>
                <Text style={estilos.tituloErro}>Algo deu errado</Text>
                <Text style={estilos.mensagemEstado}>{erro.trim()}</Text>
                {typeof aoTentarNovamente === 'function' ? (
                    <ButtonPopup
                        texto="Tentar novamente"
                        variante="preto"
                        aoPressionar={aoTentarNovamente}
                    />
                ) : null}
                <ButtonPopup texto="Voltar" variante="branco" aoPressionar={aoFechar} />
            </View>
        );
    }

    if (!detalhe) return null;

    return (
        <View testID="diary-record-details" style={estilos.detalhes}>
            <View testID="diary-details-header" style={estilos.cabecalhoFixo}>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    {nome ? `Diário de ${nome}` : 'Diário'}
                </Text>
                <DiaryDateNavigator
                    data={detalhe.data}
                    aoAnterior={aoAnterior}
                    aoProximo={aoProximo}
                    anteriorDisponivel={typeof aoAnterior === 'function'}
                    proximoDisponivel={typeof aoProximo === 'function'}
                    ocultarSetasIndisponiveis={somenteLeitura}
                    desabilitado={bloqueado}
                    compacto
                    estiloContainer={estilos.navegadorData}
                    estiloTexto={estilos.textoData}
                />
            </View>

            <ScrollView
                testID="diary-details-scroll"
                style={estilos.rolagem}
                contentContainerStyle={estilos.conteudoRolavel}
                bounces={false}
                nestedScrollEnabled
                scrollEnabled
                showsVerticalScrollIndicator={false}
            >
                <Text style={estilos.resumoDia}>RESUMO DO DIA</Text>
                <Text style={estilos.introducao}>
                    {somenteLeitura && !nome
                        ? 'Registros compartilhados deste dia:'
                        : criarIntroducaoRegistro(detalhe, nome)}
                </Text>

                <View style={estilos.categorias}>
                    {detalhe.categorias.map((categoria) => (
                        <DiaryRecordCategorySection
                            key={categoria.id}
                            categoria={categoria}
                            estilos={estilos}
                            cor={cores.destaque}
                        />
                    ))}
                </View>

                {somenteLeitura ? null : (
                    <DiaryRecordActions
                        registro={registro}
                        dataFormatada={detalhe.dataFormatada}
                        aoEditar={aoEditar}
                        aoExcluir={aoExcluir}
                        bloqueado={bloqueado}
                        estilos={estilos}
                    />
                )}

                <DiaryPhaseBadge
                    fase={detalhe.fase}
                    estilo={estilos.faseRegistro}
                    estiloTexto={estilos.textoFaseRegistro}
                    tamanhoIcone={13}
                    larguraIcone={13}
                    alturaIcone={13}
                    icone={RepeatIcon}
                    cor={apresentacaoFase?.cor}
                    fundo={fundoFase}
                />
            </ScrollView>

            <View testID="diary-details-footer" style={estilos.areaBotaoOk}>
                <ButtonPopup
                    texto="OK"
                    variante="verde"
                    aoPressionar={aoFechar}
                    desativado={bloqueado}
                    estilo={estilos.botaoOk}
                    estiloTexto={estilos.textoBotaoOk}
                />
            </View>
        </View>
    );
}

const MemoizedDiaryRecordDetails = memo(DiaryRecordDetails);

export {
    MemoizedDiaryRecordDetails as DiaryRecordDetails,
    criarEstiloBotaoAcao,
    criarIntroducaoRegistro,
    formatarDuracao,
    normalizarDetalhe,
    obterCoresCategoria,
    valorEscalado
};
