// Exibe sob demanda os dados autorizados de um registro dentro do modal de detalhes.
import { memo, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import ButtonPopup from '../../../../shared/components/common/Button/ButtonPopup/ButtonPopup';
import { PencilSimpleIcon, TrashIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterApresentacaoOpcao } from '../../config/diaryOptionPresentation';
import { formatarDataDiario } from '../../utils/diaryDate';
import { DiaryDateNavigator } from '../DiaryDateNavigator/DiaryDateNavigator';
import { DiaryOptionIcon } from '../DiaryOptionIcon/DiaryOptionIcon';
import { DiaryPhaseBadge } from '../DiaryPhaseBadge/DiaryPhaseBadge';
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

// Recebe minutos inteiros e retorna uma duração legível ou nula.
function formatarDuracao(minutos) {
    if (!Number.isSafeInteger(minutos) || minutos <= 0) return null;
    const horas = Math.floor(minutos / 60);
    const restante = minutos % 60;
    const textoMinutos = `${restante} ${restante === 1 ? 'minuto' : 'minutos'}`;
    if (!horas) return textoMinutos;
    if (!restante) return horas === 1 ? '1 hora' : `${horas} horas`;
    return `${horas} ${horas === 1 ? 'hora' : 'horas'} e ${textoMinutos}`;
}

// Formata valores escalares autorizados com sua unidade de apresentação.
function valorEscalado(categoria) {
    if (typeof categoria?.valor !== 'string' || !categoria.valor.trim()) return null;
    const unidades = { temperatura_basal: '°C', peso: 'kg' };
    const unidade = unidades[categoria.id];
    return unidade ? `${categoria.valor.trim()} ${unidade}` : categoria.valor.trim();
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

// Renderiza uma opção autorizada com ícone e rótulo acessível.
function Opcao({ categoriaId, opcao, estilos, cores }) {
    const apresentacao = obterApresentacaoOpcao(categoriaId, opcao);
    return (
        <View style={[estilos.chip, { backgroundColor: cores.fundo }]}>
            {apresentacao ? (
                <DiaryOptionIcon
                    iconeId={apresentacao.iconeId}
                    tamanho={10.89}
                    cor={apresentacao.iconeProps?.color ?? cores.texto}
                    weight={apresentacao.iconeProps?.weight}
                />
            ) : null}
            <Text style={[estilos.textoChip, { color: cores.texto }]}>{opcao.nome}</Text>
        </View>
    );
}

// Reproduz as famílias cromáticas do protótipo sem inferir conteúdo clínico.
function obterCoresCategoria(categoriaId, corPadrao, macrocategoria = '') {
    const macroNormalizada = macrocategoria
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    if (macroNormalizada.includes('ciclo')) {
        return { fundo: 'rgba(200, 90, 68, 0.1)', texto: '#C85A44' };
    }
    if (macroNormalizada.includes('corpo')) {
        return { fundo: 'rgba(44, 76, 59, 0.1)', texto: '#2C4C3B' };
    }
    if (macroNormalizada.includes('emocional')) {
        return { fundo: 'rgba(123, 94, 167, 0.1)', texto: '#7B5EA7' };
    }
    if (macroNormalizada.includes('energia')) {
        return { fundo: 'rgba(176, 125, 42, 0.1)', texto: '#B07D2A' };
    }
    if (macroNormalizada.includes('intima')) {
        return { fundo: 'rgba(176, 74, 112, 0.1)', texto: '#B04A70' };
    }
    if (macroNormalizada.includes('saude')) {
        return { fundo: 'rgba(74, 88, 153, 0.1)', texto: '#4A5899' };
    }
    if (categoriaId === 'sintomas_pre_menstruais') {
        return { fundo: '#F1EAF8', texto: '#8761A8' };
    }
    if (['vida_social', 'atividade_sexual', 'desejo_libido'].includes(categoriaId)) {
        return { fundo: '#F8E8EE', texto: '#B44F78' };
    }
    return { fundo: '#E8EFEB', texto: corPadrao };
}

function criarEstiloBotaoAcao(estilos, bloqueado, pressionado) {
    return [
        estilos.botaoAcao,
        bloqueado ? estilos.botaoAcaoDesativado : null,
        pressionado ? estilos.pressionado : null
    ];
}

// Renderiza uma categoria do detalhe conforme o tipo de valor retornado pela API.
function Categoria({ categoria, estilos, cor }) {
    const anotacao = categoria.id === 'anotacao_livre' ? categoria.texto : null;
    const duracao = formatarDuracao(categoria.duracaoMinutos);
    const valor = valorEscalado(categoria);
    const opcoes = Array.isArray(categoria.opcoes)
        ? categoria.opcoes.filter((opcao) => opcao && typeof opcao.nome === 'string')
        : [];
    const cores = obterCoresCategoria(categoria.id, cor, categoria.macrocategoria);

    if (!anotacao && !duracao && !valor && opcoes.length === 0) return null;

    return (
        <View style={estilos.categoria}>
            <View style={estilos.tituloCategoriaLinha}>
                <View style={estilos.separador} />
                <Text accessibilityRole="header" style={estilos.tituloCategoria}>
                    {categoria.nome.toUpperCase()}
                </Text>
                <View style={estilos.separador} />
            </View>
            {opcoes.length ? (
                <View style={estilos.chips}>
                    {opcoes.map((opcao, indice) => (
                        <Opcao
                            key={`${opcao.id ?? opcao.nome}-${indice}`}
                            categoriaId={categoria.id}
                            opcao={opcao}
                            estilos={estilos}
                            cores={cores}
                        />
                    ))}
                </View>
            ) : null}
            {duracao || valor ? (
                <View style={estilos.chips}>
                    <View style={[estilos.chip, { backgroundColor: cores.fundo }]}>
                        <Text style={[estilos.textoChip, { color: cores.texto }]}>
                            {duracao ?? valor}
                        </Text>
                    </View>
                </View>
            ) : null}
            {anotacao ? (
                <Text accessibilityLabel={`Anotação do dia: ${anotacao}`} style={estilos.anotacao}>
                    {anotacao}
                </Text>
            ) : null}
        </View>
    );
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
                    <Categoria
                        key={categoria.id}
                        categoria={categoria}
                        estilos={estilos}
                        cor={tema.cores.interface.destaque}
                    />
                ))}
            </View>

            {typeof aoEditar === 'function' || typeof aoExcluir === 'function' ? (
                <View style={estilos.alteracao}>
                    <Text style={[estilos.resumoDia, estilos.tituloAlteracao]}>
                        ALTERAÇÃO DO REGISTRO
                    </Text>
                    <Text style={estilos.textoAlteracao}>
                        Você pode alterar as informações desse registro por meio das opções:
                    </Text>
                    <View style={estilos.acoes}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Editar registro de ${detalhe.dataFormatada}`}
                            accessibilityState={{
                                disabled: bloqueado || typeof aoEditar !== 'function'
                            }}
                            disabled={bloqueado || typeof aoEditar !== 'function'}
                            onPress={() => aoEditar?.(registro)}
                            style={({ pressed }) =>
                                criarEstiloBotaoAcao(
                                    estilos,
                                    bloqueado || typeof aoEditar !== 'function',
                                    pressed
                                )
                            }
                        >
                            <PencilSimpleIcon size={13} color="#FFFFFF" />
                            <Text style={estilos.textoBotaoAcao}>Editar</Text>
                        </Pressable>
                        {typeof aoExcluir === 'function' ? (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Excluir registro de ${detalhe.dataFormatada}`}
                                accessibilityState={{ disabled: bloqueado }}
                                disabled={bloqueado}
                                onPress={() => aoExcluir(registro)}
                                style={({ pressed }) =>
                                    criarEstiloBotaoAcao(estilos, bloqueado, pressed)
                                }
                            >
                                <TrashIcon size={13} color="#FFFFFF" />
                                <Text style={estilos.textoBotaoAcao}>Excluir</Text>
                            </Pressable>
                        ) : null}
                    </View>
                </View>
            ) : null}

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
