//Controla a confirmação por senha e a exclusão permanente da conta autenticada.
import { useEffect, useState } from 'react'
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle'
import AlertModal from '../../../components/feedback/Modal/AlertModal/AlertModal'
import SimpleModal from '../../../components/feedback/Modal/SimpleModal'
import { tema } from '../../../theme'

function DeleteAccount({visivel, onFechar, excluirConta, onContaExcluida}) {
    const [etapa, setEtapa] = useState('senha')
    const [senha, setSenha] = useState('')
    const [erroSenha, setErroSenha] = useState('')
    const [carregando, setCarregando] = useState(false)

    function limparFluxo() {
        setEtapa('senha')
        setSenha('')
        setErroSenha('')
        setCarregando(false)
    }

    useEffect(() => {
        if (!visivel) {
            limparFluxo()
        }
    }, [visivel])

    function fechar() {
        if (carregando) {
            return
        }

        limparFluxo()
        onFechar?.()
    }

    function continuar() {
        if (!senha || carregando) {
            return
        }

        setErroSenha('')
        setEtapa('confirmacao')
    }

    async function confirmarExclusao() {
        if (typeof excluirConta !== 'function' || carregando) {
            return
        }

        setCarregando(true)
        setErroSenha('')

        try {
            const resultado = await excluirConta({senhaAtual: senha})
            limparFluxo()
            onFechar?.()
            onContaExcluida?.(resultado)
        } catch (erro) {
            if (erro?.codigo === 'SENHA_ATUAL_INCORRETA') {
                setErroSenha('A senha atual está incorreta.')
                setEtapa('senha')
            } else {
                setEtapa('erro')
            }
        } finally {
            setCarregando(false)
        }
    }

    return (
        <>
            <AlertModal
                variante="comSenha"
                visivel={visivel && etapa === 'senha'}
                aoFechar={fechar}
                titulo="Confirme sua identidade"
                mensagem="Digite sua senha atual para continuar."
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

            <SimpleModal
                visivel={visivel && etapa === 'confirmacao'}
                aoFechar={fechar}
                icone={WarningCircleIcon}
                corIcone={tema.cores.feedback.erro}
                fundoIcone={tema.cores.icones.anticoncepcionais.vermelho.caixa}
                titulo="Excluir conta permanentemente?"
                mensagem="Esta ação é permanente e removerá todos os seus dados de ciclo, diário, anticoncepcionais e rede de apoio. Deseja continuar?"
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
                visivel={visivel && etapa === 'erro'}
                aoFechar={fechar}
                icone={WarningCircleIcon}
                corIcone={tema.cores.feedback.erro}
                fundoIcone={tema.cores.icones.anticoncepcionais.vermelho.caixa}
                titulo="Algo deu errado"
                mensagem="Não foi possível excluir sua conta. Nenhum dado foi alterado. Tente novamente."
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: confirmarExclusao,
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

export { DeleteAccount }