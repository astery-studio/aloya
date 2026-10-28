//Controla consulta de impacto, decisões e exclusão de uma categoria.
import {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react'

import {
    acaoExclusaoEhValida
} from '../constants/categoryDeletionOptions'

const MENSAGEM_ERRO =
    'Ocorreu um erro ao deletar. Verifique sua conexão e tente novamente.'

const MENSAGEM_IMPACTO_ALTERADO =
    'Os contatos vinculados à categoria foram alterados. Revise as escolhas e tente novamente.'

const CODIGOS_SESSAO_INVALIDA =
    new Set([
        'NAO_AUTENTICADO',
        'TOKEN_INVALIDO',
        'SESSAO_INVALIDA',
        'SESSAO_AUSENTE'
    ])

function categoriaEhValida(categoria) {
    return categoria !== null
        && typeof categoria === 'object'
        && !Array.isArray(categoria)
        && Number.isSafeInteger(categoria.id)
        && categoria.id > 0
        && typeof categoria.nome === 'string'
        && categoria.nome.trim().length > 0
}

function criarDecisoesVazias(contatos) {
    const decisoes = {}

    for (const contato of contatos) {
        decisoes[contato.vinculoId] =
            null
    }

    return decisoes
}

function erroEhSessaoInvalida(erro) {
    return erro?.status === 401
        || CODIGOS_SESSAO_INVALIDA
            .has(erro?.codigo)
}

function useDeleteSupportCategory({
    service,
    onCategoriaExcluida,
    onSessaoExpirada
} = {}) {
    const [
        categoria,
        definirCategoria
    ] = useState(null)

    const [
        impacto,
        definirImpacto
    ] = useState(null)

    const [
        decisoes,
        definirDecisoes
    ] = useState({})

    const [
        carregandoImpacto,
        definirCarregandoImpacto
    ] = useState(false)

    const [
        excluindo,
        definirExcluindo
    ] = useState(false)

    const [
        erro,
        definirErro
    ] = useState(null)

    const [
        sucesso,
        definirSucesso
    ] = useState(false)

    const telaMontada =
        useRef(false)

    const controladorAtual =
        useRef(null)

    const requisicaoImpacto =
        useRef(null)

    const requisicaoExclusao =
        useRef(null)

    const ultimaOperacao =
        useRef(null)

    const categoriaRef =
        useRef(null)

    const impactoRef =
        useRef(null)

    const decisoesRef =
        useRef({})

    useEffect(() => {
        categoriaRef.current =
            categoria
    }, [categoria])

    useEffect(() => {
        impactoRef.current =
            impacto
    }, [impacto])

    useEffect(() => {
        decisoesRef.current =
            decisoes
    }, [decisoes])

    useEffect(() => {
        telaMontada.current = true

        return () => {
            telaMontada.current = false

            controladorAtual.current
                ?.abort()

            controladorAtual.current =
                null

            requisicaoImpacto.current =
                null

            requisicaoExclusao.current =
                null
        }
    }, [])

    const limparFluxo =
        useCallback(() => {
            definirCategoria(null)
            definirImpacto(null)
            definirDecisoes({})
            definirCarregandoImpacto(false)
            definirExcluindo(false)
            definirErro(null)

            categoriaRef.current = null
            impactoRef.current = null
            decisoesRef.current = {}
            ultimaOperacao.current = null
        }, [])

    //Consulta os contatos e a versão mais recente antes de permitir a exclusão.
    const carregarImpacto =
        useCallback(categoriaSelecionada => {
            if (
                requisicaoImpacto.current
                || requisicaoExclusao.current
                || !categoriaEhValida(
                    categoriaSelecionada
                )
                || typeof service
                    ?.consultarImpactoExclusao
                    !== 'function'
            ) {
                return Promise.resolve(false)
            }

            controladorAtual.current
                ?.abort()

            const controlador =
                new AbortController()

            controladorAtual.current =
                controlador

            definirCategoria(
                categoriaSelecionada
            )

            categoriaRef.current =
                categoriaSelecionada

            definirImpacto(null)
            definirDecisoes({})
            definirErro(null)
            definirCarregandoImpacto(true)

            impactoRef.current = null
            decisoesRef.current = {}
            ultimaOperacao.current =
                'impacto'

            const requisicao = (
                async () => {
                    try {
                        const resultado =
                            await service
                                .consultarImpactoExclusao(
                                    categoriaSelecionada.id,
                                    {
                                        signal:
                                            controlador.signal
                                    }
                                )

                        if (
                            !telaMontada.current
                            || controlador
                                .signal.aborted
                        ) {
                            return false
                        }

                        const novasDecisoes =
                            criarDecisoesVazias(
                                resultado.contatos
                            )

                        definirImpacto(
                            resultado
                        )

                        definirDecisoes(
                            novasDecisoes
                        )

                        impactoRef.current =
                            resultado

                        decisoesRef.current =
                            novasDecisoes

                        definirErro(null)
                        ultimaOperacao.current =
                            null

                        return true
                    } catch (falha) {
                        if (
                            controlador
                                .signal.aborted
                            || !telaMontada.current
                            || falha?.name
                                === 'AbortError'
                        ) {
                            return false
                        }

                        if (
                            erroEhSessaoInvalida(
                                falha
                            )
                        ) {
                            limparFluxo()

                            onSessaoExpirada?.({
                                mensagem:
                                    'Sua sessão expirou. Entre novamente.'
                            })

                            return false
                        }

                        definirErro({
                            codigo:
                                falha?.codigo
                                || 'ERRO_IMPACTO_EXCLUSAO',
                            mensagem:
                                MENSAGEM_ERRO
                        })

                        return false
                    } finally {
                        if (
                            requisicaoImpacto
                                .current
                            === requisicao
                        ) {
                            requisicaoImpacto
                                .current = null
                        }

                        if (
                            controladorAtual
                                .current
                            === controlador
                        ) {
                            controladorAtual
                                .current = null
                        }

                        if (
                            telaMontada.current
                        ) {
                            definirCarregandoImpacto(
                                false
                            )
                        }
                    }
                }
            )()

            requisicaoImpacto.current =
                requisicao

            return requisicao
        }, [
            limparFluxo,
            onSessaoExpirada,
            service
        ])

    //Inicia o fluxo usando a categoria selecionada na listagem.
    const solicitarExclusao =
        useCallback(categoriaSelecionada => {
            return carregarImpacto(
                categoriaSelecionada
            )
        }, [carregarImpacto])

    //Atualiza somente a decisão correspondente ao vínculo informado.
    const alterarDecisao =
        useCallback((
            vinculoId,
            acao
        ) => {
            const contatos =
                impactoRef.current
                    ?.contatos

            const contatoExiste =
                Array.isArray(contatos)
                && contatos.some(contato =>
                    contato.vinculoId
                    === vinculoId
                )

            if (
                requisicaoExclusao.current
                || !contatoExiste
                || !acaoExclusaoEhValida(
                    acao
                )
            ) {
                return false
            }

            definirDecisoes(
                decisoesAtuais => {
                    const novasDecisoes = {
                        ...decisoesAtuais,
                        [vinculoId]: acao
                    }

                    decisoesRef.current =
                        novasDecisoes

                    return novasDecisoes
                }
            )

            return true
        }, [])

    //Aplica a mesma escolha a todos os contatos do impacto atual.
    const aplicarATodos =
        useCallback(acao => {
            const contatos =
                impactoRef.current
                    ?.contatos

            if (
                requisicaoExclusao.current
                || !Array.isArray(contatos)
                || contatos.length === 0
                || !acaoExclusaoEhValida(
                    acao
                )
            ) {
                return false
            }

            const novasDecisoes = {}

            for (const contato of contatos) {
                novasDecisoes[
                    contato.vinculoId
                ] = acao
            }

            decisoesRef.current =
                novasDecisoes

            definirDecisoes(
                novasDecisoes
            )

            return true
        }, [])

    //Confirma somente quando todas as decisões exigidas estiverem preenchidas.
    const confirmarExclusao =
        useCallback(
            decisoesRecebidas => {
                const categoriaAtual =
                    categoriaRef.current

                const impactoAtual =
                    impactoRef.current

                if (
                    requisicaoExclusao.current
                    || !categoriaAtual
                    || !impactoAtual
                    || typeof service
                        ?.excluirCategoria
                        !== 'function'
                ) {
                    return Promise.resolve(
                        false
                    )
                }

                const listaDecisoes =
                    Array.isArray(
                        decisoesRecebidas
                    )
                        ? decisoesRecebidas
                        : []

                if (
                    listaDecisoes.length
                    !== impactoAtual
                        .contatos.length
                ) {
                    return Promise.resolve(
                        false
                    )
                }

                const idsEsperados =
                    new Set(
                        impactoAtual
                            .contatos
                            .map(
                                contato =>
                                    contato.vinculoId
                            )
                    )

                const idsRecebidos =
                    new Set()

                const possuiDecisaoInvalida =
                    listaDecisoes.some(
                        decisao => {
                            const invalida =
                                decisao === null
                                || typeof decisao
                                    !== 'object'
                                || !idsEsperados
                                    .has(
                                        decisao
                                            .vinculoId
                                    )
                                || idsRecebidos
                                    .has(
                                        decisao
                                            .vinculoId
                                    )
                                || !acaoExclusaoEhValida(
                                    decisao.acao
                                )

                            idsRecebidos.add(
                                decisao
                                    ?.vinculoId
                            )

                            return invalida
                        }
                    )

                if (possuiDecisaoInvalida) {
                    return Promise.resolve(
                        false
                    )
                }

                const decisoesSeguras =
                    listaDecisoes.map(
                        decisao => ({
                            vinculoId:
                                decisao
                                    .vinculoId,
                            acao:
                                decisao.acao
                        })
                    )

                definirExcluindo(true)
                definirErro(null)
                ultimaOperacao.current =
                    'exclusao'

                const requisicao = (
                    async () => {
                        try {
                            const resultado =
                                await service
                                    .excluirCategoria(
                                        categoriaAtual.id,
                                        {
                                            atualizadoEm:
                                                impactoAtual
                                                    .categoria
                                                    .atualizadoEm,
                                            decisoes:
                                                decisoesSeguras
                                        }
                                    )

                            if (
                                !telaMontada
                                    .current
                            ) {
                                return false
                            }

                            onCategoriaExcluida?.(
                                resultado
                                    .categoriaId
                            )

                            definirSucesso(true)
                            limparFluxo()

                            return true
                        } catch (falha) {
                            if (
                                !telaMontada
                                    .current
                            ) {
                                return false
                            }

                            if (
                                erroEhSessaoInvalida(
                                    falha
                                )
                            ) {
                                limparFluxo()

                                onSessaoExpirada?.({
                                    mensagem:
                                        'Sua sessão expirou. Entre novamente.'
                                })

                                return false
                            }

                            if (
                                falha?.codigo
                                === 'IMPACTO_EXCLUSAO_ALTERADO'
                            ) {
                                definirErro({
                                    codigo:
                                        falha.codigo,
                                    mensagem:
                                        MENSAGEM_IMPACTO_ALTERADO
                                })

                                ultimaOperacao.current =
                                    'impacto'

                                return false
                            }

                            definirErro({
                                codigo:
                                    falha?.codigo
                                    || 'ERRO_EXCLUSAO_CATEGORIA',
                                mensagem:
                                    MENSAGEM_ERRO
                            })

                            return false
                        } finally {
                            if (
                                requisicaoExclusao
                                    .current
                                === requisicao
                            ) {
                                requisicaoExclusao
                                    .current =
                                    null
                            }

                            if (
                                telaMontada.current
                            ) {
                                definirExcluindo(
                                    false
                                )
                            }
                        }
                    }
                )()

                requisicaoExclusao.current =
                    requisicao

                return requisicao
            },
            [
                limparFluxo,
                onCategoriaExcluida,
                onSessaoExpirada,
                service
            ]
        )

    const cancelar =
        useCallback(() => {
            if (requisicaoExclusao.current) {
                return false
            }

            controladorAtual.current
                ?.abort()

            limparFluxo()

            return true
        }, [limparFluxo])

    const tentarNovamente =
        useCallback(() => {
            if (
                ultimaOperacao.current
                === 'impacto'
                && categoriaRef.current
            ) {
                return carregarImpacto(
                    categoriaRef.current
                )
            }

            return Promise.resolve(false)
        }, [carregarImpacto])

    const fecharErro =
        useCallback(() => {
            definirErro(null)
        }, [])

    const concluirSucesso =
        useCallback(() => {
            definirSucesso(false)
        }, [])

    return {
        categoria,
        impacto,
        decisoes,
        carregandoImpacto,
        excluindo,
        erro,
        sucesso,
        modalVisivel:
            impacto !== null,
        solicitarExclusao,
        alterarDecisao,
        aplicarATodos,
        confirmarExclusao,
        cancelar,
        tentarNovamente,
        fecharErro,
        concluirSucesso
    }
}

export {useDeleteSupportCategory}