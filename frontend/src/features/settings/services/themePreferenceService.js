import {endpoints} from '../../../shared/services/api/endpoints'
import {
    PREFERENCIAS_TEMA,
    preferenciaTemaEhValida
} from '../../../shared/theme/themePreferences'

const MENSAGEM_ERRO_TEMA =
    'Não foi possível atualizar sua preferência de tema. Tente novamente.'

function criarErroLocal(
    mensagem,
    codigo
) {
    const erro = new Error(mensagem)

    erro.codigo = codigo
    erro.mensagemUsuario = mensagem

    return erro
}

function extrairPreferenciaTema(resposta) {
    const preferencia =
        resposta?.configuracoes?.temaVisual

    if (
        !preferenciaTemaEhValida(
            preferencia
        )
    ) {
        throw criarErroLocal(
            'Não foi possível carregar sua preferência de tema.',
            'RESPOSTA_TEMA_INVALIDA'
        )
    }

    return preferencia
}

function validarPreferenciaTema(preferencia) {
    if (
        !preferenciaTemaEhValida(
            preferencia
        )
    ) {
        throw criarErroLocal(
            'A preferência de tema informada é inválida.',
            'PREFERENCIA_TEMA_INVALIDA'
        )
    }

    return preferencia
}

function criarThemePreferenceService({
    requisicaoAutenticada
} = {}) {
    if (
        typeof requisicaoAutenticada
        !== 'function'
    ) {
        throw new Error(
            'Não foi possível configurar o serviço de preferência visual.'
        )
    }

    let alteracaoEmAndamento = null
    let preferenciaEmAlteracao = null

    async function buscarPreferencia({
        signal
    } = {}) {
        const resposta =
            await requisicaoAutenticada({
                caminho:
                    endpoints.configuracoesConta,
                ...(signal ? {signal} : {})
            })

        return extrairPreferenciaTema(
            resposta
        )
    }

    function atualizarPreferencia(
        preferencia
    ) {
        const preferenciaSegura =
            validarPreferenciaTema(
                preferencia
            )

        if (alteracaoEmAndamento) {
            if (
                preferenciaEmAlteracao
                === preferenciaSegura
            ) {
                return alteracaoEmAndamento
            }

            return Promise.reject(
                criarErroLocal(
                    'Aguarde a alteração de tema atual.',
                    'ALTERACAO_TEMA_EM_ANDAMENTO'
                )
            )
        }

        preferenciaEmAlteracao =
            preferenciaSegura

        alteracaoEmAndamento =
            requisicaoAutenticada({
                metodo: 'PATCH',
                caminho:
                    endpoints.configuracoesConta,
                corpo: {
                    temaVisual:
                        preferenciaSegura
                }
            })
                .then((resposta) => {
                    const preferenciaPersistida =
                        extrairPreferenciaTema(
                            resposta
                        )

                    if (
                        preferenciaPersistida
                        !== preferenciaSegura
                    ) {
                        throw criarErroLocal(
                            MENSAGEM_ERRO_TEMA,
                            'TEMA_NAO_CONFIRMADO'
                        )
                    }

                    return preferenciaPersistida
                })
                .catch((erro) => {
                    if (
                        erro?.codigo
                        === 'PREFERENCIA_TEMA_INVALIDA'
                        || erro?.codigo
                        === 'ALTERACAO_TEMA_EM_ANDAMENTO'
                        || erro?.codigo
                        === 'TEMA_NAO_CONFIRMADO'
                    ) {
                        throw erro
                    }

                    if (
                        erro
                        && typeof erro === 'object'
                        && !erro.mensagemUsuario
                    ) {
                        erro.mensagemUsuario =
                            MENSAGEM_ERRO_TEMA
                    }

                    throw erro
                })
                .finally(() => {
                    alteracaoEmAndamento = null
                    preferenciaEmAlteracao = null
                })

        return alteracaoEmAndamento
    }

    return Object.freeze({
        buscarPreferencia,
        atualizarPreferencia
    })
}

export {
    MENSAGEM_ERRO_TEMA,
    criarThemePreferenceService,
    extrairPreferenciaTema
}