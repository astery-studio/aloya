//Mostra quantos grupos de permissões possuem alguma seleção ativa.
import {memo} from 'react'
import {Text, View} from 'react-native'

import {estilos} from './PermissionCounter.styles'

//Recebe qualquer valor e devolve somente um número inteiro igual ou maior que zero.
function normalizarQuantidade(valor) {
    if (!Number.isInteger(valor) || valor < 0) {
        return 0
    }

    return valor
}

//Recebe a quantidade ativa e o total e mostra um contador seguro e acessível.
function PermissionCounter({quantidadeAtiva = 0, total = 0}) {
    const totalSeguro = normalizarQuantidade(total)
    const quantidadeSegura = Math.min(normalizarQuantidade(quantidadeAtiva), totalSeguro)

    return (
        <View
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${quantidadeSegura} de ${totalSeguro} grupos ativos`}
            style={estilos.container}
        >
            <Text style={estilos.texto}>{quantidadeSegura} / {totalSeguro} ativos</Text>
        </View>
    )
}

export default memo(PermissionCounter)