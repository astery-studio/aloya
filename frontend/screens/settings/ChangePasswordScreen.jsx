//Controla a tela completa de alteração de senha e seus avisos de erro e sucesso.
import { useEffect, useRef, useState } from 'react'

import { LockKeyIcon, WarningCircleIcon } from '../../components/icons/AppIcons'
import SimpleModal from '../../components/feedback/Modal/SimpleModal'
import { ChangePassword } from '../../features/settings/security/ChangePassword'
import { SettingsLayout } from '../../layouts/SettingsLayout/SettingsLayout'
import { tema } from '../../theme'

const senhasBloqueadas = new Set([
    'senha',
    'senha123',
    'password',
    'password123',
    '123456789012345',
    'qwertyuiopasdfg',
    'administrador',
    'minhasenhasegura',
    'euamoaloya',
    'aloyaaloyaaloya'
])

const codigosSessaoInvalida = new Set([
    'NAO_AUTENTICADO',
    'TOKEN_INVALIDO',
    'SESSAO_INVALIDA',
    'SESSAO_AUSENTE',
    'SESSAO_ATUAL_INVALIDA'
])

function contarBytesUtf8(texto) {
    let total = 0

    for (const caractere of texto) {
        const codigo = caractere.codePointAt(0)

        if (codigo <= 0x7F) {
            total += 1
        } else if (codigo <= 0x7FF) {
            total += 2
        } else if (codigo <= 0xFFFF) {
            total += 3
        } else {
            total += 4
        }
    }

    return total
}

function validarAlteracaoSenha(senhaAtual, novaSenha, confirmacaoNovaSenha) {
    if (!senhaAtual || !novaSenha || !confirmacaoNovaSenha) {
        return 'Preencha os três campos de senha.'
    }

    if ([...novaSenha].length < 8) {
        return 'A nova senha deve ter pelo menos 8 caracteres.'
    }

    if (contarBytesUtf8(novaSenha) > 72) {
        return 'A nova senha ultrapassa o tamanho máximo permitido.'
    }

    if (senhasBloqueadas.has(novaSenha.toLocaleLowerCase('pt-BR'))) {
        return 'Essa senha é muito comum. Escolha uma senha diferente.'
    }

    if (novaSenha === senhaAtual) {
        return 'A nova senha deve ser diferente da senha atual.'
    }

    if (novaSenha !== confirmacaoNovaSenha) {
        return 'As senhas não coincidem.'
    }

    return null
}

function obterMensagemErro(erro) {
    if (erro?.codigo === 'NOVA_SENHA_IGUAL_ATUAL') {
        return 'A nova senha deve ser diferente da senha atual.'
    }

    if (erro?.codigo === 'SENHA_ALTERADA_CONCORRENTEMENTE') {
        return 'Sua senha foi alterada em outro acesso. Entre novamente e tente outra vez.'
    }

    if (erro?.codigo === 'ERRO_VALIDACAO') {
        const detalhes = Array.isArray(erro.detalhes) ? erro.detalhes : []
        const camposInvalidos = new Set(detalhes.map(item => item?.campo))

        if (camposInvalidos.has('confirmacaoNovaSenha')) {
            return 'As senhas não coincidem.'
        }

        if (camposInvalidos.has('novaSenha')) {
            return 'A nova senha não atende aos requisitos de segurança.'
        }

        return 'Confira os campos de senha e tente novamente.'
    }

    return 'Ocorreu um erro ao alterar a senha. Verifique sua conexão e tente novamente.'
}

function ChangePasswordScreen({alterarSenha, onVoltar, onConcluido, onSessaoExpirada}) {
    const [senhaAtual, setSenhaAtual] = useState('')
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState('')
    const [carregando, setCarregando] = useState(false)
    const [aviso, setAviso] = useState(null)
    const [mensagemAviso, setMensagemAviso] = useState('')
    const montado = useRef(true)
    const operacaoAtual = useRef(null)

    useEffect(() => {
        montado.current = true

        return () => {
            montado.current = false
        }
    }, [])

    function fecharAviso() {
        if (!carregando) {
            setAviso(null)
            setMensagemAviso('')
        }
    }

    function concluirSucesso() {
        setAviso(null)

        if (typeof onConcluido === 'function') {
            onConcluido()
        } else {
            onVoltar?.()
        }
    }

    function voltar() {
        if (!carregando) {
            onVoltar?.()
        }
    }

    function salvarSenha() {
        if (operacaoAtual.current) {
            return operacaoAtual.current
        }

        const mensagemValidacao = validarAlteracaoSenha(senhaAtual, novaSenha, confirmacaoNovaSenha)

        if (mensagemValidacao) {
            setMensagemAviso(mensagemValidacao)
            setAviso('validacao')
            return Promise.resolve(null)
        }

        if (typeof alterarSenha !== 'function') {
            setAviso('erro')
            return Promise.resolve(null)
        }

        const operacao = (async () => {
            setCarregando(true)
            setAviso(null)

            try {
                const resultado = await alterarSenha({
                    senhaAtual,
                    novaSenha,
                    confirmacaoNovaSenha
                })

                if (montado.current) {
                    setSenhaAtual('')
                    setNovaSenha('')
                    setConfirmacaoNovaSenha('')
                    setAviso('sucesso')
                }

                return resultado
            } catch (erro) {
                if (!montado.current) {
                    return null
                }

                if (codigosSessaoInvalida.has(erro?.codigo)) {
                    onSessaoExpirada?.()
                    return null
                }

                if (erro?.codigo === 'SENHA_ATUAL_INCORRETA') {
                    setSenhaAtual('')
                    setAviso('credenciais')
                    return null
                }

                setMensagemAviso(obterMensagemErro(erro))

                if (erro?.codigo === 'ERRO_VALIDACAO' || erro?.codigo === 'NOVA_SENHA_IGUAL_ATUAL') {
                    setAviso('validacao')
                } else {
                    setAviso('erro')
                }

                return null
            } finally {
                operacaoAtual.current = null

                if (montado.current) {
                    setCarregando(false)
                }
            }
        })()

        operacaoAtual.current = operacao
        return operacao
    }

    return (
        <>
            <SettingsLayout titulo="Alterar Senha" onVoltar={voltar}>
                <ChangePassword
                    senhaAtual={senhaAtual}
                    novaSenha={novaSenha}
                    confirmacaoNovaSenha={confirmacaoNovaSenha}
                    onAlterarSenhaAtual={setSenhaAtual}
                    onAlterarNovaSenha={setNovaSenha}
                    onAlterarConfirmacao={setConfirmacaoNovaSenha}
                    onSalvar={salvarSenha}
                    carregando={carregando}
                />
            </SettingsLayout>

            <SimpleModal
                visivel={aviso === 'credenciais'}
                aoFechar={fecharAviso}
                icone={LockKeyIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Não foi possível alterar senha"
                mensagem="Senha incorreta. Verifique os dados e tente novamente."
                acaoPrincipal={{texto: 'Tentar novamente', aoPressionar: fecharAviso}}
            />

            <SimpleModal
                visivel={aviso === 'validacao'}
                aoFechar={fecharAviso}
                icone={LockKeyIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Não foi possível alterar senha"
                mensagem={mensagemAviso}
                acaoPrincipal={{texto: 'Tentar novamente', aoPressionar: fecharAviso}}
            />

            <SimpleModal
                visivel={aviso === 'erro'}
                aoFechar={fecharAviso}
                icone={WarningCircleIcon}
                corIcone={tema.cores.neutras.textoSecundarioClaro}
                fundoIcone={tema.cores.neutras.bordaClara}
                titulo="Algo deu errado"
                mensagem="Ocorreu um erro ao alterar a senha. Verifique sua conexão e tente novamente."
                acaoPrincipal={{texto: 'Tentar novamente', variante: 'preto', aoPressionar: salvarSenha, carregando}}
                acaoSecundaria={{texto: 'Voltar', variante: 'branco', aoPressionar: fecharAviso, desativado: carregando}}
            />

            <SimpleModal
                visivel={aviso === 'sucesso'}
                aoFechar={concluirSucesso}
                icone={LockKeyIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Senha atualizada com sucesso"
                acaoPrincipal={{texto: 'OK', aoPressionar: concluirSucesso}}
            />
        </>
    )
}

export { ChangePasswordScreen, contarBytesUtf8, validarAlteracaoSenha }