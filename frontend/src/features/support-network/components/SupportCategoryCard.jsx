//Representa uma categoria de permissão e encaminha suas ações de edição e exclusão.
import {ActivityIndicator, Text, View} from 'react-native'

import {IconButton} from '../../../shared/components/common/IconButton/IconButton'
import {
    PencilSimpleIcon,
    TrashIcon,
    UserCheckIcon,
    UsersIcon
} from '../../../shared/components/icons/AppIcons'
import {tema} from '../../../shared/theme'
import {estilos} from './SupportCategoryCard.styles'

function normalizarQuantidadeContatos(quantidade) {
    return Number.isSafeInteger(quantidade) && quantidade >= 0
        ? quantidade
        : 0
}

function criarRotuloContatos(quantidade) {
    return quantidade === 1
        ? '1 contato vinculado'
        : `${quantidade} contatos vinculados`
}

function SupportCategoryCard({
    categoria,
    resumoPermissoes,
    quantidadeContatos,
    onEditar,
    onExcluir,
    desabilitado = false,
    acaoEmAndamento = null
}) {
    const nome = typeof categoria?.nome === 'string'
        ? categoria.nome.trim()
        : ''

    const quantidadeSegura = normalizarQuantidadeContatos(
        quantidadeContatos ?? categoria?.quantidadeContatos
    )

    const resumoSeguro =
        typeof resumoPermissoes === 'string' && resumoPermissoes.trim()
            ? resumoPermissoes.trim()
            : 'Permissões não informadas'

    const editando = acaoEmAndamento === 'editar'
    const excluindo = acaoEmAndamento === 'excluir'
    const carregando = editando || excluindo
    const bloqueado = desabilitado || carregando

    const edicaoDesabilitada =
        bloqueado || typeof onEditar !== 'function'

    const exclusaoDesabilitada =
        bloqueado || typeof onExcluir !== 'function'

    function editar() {
        if (!edicaoDesabilitada) {
            onEditar(categoria)
        }
    }

    function excluir() {
        if (!exclusaoDesabilitada) {
            onExcluir(categoria)
        }
    }

    if (!nome) {
        return null
    }

    return (
        <View
            testID="support-category-card"
            accessibilityLabel={`Categoria ${nome}`}
            style={[
                estilos.cartao,
                bloqueado && estilos.cartaoDesabilitado
            ]}
        >
            <View style={estilos.conteudoPrincipal}>
                <View
                    importantForAccessibility="no-hide-descendants"
                    accessibilityElementsHidden
                    style={estilos.caixaIcone}
                >
                    <UserCheckIcon
                        size={18}
                        color={tema.cores.marca.secundaria}
                        weight="fill"
                    />
                </View>

                <View style={estilos.textos}>
                    <View style={estilos.containerTitulo}>
                        <Text
                            testID="support-category-name"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.85}
                            style={estilos.nome}
                        >
                            {nome}
                        </Text>
                    </View>

                    <View style={estilos.containerResumo}>
                        <Text
                            testID="support-category-summary"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.72}
                            style={estilos.resumo}
                        >
                            {resumoSeguro}
                        </Text>
                    </View>
                </View>

                <View style={estilos.acoes}>
                    {editando ? (
                        <View style={estilos.areaAcao}>
                            <ActivityIndicator
                                accessibilityLabel={`Editando categoria ${nome}`}
                                color={tema.cores.marca.secundaria}
                                size="small"
                            />
                        </View>
                    ) : (
                        <IconButton
                            icone={PencilSimpleIcon}
                            aoPressionar={editar}
                            rotuloAcessibilidade={`Editar categoria ${nome}`}
                            desativado={edicaoDesabilitada}
                        />
                    )}

                    {excluindo ? (
                        <View style={estilos.areaAcao}>
                            <ActivityIndicator
                                accessibilityLabel={`Excluindo categoria ${nome}`}
                                color={tema.cores.feedback.erro}
                                size="small"
                            />
                        </View>
                    ) : (
                        <IconButton
                            icone={TrashIcon}
                            aoPressionar={excluir}
                            rotuloAcessibilidade={`Excluir categoria ${nome}`}
                            variante="perigo"
                            desativado={exclusaoDesabilitada}
                        />
                    )}
                </View>
            </View>

            <View style={estilos.divisor} />

            <View
                accessibilityLabel={criarRotuloContatos(quantidadeSegura)}
                style={estilos.contatos}
            >
                <UsersIcon
                    size={22}
                    color={tema.cores.marca.secundaria}
                    weight="regular"
                />

                <Text style={estilos.textoContatos}>
                    <Text style={estilos.quantidadeContatos}>
                        {quantidadeSegura}
                    </Text>

                    {quantidadeSegura === 1
                        ? ' contato vinculado'
                        : ' contatos vinculados'}
                </Text>
            </View>
        </View>
    )
}

export {
    criarRotuloContatos,
    SupportCategoryCard
}