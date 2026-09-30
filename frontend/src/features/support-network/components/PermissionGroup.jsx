//Mostra um grupo expansível de permissões com ícone, contador e controle geral.
import {
    memo,
    useCallback,
    useMemo,
    useState
} from 'react'
import {
    Pressable,
    Text,
    View
} from 'react-native'

import SwitchField from '../../../shared/components/forms/SwitchField/SwitchField'
import {
    CaretDownIcon,
    CaretUpIcon,
    DropIcon,
    FirstAidKitIcon,
    HeartIcon,
    LightningIcon,
    PersonArmsSpreadIcon,
    UsersIcon
} from '../../../shared/components/icons/AppIcons'
import {tema} from '../../../shared/theme'
import PermissionItem from './PermissionItem'
import {estilos} from './PermissionGroup.styles'

const paletasDosGrupos = Object.freeze({
    ciclo: tema.cores.redeApoio.ciclo,
    corpo: tema.cores.redeApoio.corpo,
    emocional: tema.cores.redeApoio.emocional,
    energia: tema.cores.redeApoio.energia,
    vidaIntima: tema.cores.redeApoio.vidaIntima,
    saude: tema.cores.redeApoio.saude
})

//Recebe o nome da paleta e devolve somente uma paleta conhecida pelo aplicativo.
function obterPaleta(paleta) {
    return paletasDosGrupos[paleta]
        ?? paletasDosGrupos.ciclo
}

//Renderiza somente componentes de ícone conhecidos e declarados fora do componente.
function renderizarIconeDoGrupo(icone, propriedades) {
    switch (icone) {
        case 'pessoa':
            return (
                <PersonArmsSpreadIcon {...propriedades} />
            )
        case 'coracao':
            return (
                <HeartIcon {...propriedades} />
            )
        case 'raio':
            return (
                <LightningIcon {...propriedades} />
            )
        case 'pessoas':
            return (
                <UsersIcon {...propriedades} />
            )
        case 'primeirosSocorros':
            return (
                <FirstAidKitIcon {...propriedades} />
            )
        case 'gota':
        default:
            return (
                <DropIcon {...propriedades} />
            )
    }
}

//Recebe uma quantidade e devolve o texto correto no singular ou no plural.
function obterTextoDaContagem(quantidade) {
    return quantidade === 1
        ? '1 permissão ativa'
        : `${quantidade} permissões ativas`
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
    const [expandido, definirExpandido] = useState(
        inicialmenteExpandido === true
    )
    const coresDoGrupo = obterPaleta(paleta)
    const IconeDaExpansao =
        expandido ? CaretUpIcon : CaretDownIcon

    //Memoização reaproveita os dados calculados enquanto as propriedades recebidas não mudarem.
    const permissoesValidas = useMemo(() => {
        if (!Array.isArray(permissoes)) {
            return []
        }

        return permissoes.filter(
            permissao =>
                permissao
                && typeof permissao.id === 'string'
                && typeof permissao.titulo === 'string'
        )
    }, [permissoes])

    const idsDasPermissoes = useMemo(
        () => permissoesValidas.map(
            permissao => permissao.id
        ),
        [permissoesValidas]
    )

    const permissoesAtivas = useMemo(() => {
        const selecionadasRecebidas =
            Array.isArray(permissoesSelecionadas)
                ? permissoesSelecionadas
                : []

        return new Set(selecionadasRecebidas)
    }, [permissoesSelecionadas])

    const quantidadeAtiva = idsDasPermissoes.reduce(
        (total, permissaoId) =>
            total
            + (
                permissoesAtivas.has(permissaoId)
                    ? 1
                    : 0
            ),
        0
    )

    const todasAtivas =
        idsDasPermissoes.length > 0
        && quantidadeAtiva === idsDasPermissoes.length

    const grupoDesabilitado =
        desabilitado
        || idsDasPermissoes.length === 0
        || typeof aoAlterarGrupo !== 'function'

    //Abre ou fecha somente a lista deste grupo.
    const alternarExpansao = useCallback(() => {
        definirExpandido(valorAtual => !valorAtual)
    }, [])

    //Envia todos os identificadores do grupo e o novo estado ao componente pai.
    const alterarGrupo = useCallback(ativo => {
        if (!grupoDesabilitado) {
            aoAlterarGrupo(idsDasPermissoes, ativo)
        }
    }, [
        aoAlterarGrupo,
        grupoDesabilitado,
        idsDasPermissoes
    ])

    const iconeDoGrupo = renderizarIconeDoGrupo(
        icone,
        {
            testID: `icone-grupo-${icone}`,
            size: 18,
            color: coresDoGrupo.icone,
            weight: 'regular'
        }
    )

    return (
        <View
            style={[
                estilos.container,
                expandido && {
                    borderColor:
                        coresDoGrupo.bordaExpandida
                }
            ]}
        >
            <View
                style={[
                    estilos.cabecalho,
                    expandido && {
                        backgroundColor:
                            coresDoGrupo.fundoExpandido
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
                    style={({pressed}) => [
                        estilos.areaExpansao,
                        pressed && estilos.pressionado
                    ]}
                >
                    <View
                        style={[
                            estilos.caixaIcone,
                            {
                                backgroundColor:
                                    coresDoGrupo.fundoIcone
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
                                    color:
                                        coresDoGrupo.icone
                                }
                            ]}
                            numberOfLines={2}
                        >
                            {titulo}
                        </Text>

                        {quantidadeAtiva > 0 ? (
                            <Text style={estilos.contagem}>
                                {
                                    obterTextoDaContagem(
                                        quantidadeAtiva
                                    )
                                }
                            </Text>
                        ) : null}
                    </View>

                    <IconeDaExpansao
                        size={18}
                        color={
                            expandido
                                ? coresDoGrupo.icone
                                : tema.cores.neutras
                                    .textoSecundarioClaro
                        }
                        weight="regular"
                    />
                </Pressable>

                <SwitchField
                    ativo={todasAtivas}
                    aoAlterar={alterarGrupo}
                    desabilitado={grupoDesabilitado}
                    somenteControle
                    rotuloAcessibilidade={
                        `Ativar todas as permissões de ${titulo}`
                    }
                />
            </View>

            {expandido ? (
                <View
                    style={[
                        estilos.lista,
                        {
                            borderTopColor:
                                coresDoGrupo.bordaExpandida
                        }
                    ]}
                >
                    {permissoesValidas.map(
                        (permissao, indice) => (
                            <View
                                key={permissao.id}
                                style={[
                                    estilos.item,
                                    indice > 0
                                        && estilos
                                            .itemComSeparador
                                ]}
                            >
                                <PermissionItem
                                    titulo={
                                        permissao.titulo
                                    }
                                    ativo={
                                        permissoesAtivas.has(
                                            permissao.id
                                        )
                                    }
                                    aoAlterar={ativo =>
                                        aoAlterarPermissao?.(
                                            permissao.id,
                                            ativo
                                        )
                                    }
                                    desabilitado={
                                        desabilitado
                                        || typeof aoAlterarPermissao
                                            !== 'function'
                                    }
                                    paleta={paleta}
                                />
                            </View>
                        )
                    )}
                </View>
            ) : null}
        </View>
    )
}

export default memo(PermissionGroup)
