//Mostra um grupo expansível de permissões com ícone, contador e controle geral.
import { memo, useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import SwitchField from '../../../shared/components/forms/SwitchField/SwitchField';
import {
    CaretDownIcon,
    CaretUpIcon,
    DropIcon,
    FirstAidKitIcon,
    HeartIcon,
    LightningIcon,
    PersonArmsSpreadIcon,
    UsersIcon
} from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import PermissionItem from './PermissionItem';
import { criarEstilos } from './PermissionGroup.styles';

//Recebe o nome da paleta e devolve somente uma paleta conhecida pelo aplicativo.
function obterPaleta(paleta, tema) {
    const paletasDosGrupos = tema.cores.redeApoio;
    const paletaBase = paletasDosGrupos[paleta] ?? paletasDosGrupos.ciclo;

    if (!tema.escuro) return paletaBase;

    const coresEscuras = {
        ciclo: '#F08A75',
        corpo: '#9FD6B6',
        emocional: '#C7A7E8',
        energia: '#F2B45F',
        vidaIntima: '#E59ABB',
        saude: '#AEBBEF'
    };
    const cor = coresEscuras[paleta] ?? coresEscuras.ciclo;

    return {
        ...paletaBase,
        icone: cor,
        fundoIcone: tema.cores.interface.superficieElevada,
        fundoExpandido: tema.cores.interface.destaqueSuave,
        bordaExpandida: cor
    };
}

//Renderiza somente componentes de ícone conhecidos e declarados fora do componente.
function renderizarIconeDoGrupo(icone, propriedades) {
    switch (icone) {
        case 'pessoa':
            return <PersonArmsSpreadIcon {...propriedades} />;
        case 'coracao':
            return <HeartIcon {...propriedades} />;
        case 'raio':
            return <LightningIcon {...propriedades} />;
        case 'pessoas':
            return <UsersIcon {...propriedades} />;
        case 'primeirosSocorros':
            return <FirstAidKitIcon {...propriedades} />;
        case 'gota':
        default:
            return <DropIcon {...propriedades} />;
    }
}

//Recebe uma quantidade e devolve o texto correto no singular ou no plural.
function obterTextoDaContagem(quantidade) {
    return quantidade === 1 ? '1 permissão ativa' : `${quantidade} permissões ativas`;
}

//Recebe as permissões e ações do grupo e controla sua abertura e seus interruptores.
function PermissionGroup({
    titulo,
    icone = 'gota',
    paleta = 'ciclo',
    permissoes = [],
    permissoesSelecionadas = [],
    aoAlterarPermissao,
    aoAlterarGrupo,
    desabilitado = false,
    inicialmenteExpandido = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [expandido, definirExpandido] = useState(inicialmenteExpandido === true);
    const coresDoGrupo = obterPaleta(paleta, tema);
    const IconeDaExpansao = expandido ? CaretUpIcon : CaretDownIcon;

    //Memoização reaproveita os dados calculados enquanto as propriedades recebidas não mudarem.
    const permissoesValidas = useMemo(() => {
        if (!Array.isArray(permissoes)) {
            return [];
        }

        return permissoes.filter(
            (permissao) =>
                permissao &&
                typeof permissao.id === 'string' &&
                typeof permissao.titulo === 'string'
        );
    }, [permissoes]);

    const idsDasPermissoes = useMemo(
        () => permissoesValidas.map((permissao) => permissao.id),
        [permissoesValidas]
    );

    const permissoesAtivas = useMemo(() => {
        const selecionadasRecebidas = Array.isArray(permissoesSelecionadas)
            ? permissoesSelecionadas
            : [];

        return new Set(selecionadasRecebidas);
    }, [permissoesSelecionadas]);

    const quantidadeAtiva = idsDasPermissoes.reduce(
        (total, permissaoId) => total + (permissoesAtivas.has(permissaoId) ? 1 : 0),
        0
    );

    const todasAtivas = idsDasPermissoes.length > 0 && quantidadeAtiva === idsDasPermissoes.length;

    const grupoDesabilitado =
        desabilitado || idsDasPermissoes.length === 0 || typeof aoAlterarGrupo !== 'function';

    //Abre ou fecha somente a lista deste grupo.
    const alternarExpansao = useCallback(() => {
        definirExpandido((valorAtual) => !valorAtual);
    }, []);

    //Envia todos os identificadores do grupo e o novo estado ao componente pai.
    const alterarGrupo = useCallback(
        (ativo) => {
            if (!grupoDesabilitado) {
                aoAlterarGrupo(idsDasPermissoes, ativo);
            }
        },
        [aoAlterarGrupo, grupoDesabilitado, idsDasPermissoes]
    );

    const iconeDoGrupo = renderizarIconeDoGrupo(icone, {
        testID: `icone-grupo-${icone}`,
        size: 18,
        color: coresDoGrupo.icone,
        weight: 'regular'
    });

    return (
        <View
            style={[
                estilos.container,
                expandido && {
                    borderColor: coresDoGrupo.bordaExpandida
                }
            ]}
        >
            <View
                style={[
                    estilos.cabecalho,
                    expandido && {
                        backgroundColor: coresDoGrupo.fundoExpandido
                    }
                ]}
            >
                <Pressable
                    onPress={alternarExpansao}
                    accessibilityRole="button"
                    accessibilityLabel={titulo}
                    accessibilityHint={
                        expandido
                            ? 'Recolhe as permissões deste grupo'
                            : 'Mostra as permissões deste grupo'
                    }
                    accessibilityState={{
                        expanded: expandido
                    }}
                    style={({ pressed }) => [estilos.areaExpansao, pressed && estilos.pressionado]}
                >
                    <View
                        style={[
                            estilos.caixaIcone,
                            {
                                backgroundColor: coresDoGrupo.fundoIcone
                            }
                        ]}
                    >
                        {iconeDoGrupo}
                    </View>

                    <View style={estilos.textos}>
                        <Text
                            style={[
                                estilos.titulo,
                                expandido && {
                                    color: coresDoGrupo.icone
                                }
                            ]}
                            numberOfLines={2}
                        >
                            {titulo}
                        </Text>

                        {quantidadeAtiva > 0 ? (
                            <Text style={estilos.contagem}>
                                {obterTextoDaContagem(quantidadeAtiva)}
                            </Text>
                        ) : null}
                    </View>

                    <IconeDaExpansao
                        size={18}
                        color={
                            expandido ? coresDoGrupo.icone : tema.cores.interface.textoSecundario
                        }
                        weight="regular"
                    />
                </Pressable>

                <SwitchField
                    ativo={todasAtivas}
                    aoAlterar={alterarGrupo}
                    desabilitado={grupoDesabilitado}
                    somenteControle
                    rotuloAcessibilidade={`Ativar todas as permissões de ${titulo}`}
                />
            </View>

            {expandido ? (
                <View
                    style={[
                        estilos.lista,
                        {
                            borderTopColor: coresDoGrupo.bordaExpandida
                        }
                    ]}
                >
                    {permissoesValidas.map((permissao, indice) => (
                        <View
                            key={permissao.id}
                            style={[estilos.item, indice > 0 && estilos.itemComSeparador]}
                        >
                            <PermissionItem
                                titulo={permissao.titulo}
                                ativo={permissoesAtivas.has(permissao.id)}
                                aoAlterar={(ativo) => aoAlterarPermissao?.(permissao.id, ativo)}
                                desabilitado={
                                    desabilitado || typeof aoAlterarPermissao !== 'function'
                                }
                                paleta={paleta}
                            />
                        </View>
                    ))}
                </View>
            ) : null}
        </View>
    );
}

export default memo(PermissionGroup);
