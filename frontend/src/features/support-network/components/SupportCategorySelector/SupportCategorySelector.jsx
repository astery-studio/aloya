//Apresenta um acordeão para selecionar uma categoria de permissão existente.
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import {
    CaretDownIcon,
    CaretUpIcon,
    CheckCircleIcon,
    CircleIcon,
    UsersThreeIcon
} from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './SupportCategorySelector.styles';

function idCategoriaEhValido(id) {
    return (Number.isSafeInteger(id) && id > 0) || (typeof id === 'string' && id.trim().length > 0);
}

function normalizarCategorias(categorias) {
    if (!Array.isArray(categorias)) {
        return [];
    }

    const identificadores = new Set();

    return categorias
        .filter((categoria) => {
            const idValido = idCategoriaEhValido(categoria?.id);
            const nomeValido =
                typeof categoria?.nome === 'string' && categoria.nome.trim().length > 0;

            if (!idValido || !nomeValido) {
                return false;
            }

            const chave = String(categoria.id);

            if (identificadores.has(chave)) {
                return false;
            }

            identificadores.add(chave);
            return true;
        })
        .map((categoria) => ({
            id: categoria.id,
            nome: categoria.nome.trim()
        }))
        .sort((primeira, segunda) =>
            primeira.nome.localeCompare(segunda.nome, 'pt-BR', {
                sensitivity: 'base'
            })
        );
}

function idsIguais(primeiroId, segundoId) {
    return (
        idCategoriaEhValido(primeiroId) &&
        idCategoriaEhValido(segundoId) &&
        String(primeiroId) === String(segundoId)
    );
}

function SupportCategorySelector({
    categorias = [],
    categoriaId = null,
    aoSelecionar,
    carregando = false,
    erro = null,
    aoTentarNovamente,
    desabilitado = false,
    inicialmenteExpandido = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const [expandido, definirExpandido] = useState(inicialmenteExpandido === true);

    const categoriasValidas = useMemo(() => normalizarCategorias(categorias), [categorias]);

    const mensagemErro = typeof erro === 'string' && erro.trim().length > 0 ? erro.trim() : null;

    const selecaoBloqueada = desabilitado || carregando || typeof aoSelecionar !== 'function';

    const cabecalhoBloqueado = desabilitado;
    const IconeExpansao = expandido ? CaretUpIcon : CaretDownIcon;

    function alternarExpansao() {
        if (!cabecalhoBloqueado) {
            definirExpandido((valorAtual) => !valorAtual);
        }
    }

    function selecionarCategoria(id) {
        if (selecaoBloqueada) {
            return;
        }

        aoSelecionar(idsIguais(id, categoriaId) ? null : id);
    }

    function tentarNovamente() {
        if (!desabilitado && !carregando && typeof aoTentarNovamente === 'function') {
            aoTentarNovamente();
        }
    }

    function renderizarConteudo() {
        if (carregando) {
            return (
                <View style={estilos.estado}>
                    <ActivityIndicator
                        accessibilityLabel="Carregando categorias"
                        color={tema.cores.interface.destaque}
                        size="small"
                    />

                    <Text style={estilos.textoEstado}>Carregando categorias...</Text>
                </View>
            );
        }

        if (mensagemErro) {
            return (
                <View style={estilos.estado}>
                    <Text
                        accessible
                        accessibilityRole="alert"
                        accessibilityLabel={mensagemErro}
                        style={estilos.textoErro}
                    >
                        {mensagemErro}
                    </Text>

                    {typeof aoTentarNovamente === 'function' ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Tentar carregar categorias novamente"
                            disabled={desabilitado}
                            onPress={tentarNovamente}
                            style={({ pressed }) => [
                                estilos.botaoTentarNovamente,
                                pressed && !desabilitado && estilos.pressionado,
                                desabilitado && estilos.desabilitado
                            ]}
                        >
                            <Text style={estilos.textoBotao}>Tentar novamente</Text>
                        </Pressable>
                    ) : null}
                </View>
            );
        }

        if (categoriasValidas.length === 0) {
            return (
                <View style={estilos.estado}>
                    <Text style={estilos.textoEstado}>Você ainda não criou nenhuma categoria.</Text>
                </View>
            );
        }

        return (
            <ScrollView
                testID="support-category-options-scroll"
                accessibilityRole="radiogroup"
                accessibilityLabel="Categorias disponíveis"
                style={estilos.lista}
                contentContainerStyle={estilos.conteudoLista}
                nestedScrollEnabled
                bounces={false}
                showsVerticalScrollIndicator={categoriasValidas.length > 4}
            >
                {categoriasValidas.map((categoria) => {
                    const selecionada = idsIguais(categoria.id, categoriaId);

                    return (
                        <Pressable
                            key={String(categoria.id)}
                            accessibilityRole="radio"
                            accessibilityLabel={categoria.nome}
                            accessibilityState={{
                                selected: selecionada,
                                disabled: selecaoBloqueada
                            }}
                            disabled={selecaoBloqueada}
                            onPress={() => selecionarCategoria(categoria.id)}
                            style={({ pressed }) => [
                                estilos.opcaoCategoria,
                                pressed && !selecaoBloqueada && estilos.pressionado,
                                selecaoBloqueada && estilos.desabilitado
                            ]}
                        >
                            <View style={estilos.containerTextoOpcao}>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={estilos.textoOpcao}
                                >
                                    {categoria.nome}
                                </Text>
                            </View>

                            {selecionada ? (
                                <CheckCircleIcon
                                    testID={`categoria-selecionada-${categoria.id}`}
                                    size={22}
                                    color="#2C4C3B"
                                    weight="fill"
                                />
                            ) : (
                                <CircleIcon
                                    testID={`categoria-nao-selecionada-${categoria.id}`}
                                    size={22}
                                    color="#D8D4CC"
                                    weight="regular"
                                />
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>
        );
    }

    return (
        <View
            testID="support-category-selector"
            style={[
                estilos.container,
                expandido && estilos.containerExpandido,
                desabilitado && estilos.desabilitado
            ]}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Categorias Cadastradas"
                accessibilityHint={
                    expandido
                        ? 'Recolhe as categorias cadastradas'
                        : 'Mostra as categorias cadastradas'
                }
                accessibilityState={{
                    expanded: expandido,
                    disabled: cabecalhoBloqueado
                }}
                disabled={cabecalhoBloqueado}
                onPress={alternarExpansao}
                style={({ pressed }) => [
                    estilos.cabecalho,
                    expandido && estilos.cabecalhoExpandido,
                    pressed && !cabecalhoBloqueado && estilos.pressionado
                ]}
            >
                <View style={estilos.caixaIcone}>
                    <UsersThreeIcon
                        testID="icone-categorias-cadastradas"
                        size={18}
                        color={tema.cores.interface.destaque}
                        weight="regular"
                    />
                </View>

                <Text
                    numberOfLines={1}
                    style={[estilos.titulo, expandido && estilos.tituloExpandido]}
                >
                    Categorias Cadastradas
                </Text>

                <IconeExpansao
                    testID={expandido ? 'icone-recolher-categorias' : 'icone-expandir-categorias'}
                    size={18}
                    color={tema.cores.interface.destaque}
                    weight="regular"
                />
            </Pressable>

            {expandido ? <View style={estilos.conteudo}>{renderizarConteudo()}</View> : null}
        </View>
    );
}

export { SupportCategorySelector, idCategoriaEhValido, idsIguais, normalizarCategorias };
