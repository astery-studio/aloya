//Reúne o nome, as permissões e a ação de salvar uma nova categoria.
import {useCallback, useMemo} from 'react'
import {View} from 'react-native'

import ButtonScreen from '../../../components/common/Button/ButtonScreen'
import TextInput from '../../../components/forms/TextInput'
import {GeneralPermissions} from './GeneralPermissions'
import {PermissionGroups} from './PermissionGroups'
import {estilos} from './SupportCategoryForm.styles'

const ERRO_NOME = Object.freeze({
    codigo: 'NOME_CATEGORIA_OBRIGATORIO',
    titulo: 'Salvar sem nome',
    mensagem: 'Dê um nome para a categoria.'
})

const ERRO_PERMISSOES = Object.freeze({
    codigo: 'PERMISSAO_CATEGORIA_OBRIGATORIA',
    titulo: 'Categoria sem permissões',
    mensagem: 'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.'
})

//Remove caracteres perigosos sem atrapalhar a digitação de letras acentuadas.
function sanitizarNomeCategoria(texto) {
    return texto.replace(/[\u0000-\u001F\u007F<>]/gu, '').slice(0, 80)
}

//Remove espaços excedentes somente quando o formulário é enviado.
function normalizarNomeCategoria(nome) {
    return nome.normalize('NFKC').trim().replace(/\s+/gu, ' ')
}

//Recebe dados controlados, valida o formulário e envia somente os campos permitidos.
function SupportCategoryForm({dados, aoAlterar, aoSalvar, aoErroValidacao, carregando = false, bloqueado = false}) {
    const nome = typeof dados?.nome === 'string' ? dados.nome : ''

    const dadosVisiveis = useMemo(() => {
        if (!Array.isArray(dados?.dadosVisiveis)) {
            return []
        }

        return [...new Set(dados.dadosVisiveis.filter(permissao => typeof permissao === 'string'))]
    }, [dados?.dadosVisiveis])

    const camposDesabilitados = bloqueado || carregando
    const possuiAlgumDado = nome.trim().length > 0 || dadosVisiveis.length > 0
    const botaoDesativado = camposDesabilitados || !possuiAlgumDado || typeof aoSalvar !== 'function'

    //Envia somente a alteração do nome para o estado mantido pelo componente pai.
    const alterarNome = useCallback(novoNome => {
        if (!camposDesabilitados && typeof aoAlterar === 'function') {
            aoAlterar({
                nome: novoNome
            })
        }
    }, [aoAlterar, camposDesabilitados])

    //Adiciona ou remove uma permissão geral sem apagar as demais seleções.
    const alterarPermissaoGeral = useCallback((permissaoId, ativa) => {
        if (camposDesabilitados || typeof aoAlterar !== 'function') {
            return
        }

        const novasPermissoes = new Set(dadosVisiveis)

        if (ativa) {
            novasPermissoes.add(permissaoId)
        } else {
            novasPermissoes.delete(permissaoId)
        }

        aoAlterar({
            dadosVisiveis: [...novasPermissoes]
        })
    }, [aoAlterar, camposDesabilitados, dadosVisiveis])

    //Recebe a lista completa das permissões de acesso e a envia ao estado do formulário.
    const alterarPermissoesAcesso = useCallback(novasPermissoes => {
        if (camposDesabilitados || typeof aoAlterar !== 'function' || !Array.isArray(novasPermissoes)) {
            return
        }

        const permissoesSeguras = [...new Set(novasPermissoes.filter(permissao => typeof permissao === 'string'))]

        aoAlterar({
            dadosVisiveis: permissoesSeguras
        })
    }, [aoAlterar, camposDesabilitados])

    //Valida na mesma ordem do backend e mantém os campos preenchidos quando existe erro.
    const salvar = useCallback(() => {
        const nomeNormalizado = normalizarNomeCategoria(nome)

        if (!nomeNormalizado) {
            aoErroValidacao?.(ERRO_NOME)
            return
        }

        if (dadosVisiveis.length === 0) {
            aoErroValidacao?.(ERRO_PERMISSOES)
            return
        }

        return aoSalvar({
            nome: nomeNormalizado,
            dadosVisiveis
        })
    }, [aoErroValidacao, aoSalvar, dadosVisiveis, nome])

    return (
        <View style={estilos.container}>
            <View style={estilos.conteudo}>
                <TextInput
                    label="Nome da categoria"
                    placeholder="Parceiro(a)"
                    value={nome}
                    onChangeText={alterarNome}
                    sanitizar={sanitizarNomeCategoria}
                    variante="categoria"
                    desativado={camposDesabilitados}
                    maxLength={80}
                    autoCapitalize="sentences"
                    autoCorrect={false}
                    returnKeyType="done"
                />

                <GeneralPermissions
                    permissoesSelecionadas={dadosVisiveis}
                    aoAlterar={alterarPermissaoGeral}
                    desabilitado={camposDesabilitados || typeof aoAlterar !== 'function'}
                />

                <PermissionGroups
                    permissoesSelecionadas={dadosVisiveis}
                    aoAlterar={alterarPermissoesAcesso}
                    desabilitado={camposDesabilitados || typeof aoAlterar !== 'function'}
                />
            </View>

            <View style={estilos.acao}>
                <ButtonScreen
                    texto="Salvar"
                    aoPressionar={salvar}
                    desativado={botaoDesativado}
                    carregando={carregando}
                    variante="laranja"
                />
            </View>
        </View>
    )
}

export {SupportCategoryForm}