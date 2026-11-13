// Exibe sob demanda os dados autorizados de um registro dentro do modal de detalhes.
import { memo, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import ButtonPopup from '../../../../shared/components/common/Button/ButtonPopup/ButtonPopup';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { formatarDataDiario } from '../../utils/diaryDate';
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

// Mede o último elemento real e ignora o padding decorativo no fim do container.
function precisaAtivarRolagem(limiteConteudo, alturaVisivel) {
    return (
        Number.isFinite(limiteConteudo) &&
        Number.isFinite(alturaVisivel) &&
        alturaVisivel > 0 &&
        limiteConteudo > alturaVisivel + 2
    );
}

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

function criarIntroducaoRegistro(detalhe) {
    const dia = detalhe?.ciclo?.dia;
    const numero = detalhe?.ciclo?.numero;
    if (Number.isSafeInteger(dia) && dia > 0 && Number.isSafeInteger(numero) && numero > 0) {
        return `No dia ${dia} do seu ciclo ${String(numero).padStart(2, '0')} você registrou:`;
    }
    return 'Neste dia você registrou:';
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
    acaoEmAndamento = null
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [limiteConteudo, setLimiteConteudo] = useState(0);
    const [alturaVisivel, setAlturaVisivel] = useState(0);
    const detalhe = normalizarDetalhe(registro);
    const bloqueado = acaoEmAndamento !== null;
    const rolagemNecessaria = precisaAtivarRolagem(limiteConteudo, alturaVisivel);

    if (carregando) {
        return (
            <View
                testID="diary-details-loading"
                accessibilityLiveRegion="polite"
                style={estilos.estado}
            >
                <ActivityIndicator color={tema.cores.interface.destaque} />
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
        <ScrollView
            testID="diary-record-details"
            style={estilos.rolagem}
            contentContainerStyle={estilos.container}
            bounces={false}
            nestedScrollEnabled
            scrollEnabled={rolagemNecessaria}
            onLayout={({ nativeEvent }) => setAlturaVisivel(nativeEvent.layout.height)}
            showsVerticalScrollIndicator={false}
        >
            <Text accessibilityRole="header" style={estilos.titulo}>
                Diário
            </Text>
            <DiaryDateNavigator
                data={detalhe.data}
                aoAnterior={aoAnterior}
                aoProximo={aoProximo}
                anteriorDisponivel={typeof aoAnterior === 'function'}
                proximoDisponivel={typeof aoProximo === 'function'}
                desabilitado={bloqueado}
                compacto
            />
            <Text style={estilos.resumoDia}>RESUMO DO DIA</Text>
            <Text style={estilos.introducao}>{criarIntroducaoRegistro(detalhe)}</Text>

            <View style={estilos.categorias}>
                {detalhe.categorias.map((categoria) => (
                    <DiaryRecordCategorySection
                        key={categoria.id}
                        categoria={categoria}
                        estilos={estilos}
                        cor={tema.cores.interface.destaque}
                    />
                ))}
            </View>

            <DiaryRecordActions
                registro={registro}
                dataFormatada={detalhe.dataFormatada}
                aoEditar={aoEditar}
                aoExcluir={aoExcluir}
                bloqueado={bloqueado}
                estilos={estilos}
            />

            <DiaryPhaseBadge
                fase={detalhe.fase}
                estilo={estilos.faseRegistro}
                estiloTexto={estilos.textoFaseRegistro}
                tamanhoIcone={13}
            />
            <View
                testID="diary-details-end"
                collapsable={false}
                style={estilos.areaBotaoOk}
                onLayout={({ nativeEvent }) => {
                    const { y, height } = nativeEvent.layout;
                    setLimiteConteudo(y + height);
                }}
            >
                <ButtonPopup
                    texto="OK"
                    variante="verde"
                    aoPressionar={aoFechar}
                    desativado={bloqueado}
                    estilo={estilos.botaoOk}
                    estiloTexto={estilos.textoBotaoOk}
                />
            </View>
        </ScrollView>
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
    precisaAtivarRolagem,
    valorEscalado
};
