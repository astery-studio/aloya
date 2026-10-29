//Controla carregamento, atualização e alterações locais da lista de categorias.
import {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react'

import {
    criarSupportCategory
} from '../domain/SupportCategory'

const MENSAGEM_ERRO =
    'Não foi possível carregar suas categorias no momento. Tente novamente.'

const MENSAGEM_SESSAO_EXPIRADA =
    'Sua sessão expirou. Entre novamente.'

const CODIGOS_SESSAO_INVALIDA =
    new Set([
        'NAO_AUTENTICADO',
        'TOKEN_INVALIDO',
        'SESSAO_INVALIDA',
        'SESSAO_AUSENTE'
    ])

const comparadorNomes =
    new Intl.Collator('pt-BR', {
        numeric: true,
        sensitivity: 'base'
    })

function ordenarCategorias(
    categorias
) {
    return categorias
        .slice()
        .sort(
            (
                primeiraCategoria,
                segundaCategoria
            ) => {
                const comparacaoNome =
                    comparadorNomes.compare(
                        primeiraCategoria.nome,
                        segundaCategoria.nome
                    )

                if (comparacaoNome !== 0) {
                    return comparacaoNome
                }

                return (
                    primeiraCategoria.id
                    - segundaCategoria.id
                )
            }
        )
}

function congelarLista(categorias) {
    return Object.freeze(
        ordenarCategorias(categorias)
    )
}

function idCategoriaEhValido(id) {
    return Number.isSafeInteger(id)
        && id > 0
}

function erroEhSessaoInvalida(erro) {
    return erro?.status === 401
        || CODIGOS_SESSAO_INVALIDA
            .has(erro?.codigo)
}

//Adiciona ou substitui uma categoria sem criar entradas duplicadas.
function mesclarCategoria(
    categorias,
    categoria
) {
    const categoriasSemRepeticao =
        categorias.filter(
            item =>
                item.id !== categoria.id
        )

    return congelarLista([
        ...categoriasSemRepeticao,
        categoria
    ])
}

function useSupportCategories({
    service,
    onSessaoExpirada
} = {}) {
    const [
        categorias,
        definirCategorias
    ] = useState(() =>
        Object.freeze([])
    )

    const [
        carregando,
        definirCarregando
    ] = useState(true)

    const [
        atualizando,
        definirAtualizando
    ] = useState(false)

    const [
        erro,
        definirErro
    ] = useState(null)

    const categoriasRef = useRef([])
    const telaMontada = useRef(false)
    const requisicaoAtual = useRef(null)
    const controladorAtual = useRef(null)

    useEffect(() => {
        categoriasRef.current =
            categorias
    }, [categorias])

    //Busca a coleção sem apagar os dados que já estão visíveis.
    const carregarCategorias =
        useCallback(() => {
            if (requisicaoAtual.current) {
                return Promise.resolve(false)
            }

            const possuiDadosVisiveis =
                categoriasRef.current.length > 0

            if (
                typeof service
                    ?.listarCategorias
                    !== 'function'
            ) {
                definirCarregando(false)
                definirAtualizando(false)
                definirErro(
                    MENSAGEM_ERRO
                )

                return Promise.resolve(false)
            }

            const controlador =
                new AbortController()

            controladorAtual.current =
                controlador

            definirErro(null)

            if (possuiDadosVisiveis) {
                definirAtualizando(true)
            } else {
                definirCarregando(true)
            }

            const requisicao = (
                async () => {
                    try {
                        const lista =
                            await service
                                .listarCategorias({
                                    signal:
                                        controlador
                                            .signal
                                })

                        if (
                            !telaMontada.current
                            || controlador
                                .signal.aborted
                        ) {
                            return false
                        }

                        definirCategorias(
                            congelarLista(
                                lista
                            )
                        )

                        definirErro(null)

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
                            definirErro(null)

                            onSessaoExpirada?.({
                                mensagem:
                                    MENSAGEM_SESSAO_EXPIRADA
                            })

                            return false
                        }

                        definirErro(
                            MENSAGEM_ERRO
                        )

                        return false
                    } finally {
                        if (
                            requisicaoAtual.current
                            === requisicao
                        ) {
                            requisicaoAtual.current =
                                null
                        }

                        if (
                            controladorAtual.current
                            === controlador
                        ) {
                            controladorAtual.current =
                                null
                        }

                        if (
                            telaMontada.current
                        ) {
                            definirCarregando(
                                false
                            )

                            definirAtualizando(
                                false
                            )
                        }
                    }
                }
            )()

            requisicaoAtual.current =
                requisicao

            return requisicao
        }, [
            onSessaoExpirada,
            service
        ])

    useEffect(() => {
        telaMontada.current = true

        carregarCategorias()

        return () => {
            telaMontada.current = false

            controladorAtual.current
                ?.abort()

            controladorAtual.current =
                null

            requisicaoAtual.current =
                null
        }
    }, [carregarCategorias])

    //Insere a categoria recém-criada sem solicitar novamente toda a lista.
    const adicionarCategoria =
        useCallback(categoria => {
            const categoriaSegura =
                criarSupportCategory(
                    categoria
                )

            definirCategorias(
                categoriasAtuais =>
                    mesclarCategoria(
                        categoriasAtuais,
                        categoriaSegura
                    )
            )

            definirErro(null)

            return categoriaSegura
        }, [])

    //Substitui uma categoria editada mantendo a ordenação alfabética.
    const atualizarCategoria =
        useCallback(categoria => {
            const categoriaSegura =
                criarSupportCategory(
                    categoria
                )

            definirCategorias(
                categoriasAtuais =>
                    mesclarCategoria(
                        categoriasAtuais,
                        categoriaSegura
                    )
            )

            definirErro(null)

            return categoriaSegura
        }, [])

    //Remove imediatamente a categoria excluída da coleção visível.
    const removerCategoria =
        useCallback(categoriaId => {
            if (
                !idCategoriaEhValido(
                    categoriaId
                )
            ) {
                return false
            }

            let categoriaEncontrada = false

            definirCategorias(
                categoriasAtuais => {
                    const novaLista =
                        categoriasAtuais.filter(
                            categoria => {
                                const manter =
                                    categoria.id
                                    !== categoriaId

                                if (!manter) {
                                    categoriaEncontrada =
                                        true
                                }

                                return manter
                            }
                        )

                    if (
                        novaLista.length
                        === categoriasAtuais.length
                    ) {
                        return categoriasAtuais
                    }

                    return congelarLista(
                        novaLista
                    )
                }
            )

            definirErro(null)

            return categoriaEncontrada
        }, [])

    return {
        categorias,
        carregando,
        atualizando,
        erro,
        tentarNovamente:
            carregarCategorias,
        atualizarLista:
            carregarCategorias,
        adicionarCategoria,
        atualizarCategoria,
        removerCategoria
    }
}

export {
    ordenarCategorias,
    useSupportCategories
}