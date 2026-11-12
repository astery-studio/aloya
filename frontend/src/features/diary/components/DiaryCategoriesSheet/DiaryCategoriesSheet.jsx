import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import AlertModal from '../../../../shared/components/feedback/Modal/AlertModal/AlertModal';
import SwitchField from '../../../../shared/components/forms/SwitchField/SwitchField';
import {
    CaretDownIcon,
    CaretUpIcon,
    WarningCircleIcon
} from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { BottomSheetLayout } from '../../../../shared/layouts/BottomSheet/BottomSheetLayout';
import { obterApresentacaoMacrocategoria } from '../../config/diaryMacroPresentation';
import { useDiaryCategoryPreferences } from '../../hooks/useDiaryCategoryPreferences';
import { criarEstilos } from './DiaryCategoriesSheet.styles';

function MacrocategoryPreference({
    macro,
    expandida,
    salvando,
    estilos,
    tema,
    aoExpandir,
    aoMacro,
    aoCategoria
}) {
    const apresentacao = obterApresentacaoMacrocategoria(macro.id);
    const paleta = tema.cores.redeApoio[apresentacao.paleta];
    const Icone = apresentacao.icone;
    const IconeExpansao = expandida ? CaretUpIcon : CaretDownIcon;
    const bloqueado = Boolean(salvando);

    return (
        <View
            testID={`preferencia-macro-${macro.id}`}
            style={[
                estilos.macro,
                expandida && estilos.macroExpandida,
                expandida && { borderColor: paleta.bordaExpandida }
            ]}
        >
            <View
                style={[
                    estilos.macroCabecalho,
                    expandida && { backgroundColor: paleta.fundoDiarioExpandido }
                ]}
            >
                <Pressable
                    onPress={aoExpandir}
                    accessibilityRole="button"
                    accessibilityLabel={`${expandida ? 'Recolher' : 'Expandir'} ${macro.nome}`}
                    accessibilityState={{ expanded: expandida }}
                    style={({ pressed }) => [estilos.expansao, pressed && estilos.pressionado]}
                >
                    <View style={[estilos.caixaIcone, { backgroundColor: paleta.fundoIcone }]}>
                        <Icone
                            size={18}
                            color={paleta.icone}
                            weight={apresentacao.iconeProps?.weight ?? 'regular'}
                        />
                    </View>
                    <Text
                        style={[estilos.nomeMacro, expandida && { color: paleta.icone }]}
                        numberOfLines={2}
                    >
                        {macro.nome}
                    </Text>
                    <IconeExpansao size={18} color={expandida ? paleta.icone : '#A8A49C'} />
                </Pressable>

                <SwitchField
                    somenteControle
                    ativo={macro.ativa}
                    desabilitado={bloqueado}
                    aoAlterar={(ativa) => aoMacro(macro.id, ativa)}
                    rotuloAcessibilidade={`${macro.ativa ? 'Desativar' : 'Ativar'} ${macro.nome}`}
                />
            </View>

            {expandida ? (
                <View style={estilos.categorias}>
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
                </View>
            ) : null}
        </View>
    );
}

function DiaryCategoriesSheet({ visivel, service, onFechar, onSessaoExpirada }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const preferencias = useDiaryCategoryPreferences({
        ativo: visivel,
        service,
        onSessaoExpirada
    });
    const [expandidas, setExpandidas] = useState({});
    const posicaoRolagem = useRef(0);
    const macros = preferencias.catalogo?.macrocategorias ?? [];
    const totalAtivas = macros.filter((macro) => macro.ativa).length;
    const bloqueado = Boolean(preferencias.salvando);

    useEffect(() => {
        if (visivel) setExpandidas({});
    }, [visivel]);

    function alternarExpansao(id) {
        setExpandidas((estado) => ({ ...estado, [id]: !estado[id] }));
    }

    const atualizarPosicaoRolagem = useCallback((evento) => {
        posicaoRolagem.current = Math.max(0, evento.nativeEvent.contentOffset.y);
    }, []);
    const podeIniciarDeslize = useCallback(() => posicaoRolagem.current <= 8, []);
    const fecharErro = preferencias.erroCarregamento ? onFechar : preferencias.fecharErro;

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            bloquearFechamento={bloqueado}
            permitirDeslizarParaFechar
            podeIniciarDeslize={podeIniciarDeslize}
            estiloPainel={estilos.painel}
        >
            <BottomSheetLayout
                titulo="Gerências Categorias"
                onFechar={onFechar}
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
                                            tema={tema}
                                            aoExpandir={() => alternarExpansao(macro.id)}
                                            aoMacro={preferencias.alterarMacrocategoria}
                                            aoCategoria={preferencias.alterarCategoria}
                                        />
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    ) : null}
                </View>

                <View style={estilos.rodape}>
                    <ButtonScreen
                        texto="Salvar"
                        aoPressionar={onFechar}
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
