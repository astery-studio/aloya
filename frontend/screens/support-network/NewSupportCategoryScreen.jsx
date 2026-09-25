//Controla a tela de criação de categorias e seus avisos de validação, erro e sucesso.
import {useCallback, useEffect, useRef, useState} from 'react'
import {View} from 'react-native'

import {BellIcon, WarningCircleIcon} from '../../components/icons/AppIcons'
import SimpleModal from '../../components/feedback/Modal/SimpleModal'
import {SupportCategoryForm} from '../../features/support-network/components/SupportCategoryForm'
import {SettingsLayout} from '../../layouts/SettingsLayout/SettingsLayout'
import {tema} from '../../theme'
import {estilos} from './NewSupportCategoryScreen.styles'

const ALERTA_NOME = Object.freeze({
    codigo: 'NOME_CATEGORIA_OBRIGATORIO',
    titulo: 'Salvar sem nome',
    mensagem: 'Dê um nome para a categoria.',
    recuperavel: false
})

const ALERTA_PERMISSOES = Object.freeze({
    codigo: 'PERMISSAO_CATEGORIA_OBRIGATORIA',
    titulo: 'Categoria sem permissões',
    mensagem: 'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.',
    recuperavel: false
})

const ALERTA_DUPLICIDADE = Object.freeze({
    codigo: 'CATEGORIA_NOME_DUPLICADO',
    titulo: 'Categoria existente',
    mensagem: 'Você já tem uma categoria com esse nome.',
    recuperavel: false
})

const ALERTA_INTERNO = Object.freeze({
    codigo: 'ERRO_CRIACAO_CATEGORIA',
    titulo: 'Algo deu errado',
    mensagem: 'Ocorreu um erro ao criar sua categoria. Verifique sua conexão e tente novamente.',
    recuperavel: true
})

const codigosSessaoInvalida = new Set([
    'NAO_AUTENTICADO',
    'TOKEN_INVALIDO',
    'SESSAO_INVALIDA',
    'SESSAO_AUSENTE'
])

//Cria uma cópia nova dos dados iniciais usados pelo formulário.
function criarDadosIniciais() {
    return {
        nome: '',
        dadosVisiveis: []
    }
}

//Recebe um código de validação e devolve somente uma mensagem conhecida e segura.
function obterAlertaValidacao(codigo) {
    if (codigo === ALERTA_NOME.codigo) {
        return ALERTA_NOME
    }

    if (codigo === ALERTA_PERMISSOES.codigo) {
        return ALERTA_PERMISSOES
    }

    return ALERTA_INTERNO
}

//Recebe um erro da API e devolve somente uma mensagem permitida para a tela.
function obterAlertaDoErro(erro) {
    if (erro?.codigo === ALERTA_DUPLICIDADE.codigo) {
        return ALERTA_DUPLICIDADE
    }

    if (erro?.codigo === ALERTA_NOME.codigo) {
        return ALERTA_NOME
    }

    if (erro?.codigo === ALERTA_PERMISSOES.codigo) {
        return ALERTA_PERMISSOES
    }

    if (erro?.codigo === 'ERRO_VALIDACAO') {
        const detalhes = Array.isArray(erro.detalhes) ? erro.detalhes : []
        const camposInvalidos = new Set(detalhes.map(detalhe => detalhe?.campo))

        if (camposInvalidos.has('nome')) {
            return ALERTA_NOME
        }

        if (camposInvalidos.has('dadosVisiveis')) {
            return ALERTA_PERMISSOES
        }
    }

    return ALERTA_INTERNO
}

//Confirma que a resposta possui apenas a estrutura mínima esperada de uma categoria criada.
function categoriaCriadaEhValida(categoria) {
    return categoria !== null
        && typeof categoria === 'object'
        && !Array.isArray(categoria)
        && (typeof categoria.id === 'number' || typeof categoria.id === 'string')
        && typeof categoria.nome === 'string'
        && Array.isArray(categoria.dadosVisiveis)
        && Number.isInteger(categoria.quantidadeContatos)
}

//Recebe o serviço de criação e controla todo o fluxo visual da nova categoria.
function NewSupportCategoryScreen({criarCategoria, onVoltar, onCategoriaCriada, onConcluido, onSessaoExpirada}) {
    const [dados, definirDados] = useState(criarDadosIniciais)
    const [carregando, definirCarregando] = useState(false)
    const [alertaErro, definirAlertaErro] = useState(null)
    const [categoriaCriada, definirCategoriaCriada] = useState(null)
    const [sucessoVisivel, definirSucessoVisivel] = useState(false)
    const requisicaoEmAndamento = useRef(false)
    const ultimaTentativa = useRef(null)
    const telaMontada = useRef(true)
    const servicoDisponivel = typeof criarCategoria === 'function'

    useEffect(() => {
        return () => {
            telaMontada.current = false
        }
    }, [])

    //Atualiza somente o nome ou as permissões que pertencem ao formulário.
    const alterarDados = useCallback(alteracoes => {
        if (requisicaoEmAndamento.current || alteracoes === null || typeof alteracoes !== 'object' || Array.isArray(alteracoes)) {
            return
        }

        definirDados(dadosAtuais => {
            const novosDados = {...dadosAtuais}

            if (typeof alteracoes.nome === 'string') {
                novosDados.nome = alteracoes.nome
            }

            if (Array.isArray(alteracoes.dadosVisiveis)) {
                novosDados.dadosVisiveis = [...new Set(alteracoes.dadosVisiveis.filter(permissao => typeof permissao === 'string'))]
            }

            return novosDados
        })
    }, [])

    //Abre um aviso usando somente os códigos de validação conhecidos.
    const mostrarErroValidacao = useCallback(erro => {
        definirAlertaErro(obterAlertaValidacao(erro?.codigo))
    }, [])

    //Envia os dados validados e impede duas criações simultâneas.
    const salvarCategoria = useCallback(async dadosValidados => {
        if (requisicaoEmAndamento.current || !servicoDisponivel) {
            return
        }

        const dadosSeguros = Object.freeze({
            nome: dadosValidados.nome,
            dadosVisiveis: Object.freeze([...dadosValidados.dadosVisiveis])
        })

        requisicaoEmAndamento.current = true
        ultimaTentativa.current = dadosSeguros
        definirCarregando(true)
        definirAlertaErro(null)

        try {
            const categoria = await criarCategoria(dadosSeguros)

            if (!categoriaCriadaEhValida(categoria)) {
                throw new Error('Resposta inválida ao criar categoria.')
            }

            if (!telaMontada.current) {
                return
            }

            ultimaTentativa.current = null
            definirCategoriaCriada(categoria)
            definirSucessoVisivel(true)

            try {
                onCategoriaCriada?.(categoria)
            } catch {
                //A categoria já foi criada e não deve ser enviada novamente por uma falha externa de navegação.
            }
        } catch (erro) {
            if (!telaMontada.current) {
                return
            }

            if (codigosSessaoInvalida.has(erro?.codigo) && typeof onSessaoExpirada === 'function') {
                onSessaoExpirada()
                return
            }

            definirAlertaErro(obterAlertaDoErro(erro))
        } finally {
            requisicaoEmAndamento.current = false

            if (telaMontada.current) {
                definirCarregando(false)
            }
        }
    }, [criarCategoria, onCategoriaCriada, onSessaoExpirada, servicoDisponivel])

    //Repete somente a última tentativa feita pela própria tela.
    const tentarNovamente = useCallback(() => {
        if (ultimaTentativa.current) {
            salvarCategoria(ultimaTentativa.current)
        }
    }, [salvarCategoria])

    //Fecha o aviso sem apagar os dados preenchidos.
    const fecharAlertaErro = useCallback(() => {
        if (!carregando) {
            definirAlertaErro(null)
        }
    }, [carregando])

    //Fecha o sucesso e informa a categoria criada para a navegação.
    const concluirCriacao = useCallback(() => {
        definirSucessoVisivel(false)
        onConcluido?.(categoriaCriada)
    }, [categoriaCriada, onConcluido])

    //Impede que a pessoa saia enquanto a criação está sendo enviada.
    const voltar = useCallback(() => {
        if (!requisicaoEmAndamento.current) {
            onVoltar?.()
        }
    }, [onVoltar])

    return (
        <>
            <SettingsLayout titulo="Nova Categoria" onVoltar={voltar}>
                <View style={estilos.conteudo}>
                    <SupportCategoryForm
                        dados={dados}
                        aoAlterar={alterarDados}
                        aoSalvar={salvarCategoria}
                        aoErroValidacao={mostrarErroValidacao}
                        carregando={carregando}
                        bloqueado={!servicoDisponivel}
                    />
                </View>
            </SettingsLayout>

            <SimpleModal
                visivel={alertaErro !== null}
                aoFechar={fecharAlertaErro}
                icone={WarningCircleIcon}
                corIcone={alertaErro?.recuperavel ? tema.cores.feedback.erro : tema.cores.marca.primaria}
                fundoIcone={alertaErro?.recuperavel ? tema.cores.neutras.bordaClara : tema.cores.icones.configuracoes.laranja.caixa}
                titulo={alertaErro?.titulo}
                mensagem={alertaErro?.mensagem}
                acaoPrincipal={alertaErro?.recuperavel
                    ? {
                        texto: 'Tentar novamente',
                        variante: 'preto',
                        aoPressionar: tentarNovamente,
                        carregando
                    }
                    : {
                        texto: 'OK',
                        variante: 'verde',
                        aoPressionar: fecharAlertaErro
                    }}
                acaoSecundaria={alertaErro?.recuperavel
                    ? {
                        texto: 'Voltar',
                        variante: 'branco',
                        aoPressionar: fecharAlertaErro,
                        desativado: carregando
                    }
                    : undefined}
            />

            <SimpleModal
                visivel={sucessoVisivel}
                aoFechar={concluirCriacao}
                icone={BellIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Categoria criada com sucesso"
                acaoPrincipal={{
                    texto: 'OK',
                    variante: 'verde',
                    aoPressionar: concluirCriacao
                }}
            />
        </>
    )
}

export {NewSupportCategoryScreen}