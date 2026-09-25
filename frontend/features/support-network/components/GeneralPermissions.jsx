//Reúne e controla os cinco interruptores de permissões gerais.
import {useCallback, useMemo} from 'react'
import {Text, View} from 'react-native'

import SwitchField from '../../../components/forms/SwitchField/SwitchField'
import {permissoesGerais} from '../constants/permissionOptions'
import {estilos} from './GeneralPermissions.styles'

//Recebe as permissões selecionadas e informa qual permissão teve o estado alterado.
function GeneralPermissions({permissoesSelecionadas = [], aoAlterar, desabilitado = false, estilo}) {
    const permissoesAtivas = useMemo(() => {
        const permissoesRecebidas = Array.isArray(permissoesSelecionadas) ? permissoesSelecionadas : []

        return new Set(permissoesRecebidas)
    }, [permissoesSelecionadas])

    const estaDesabilitado = desabilitado || typeof aoAlterar !== 'function'

    //Envia ao formulário somente o identificador alterado e seu novo estado.
    const alterarPermissao = useCallback((permissaoId, ativa) => {
        if (!estaDesabilitado) {
            aoAlterar(permissaoId, ativa)
        }
    }, [aoAlterar, estaDesabilitado])

    return (
        <View style={[estilos.container, estilo]}>
            <Text accessibilityRole="header" style={estilos.titulo}>Permissões Gerais</Text>

            <View style={estilos.lista}>
                {permissoesGerais.map(permissao => (
                    <SwitchField
                        key={permissao.id}
                        titulo={permissao.titulo}
                        ativo={permissoesAtivas.has(permissao.id)}
                        aoAlterar={ativa => alterarPermissao(permissao.id, ativa)}
                        desabilitado={estaDesabilitado}
                    />
                ))}
            </View>
        </View>
    )
}

export {GeneralPermissions}