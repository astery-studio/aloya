//Reúne os grupos de permissões de acesso e controla a lista selecionada.
import {memo, useCallback, useMemo} from 'react'
import {Text, View} from 'react-native'

import {gruposPermissoes, permissoesGerais} from '../constants/permissionOptions'
import PermissionGroup from './PermissionGroup'
import PermissionCounter from './PermissionCounter'
import {estilos} from './PermissionGroups.styles'

const idsPermitidos = new Set([
    ...permissoesGerais.map(permissao => permissao.id),
    ...gruposPermissoes.flatMap(grupo => grupo.permissoes.map(permissao => permissao.id))
])

//Recebe a lista externa e mantém somente identificadores conhecidos, únicos e seguros.
function normalizarPermissoes(permissoes) {
    if (!Array.isArray(permissoes)) {
        return []
    }

    return [...new Set(permissoes.filter(permissao => typeof permissao === 'string' && idsPermitidos.has(permissao)))]
}

//Recebe as permissões selecionadas e devolve todas as alterações ao formulário.
function PermissionGroups({permissoesSelecionadas = [], aoAlterar, desabilitado = false, estilo}) {
    //Memoização evita repetir a limpeza da lista quando ela não foi alterada.
    const permissoesNormalizadas = useMemo(() => normalizarPermissoes(permissoesSelecionadas), [permissoesSelecionadas])
    const permissoesAtivas = useMemo(() => new Set(permissoesNormalizadas), [permissoesNormalizadas])
    const estaDesabilitado = desabilitado || typeof aoAlterar !== 'function'

    const quantidadeGruposAtivos = gruposPermissoes.reduce((total, grupo) => {
        const grupoPossuiSelecao = grupo.permissoes.some(permissao => permissoesAtivas.has(permissao.id))
        return total + (grupoPossuiSelecao ? 1 : 0)
    }, 0)

    //Adiciona ou remove uma permissão sem apagar as seleções dos outros grupos.
    const alterarPermissao = useCallback((permissaoId, ativa) => {
        if (estaDesabilitado || !idsPermitidos.has(permissaoId)) {
            return
        }

        const novasPermissoes = new Set(permissoesNormalizadas)

        if (ativa) {
            novasPermissoes.add(permissaoId)
        } else {
            novasPermissoes.delete(permissaoId)
        }

        aoAlterar([...novasPermissoes])
    }, [aoAlterar, estaDesabilitado, permissoesNormalizadas])

    //Adiciona ou remove todas as permissões recebidas usando uma única atualização.
    const alterarGrupo = useCallback((permissoesDoGrupo, ativa) => {
        if (estaDesabilitado || !Array.isArray(permissoesDoGrupo)) {
            return
        }

        const novasPermissoes = new Set(permissoesNormalizadas)

        permissoesDoGrupo.forEach(permissaoId => {
            if (!idsPermitidos.has(permissaoId)) {
                return
            }

            if (ativa) {
                novasPermissoes.add(permissaoId)
            } else {
                novasPermissoes.delete(permissaoId)
            }
        })

        aoAlterar([...novasPermissoes])
    }, [aoAlterar, estaDesabilitado, permissoesNormalizadas])

    return (
        <View style={[estilos.container, estilo]}>
            <View style={estilos.cabecalho}>
                <Text accessibilityRole="header" style={estilos.titulo}>Permissões de Acesso</Text>

                <PermissionCounter
                    quantidadeAtiva={quantidadeGruposAtivos}
                    total={gruposPermissoes.length}
                />
            </View>

            <View style={estilos.lista}>
                {gruposPermissoes.map(grupo => (
                    <PermissionGroup
                        key={grupo.id}
                        titulo={grupo.titulo}
                        icone={grupo.icone}
                        paleta={grupo.paleta}
                        permissoes={grupo.permissoes}
                        permissoesSelecionadas={permissoesNormalizadas}
                        aoAlterarPermissao={alterarPermissao}
                        aoAlterarGrupo={alterarGrupo}
                        desabilitado={estaDesabilitado}
                    />
                ))}
            </View>
        </View>
    )
}

export {PermissionGroups}