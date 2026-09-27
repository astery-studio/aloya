//Controla a verificação da senha e a exclusão permanente da conta autenticada.
import { useState } from 'react'
import { TrashIcon, WarningCircleIcon } from '../../../components/icons/AppIcons'
import AlertModal from '../../../components/feedback/Modal/AlertModal/AlertModal'
import SimpleModal from '../../../components/feedback/Modal/SimpleModal'
import { tema } from '../../../theme'

function FluxoDeleteAccount({onFechar, confirmarSenhaExclusao, excluirConta, onContaExcluida}) {
    const [etapa, setEtapa] = useState('senha')
    const [senha, setSenha] = useState('')
    const [erroSenha, setErroSenha] = useState('')
    const [acaoComErro, setAcaoComErro] = useState(null)
    const [carregando, setCarregando] = useState(false)

    function limparFluxo() {
        setEtapa('senha')
        setSenha('')
        setErroSenha('')
        setAcaoComErro(null)
        setCarregando(false)
    }

    function fechar() {
        if (carregando) {
            return
        }

        limparFluxo()
        onFechar?.()
    }

    async function continuar() {
        if (!senha || carregando || typeof confirmarSenhaExclusao !== 'function') {
            return
        }

        setCarregando(true)
        setErroSenha('')
        setAcaoComErro(null)

        try {
            await confirmarSenhaExclusao({senhaAtual: senha})
            setEtapa('confirmacao')
        } catch (erro) {
            if (erro?.codigo === 'SENHA_ATUAL_INCORRETA') {
                setErroSenha('A senha atual está incorreta.')
                setEtapa('senha')
            } else {
                setAcaoComErro('validacao')
                setEtapa('erro')
            }
        } finally {
            setCarregando(false)
        }
    }

    async function confirmarExclusao() {
        if (typeof excluirConta !== 'function' || carregando) {
            return
        }

        setCarregando(true)
        setErroSenha('')
        setAcaoComErro(null)

        try {
            const resultado = await excluirConta({senhaAtual: senha})
            limparFluxo()
            onFechar?.()
            onContaExcluida?.(resultado)
        } catch (erro) {
            if (erro?.codigo === 'SENHA_ATUAL_INCORRETA') {
                setErroSenha('A senha foi alterada. Digite sua senha atual novamente.')
                setEtapa('senha')
            } else {
                setAcaoComErro('exclusao')
                setEtapa('erro')
            }
        } finally {
            setCarregando(false)
        }
    }

    function tentarNovamente() {
        if (acaoComErro === 'validacao') {
            continuar()
            return
        }

        confirmarExclusao()
    }

    return (
        <>
            <AlertModal
                variante="comSenha"
                visivel={etapa === 'senha'}
                aoFechar={fechar}
                titulo="Confirme sua identidade"
                mensagem="Por segurança, insira sua senha atual para continuar com a exclusão da conta."
                senha={senha}
                aoAlterarSenha={valor => {
                    setSenha(valor)
                    setErroSenha('')
                }}
                erroSenha={erroSenha}
                acaoPrincipal={{
                    texto: 'Continuar',
                    variante: 'vermelho',
                    aoPressionar: continuar,
                    desativado: senha.length === 0,
                    carregando
                }}
            />

            <AlertModal
                visivel={etapa === 'confirmacao'}
                aoFechar={fechar}
                icone={TrashIcon}
                titulo="Excluir conta permanentemente?"
                mensagem="Esta ação é permanente e removerá todos os seus dados de ciclo, diário, anticoncepcionais e rede de apoio."
                destaque="Deseja continuar?"
                acaoPrincipal={{
                    texto: 'Excluir permanentemente',
                    variante: 'vermelho',
                    aoPressionar: confirmarExclusao,
                    carregando
                }}
                acaoSecundaria={{
                    texto: 'Cancelar',
                    variante: 'branco',
                    aoPressionar: fechar,
                    desativado: carregando
                }}
            />

            <SimpleModal
                visivel={etapa === 'erro'}
                aoFechar={fechar}
                icone={WarningCircleIcon}
                corIcone={tema.cores.feedback.erro}
                fundoIcone={tema.cores.neutras.bordaClara}
                titulo="Algo deu errado"
                mensagem={acaoComErro === 'exclusao' ? 'Ocorreu um erro ao apagar sua conta.' : 'Não foi possível concluir esta solicitação. Verifique sua conexão e tente novamente.'}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: tentarNovamente,
                    carregando
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: fechar,
                    desativado: carregando
                }}
            />
        </>
    )
}

function DeleteAccount({visivel, onFechar, confirmarSenhaExclusao, excluirConta, onContaExcluida}) {
    if (!visivel) {
        return null
    }

    return (
        <FluxoDeleteAccount
            onFechar={onFechar}
            confirmarSenhaExclusao={confirmarSenhaExclusao}
            excluirConta={excluirConta}
            onContaExcluida={onContaExcluida}
        />
    )
}

export { DeleteAccount }