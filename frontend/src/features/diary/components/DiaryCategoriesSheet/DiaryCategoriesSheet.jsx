import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import AlertModal from '../../../../shared/components/feedback/Modal/AlertModal/AlertModal';
import SwitchField from '../../../../shared/components/forms/SwitchField/SwitchField';
import { WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { BottomSheetLayout } from '../../../../shared/layouts/BottomSheet/BottomSheetLayout';
import { obterApresentacaoMacrocategoria } from '../../config/diaryMacroPresentation';
import { useDiaryCategoryPreferences } from '../../hooks/useDiaryCategoryPreferences';
import { DiaryMacrocategoryAccordion } from '../DiaryMacrocategoryAccordion/DiaryMacrocategoryAccordion';
import { criarEstilos } from './DiaryCategoriesSheet.styles';

function MacrocategoryPreference({
    macro,
    expandida,
    salvando,
    estilos,
    aoExpandir,
    aoMacro,
    aoCategoria
}) {
    const apresentacao = obterApresentacaoMacrocategoria(macro.id);
    const bloqueado = Boolean(salvando);

    return (
        <DiaryMacrocategoryAccordion
            testID={`preferencia-macro-${macro.id}`}
            titulo={macro.nome}
            icone={apresentacao.icone}
            iconeProps={apresentacao.iconeProps}
            paleta={apresentacao.paleta}
            expandido={expandida}
            aoAlternar={aoExpandir}
            desabilitado={bloqueado}
            acessorio={
                <SwitchField
                    somenteControle
                    ativo={macro.ativa}
                    desabilitado={bloqueado}
                    aoAlterar={(ativa) => aoMacro(macro.id, ativa)}
                    rotuloAcessibilidade={`${macro.ativa ? 'Desativar' : 'Ativar'} ${macro.nome}`}
                />
            }
        >
            {macro.categorias.map((categoria) => {
                const categoriaBloqueada = bloqueado || !macro.ativa;
                return (
                    <View key={categoria.id} style={estilos.categoria}>
                        <Text
                            style={[
                                estilos.nomeCategoria,
                                categoriaBloqueada && estilos.nomeCategoriaDesativada
                            ]}
                        >
                            {categoria.nome}
                        </Text>
                        <SwitchField
                            somenteControle
                            ativo={macro.ativa && categoria.ativaIndividual}
                            desabilitado={categoriaBloqueada}
                            aoAlterar={(ativa) => aoCategoria(categoria.id, ativa)}
                            rotuloAcessibilidade={`${categoria.ativaIndividual ? 'Desativar' : 'Ativar'} ${categoria.nome}`}
                        />
                    </View>
                );
            })}
        </DiaryMacrocategoryAccordion>
    );
}

function DiaryCategoriesSheet({ visivel, service, onFechar, onAlterado, onSessaoExpirada }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const preferencias = useDiaryCategoryPreferences({
        ativo: visivel,
        service,
        onSessaoExpirada
    });
    const [expandidas, setExpandidas] = useState({});
    const posicaoRolagem = useRef(0);
    const houveAlteracao = useRef(false);
    const macros = preferencias.catalogo?.macrocategorias ?? [];
    const totalAtivas = macros.filter((macro) => macro.ativa).length;
    const bloqueado = Boolean(preferencias.salvando);

    useEffect(() => {
        if (visivel) {
            setExpandidas({});
            houveAlteracao.current = false;
        }
    }, [visivel]);

    const fechar = useCallback(() => {
        if (houveAlteracao.current) {
            houveAlteracao.current = false;
            onAlterado?.();
        }
        onFechar?.();
    }, [onAlterado, onFechar]);

    function alternarExpansao(id) {
        setExpandidas((estado) => ({ ...estado, [id]: !estado[id] }));
    }

    async function alterarMacrocategoria(id, ativa) {
        if (await preferencias.alterarMacrocategoria(id, ativa)) houveAlteracao.current = true;
    }

    async function alterarCategoria(id, ativa) {
        if (await preferencias.alterarCategoria(id, ativa)) houveAlteracao.current = true;
    }

    const atualizarPosicaoRolagem = useCallback((evento) => {
        posicaoRolagem.current = Math.max(0, evento.nativeEvent.contentOffset.y);
    }, []);
    const podeIniciarDeslize = useCallback(() => posicaoRolagem.current <= 8, []);
    const fecharErro = preferencias.erroCarregamento ? fechar : preferencias.fecharErro;

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={fechar}
            bloquearFechamento={bloqueado}
            permitirDeslizarParaFechar
            podeIniciarDeslize={podeIniciarDeslize}
            estiloPainel={estilos.painel}
        >
            <BottomSheetLayout
                titulo="Gerências Categorias"
                onFechar={fechar}
                bloquearFechamento={bloqueado}
                compacto
            >
                <View style={estilos.areaConteudo}>
                    {preferencias.carregando && !preferencias.catalogo ? (
                        <View accessibilityLiveRegion="polite" style={estilos.estadoCentral}>
                            <ActivityIndicator color={tema.cores.interface.destaque} />
                            <Text style={estilos.textoEstado}>
                                Carregando categorias do Diário...
                            </Text>
                        </View>
                    ) : preferencias.catalogo ? (
                        <ScrollView
                            testID="rolagem-categorias-diario"
                            style={estilos.rolagem}
                            contentContainerStyle={estilos.conteudo}
                            showsVerticalScrollIndicator={false}
                            scrollEventThrottle={16}
                            onScroll={atualizarPosicaoRolagem}
                        >
                            <View style={estilos.painelCategorias}>
                                <Text style={estilos.tituloPainel}>Categorias do Diário</Text>
                                <View accessibilityLiveRegion="polite" style={estilos.contador}>
                                    {preferencias.salvando ? (
                                        <ActivityIndicator
                                            testID="salvando-preferencia-diario"
                                            size="small"
                                            color={tema.cores.interface.destaque}
                                        />
                                    ) : null}
                                    <Text style={estilos.textoContador}>
                                        {totalAtivas} / {macros.length} ativos
                                    </Text>
                                </View>
                                <Text style={estilos.descricao}>
                                    Selecione as opções que você deseja ver no seu diário. Você pode
                                    alterar essa configuração a qualquer momento.
                                </Text>
                                <View style={estilos.lista}>
                                    {macros.map((macro) => (
                                        <MacrocategoryPreference
                                            key={macro.id}
                                            macro={macro}
                                            expandida={Boolean(expandidas[macro.id])}
                                            salvando={preferencias.salvando}
                                            estilos={estilos}
                                            aoExpandir={() => alternarExpansao(macro.id)}
                                            aoMacro={alterarMacrocategoria}
                                            aoCategoria={alterarCategoria}
                                        />
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    ) : null}
                </View>

                <View testID="rodape-categorias-diario" style={estilos.rodape}>
                    <ButtonScreen
                        texto="Salvar"
                        aoPressionar={fechar}
                        desativado={bloqueado || !preferencias.catalogo}
                        carregando={bloqueado}
                        estilo={estilos.botaoSalvar}
                    />
                </View>
            </BottomSheetLayout>

            <AlertModal
                erroInterno
                visivel={Boolean(preferencias.erro)}
                aoFechar={fecharErro}
                icone={WarningCircleIcon}
                titulo="Algo deu errado"
                mensagem={preferencias.erro || ''}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: preferencias.tentarNovamente,
                    carregando: preferencias.carregando || bloqueado
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: fecharErro
                }}
            />
        </BottomSheet>
    );
}

export { DiaryCategoriesSheet, MacrocategoryPreference };
