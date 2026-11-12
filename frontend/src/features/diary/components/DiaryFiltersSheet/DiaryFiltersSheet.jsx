import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import AlertModal from '../../../../shared/components/feedback/Modal/AlertModal/AlertModal';
import { WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { BottomSheetLayout } from '../../../../shared/layouts/BottomSheet/BottomSheetLayout';
import { useDiaryCatalog } from '../../hooks/useDiaryCatalog';
import {
    alternarValorFiltro,
    criarChaveFiltrosDiario,
    criarFiltrosDaEdicao,
    FASES_FILTRO,
    FILTROS_DIARIO_VAZIOS,
    formatarDataFiltro,
    validarPeriodoDiario
} from '../../utils/diaryFilters';
import { DiaryCategoryFilterGroup } from './DiaryCategoryFilterGroup';
import { DiaryFilterDateField } from './DiaryFilterDateField';
import { DiaryFilterSection } from './DiaryFilterSection';
import { criarEstilos } from './DiaryFiltersSheet.styles';
import { DiaryPhaseFilterOption } from './DiaryPhaseFilterOption';

function criarEdicao(filtros = FILTROS_DIARIO_VAZIOS) {
    return {
        dataInicio: formatarDataFiltro(filtros.dataInicio),
        dataFim: formatarDataFiltro(filtros.dataFim),
        categorias: [...(filtros.categorias ?? [])],
        fases: [...(filtros.fases ?? [])]
    };
}

function DiaryFiltersSheet({
    visivel,
    filtros,
    service,
    aplicando = false,
    onAplicar,
    onFechar,
    onSessaoExpirada
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const catalogo = useDiaryCatalog({ ativo: visivel, service, onSessaoExpirada });
    const chaveFiltros = criarChaveFiltrosDiario(filtros);
    const [edicao, setEdicao] = useState(() => criarEdicao(filtros));
    const [expandidas, setExpandidas] = useState({});
    const [erroPeriodo, setErroPeriodo] = useState(null);
    const posicaoRolagem = useRef(0);
    const expansaoInicialAplicada = useRef(false);

    useEffect(() => {
        if (!visivel) return;
        setEdicao(criarEdicao(filtros));
        setExpandidas({});
        setErroPeriodo(null);
        posicaoRolagem.current = 0;
        expansaoInicialAplicada.current = false;
        // A chave evita apagar a edição quando o pai recria um objeto equivalente.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chaveFiltros, visivel]);

    const macrosAtivas = useMemo(
        () =>
            (catalogo.catalogo?.macrocategorias ?? []).filter(
                (macro) =>
                    macro.ativa && macro.categorias.some((categoria) => categoria.ativaEfetiva)
            ),
        [catalogo.catalogo]
    );

    useEffect(() => {
        if (!visivel || expansaoInicialAplicada.current || macrosAtivas.length === 0) return;
        expansaoInicialAplicada.current = true;
        setExpandidas({ [macrosAtivas[0].id]: true });
    }, [macrosAtivas, visivel]);

    const atualizarPosicaoRolagem = useCallback((evento) => {
        posicaoRolagem.current = Math.max(0, evento.nativeEvent.contentOffset.y);
    }, []);
    const podeIniciarDeslize = useCallback(() => posicaoRolagem.current <= 8, []);

    function limpar() {
        setEdicao(criarEdicao());
        setErroPeriodo(null);
    }

    function aplicar() {
        Keyboard.dismiss();
        const erro = validarPeriodoDiario(edicao);
        setErroPeriodo(erro);
        if (erro) return;
        onAplicar?.(criarFiltrosDaEdicao(edicao), catalogo.catalogo);
    }

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            bloquearFechamento={aplicando}
            permitirDeslizarParaFechar
            podeIniciarDeslize={podeIniciarDeslize}
            estiloPainel={estilos.painel}
        >
            <BottomSheetLayout
                titulo="Filtrar Diário"
                onFechar={onFechar}
                bloquearFechamento={aplicando}
                compacto
            >
                <View style={estilos.areaConteudo}>
                    {catalogo.carregando && !catalogo.catalogo ? (
                        <View accessibilityLiveRegion="polite" style={estilos.estadoCentral}>
                            <ActivityIndicator color={tema.cores.interface.destaque} />
                            <Text style={estilos.textoEstado}>Carregando filtros do Diário...</Text>
                        </View>
                    ) : catalogo.catalogo ? (
                        <ScrollView
                            testID="rolagem-filtros-diario"
                            style={estilos.rolagem}
                            contentContainerStyle={estilos.conteudo}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            onScroll={atualizarPosicaoRolagem}
                            scrollEventThrottle={16}
                        >
                            <DiaryFilterSection
                                titulo="Filtro por Período"
                                descricao="Escolha a data de início e/ou a data de fim para filtrar por data."
                                estilos={estilos}
                            >
                                <View style={estilos.camposData}>
                                    <DiaryFilterDateField
                                        rotulo="Data de Início"
                                        rotuloAcessibilidade="Data de início do filtro"
                                        valor={edicao.dataInicio}
                                        aoAlterar={(dataInicio) => {
                                            setEdicao((atual) => ({ ...atual, dataInicio }));
                                            setErroPeriodo(null);
                                        }}
                                        aoLimpar={() =>
                                            setEdicao((atual) => ({ ...atual, dataInicio: '' }))
                                        }
                                        testeId="filtro-data-inicio"
                                        estilos={estilos}
                                        tema={tema}
                                    />
                                    <DiaryFilterDateField
                                        rotulo="Data de Fim"
                                        rotuloAcessibilidade="Data final do filtro"
                                        valor={edicao.dataFim}
                                        aoAlterar={(dataFim) => {
                                            setEdicao((atual) => ({ ...atual, dataFim }));
                                            setErroPeriodo(null);
                                        }}
                                        aoLimpar={() =>
                                            setEdicao((atual) => ({ ...atual, dataFim: '' }))
                                        }
                                        testeId="filtro-data-fim"
                                        estilos={estilos}
                                        tema={tema}
                                    />
                                </View>
                                {erroPeriodo ? (
                                    <Text accessibilityRole="alert" style={estilos.erroPeriodo}>
                                        {erroPeriodo}
                                    </Text>
                                ) : null}
                            </DiaryFilterSection>

                            <DiaryFilterSection
                                titulo="Filtro por Fases"
                                descricao="Selecione as fases do ciclo que você deseja filtrar."
                                estilos={estilos}
                            >
                                <View style={estilos.listaOpcoes}>
                                    {FASES_FILTRO.map((fase) => (
                                        <DiaryPhaseFilterOption
                                            key={fase}
                                            fase={fase}
                                            ativo={edicao.fases.includes(fase)}
                                            aoAlterar={() =>
                                                setEdicao((atual) => ({
                                                    ...atual,
                                                    fases: alternarValorFiltro(atual.fases, fase)
                                                }))
                                            }
                                            estilos={estilos}
                                        />
                                    ))}
                                </View>
                            </DiaryFilterSection>

                            <DiaryFilterSection
                                titulo="Filtro por Categoria"
                                descricao="Selecione as categorias que você deseja filtrar."
                                estilos={estilos}
                            >
                                <View style={estilos.listaOpcoes}>
                                    {macrosAtivas.map((macro) => (
                                        <DiaryCategoryFilterGroup
                                            key={macro.id}
                                            macro={macro}
                                            selecionadas={edicao.categorias}
                                            expandida={Boolean(expandidas[macro.id])}
                                            aoExpandir={() =>
                                                setExpandidas((atuais) => ({
                                                    ...atuais,
                                                    [macro.id]: !atuais[macro.id]
                                                }))
                                            }
                                            aoAlternar={(categoria) =>
                                                setEdicao((atual) => ({
                                                    ...atual,
                                                    categorias: alternarValorFiltro(
                                                        atual.categorias,
                                                        categoria
                                                    )
                                                }))
                                            }
                                            aoAlternarTodas={(categorias, ativa) =>
                                                setEdicao((atual) => {
                                                    const ids = categorias.map(({ id }) => id);
                                                    return {
                                                        ...atual,
                                                        categorias: ativa
                                                            ? [
                                                                  ...new Set([
                                                                      ...atual.categorias,
                                                                      ...ids
                                                                  ])
                                                              ].sort()
                                                            : atual.categorias.filter(
                                                                  (categoria) =>
                                                                      !ids.includes(categoria)
                                                              )
                                                    };
                                                })
                                            }
                                            estilos={estilos}
                                            tema={tema}
                                        />
                                    ))}
                                </View>
                            </DiaryFilterSection>
                        </ScrollView>
                    ) : null}
                </View>

                <View style={estilos.rodape}>
                    <ButtonScreen
                        texto="Limpar"
                        variante="branco"
                        aoPressionar={limpar}
                        desativado={aplicando || !catalogo.catalogo}
                        estilo={estilos.botaoLimpar}
                        estiloTexto={estilos.textoLimpar}
                    />
                    <ButtonScreen
                        texto="Aplicar Filtro"
                        aoPressionar={aplicar}
                        desativado={aplicando || !catalogo.catalogo}
                        carregando={aplicando}
                        estilo={estilos.botaoAplicar}
                    />
                </View>
            </BottomSheetLayout>

            <AlertModal
                erroInterno
                visivel={Boolean(catalogo.erro)}
                aoFechar={onFechar}
                icone={WarningCircleIcon}
                titulo="Algo deu errado"
                mensagem="Não foi possível carregar os filtros no momento. Tente novamente."
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: catalogo.recarregar,
                    carregando: catalogo.carregando
                }}
                acaoSecundaria={{ texto: 'Voltar', variante: 'branco', aoPressionar: onFechar }}
            />
        </BottomSheet>
    );
}

export { criarEdicao, DiaryFiltersSheet };
