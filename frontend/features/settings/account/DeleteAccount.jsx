//Controla a verificação da senha e a exclusão permanente da conta autenticada.
import { useEffect, useState } from 'react'
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle'
import { TrashIcon } from 'phosphor-react-native/src/icons/Trash'

import AlertModal from '../../../components/feedback/Modal/AlertModal/AlertModal'
import SimpleModal from '../../../components/feedback/Modal/SimpleModal'
import { tema } from '../../../theme'

function DeleteAccount({visivel, onFechar, confirmarSenhaExclusao, excluirConta, onContaExcluida}) {
    const [etapa, setEtapa] = useState('senha')
    const [senha, setSenha] = useState('')
    const [erroSenha, setErroSenha] = useState('')
    const [acaoComErro, setAcaoComErro] = useState(null)
    const [carregando, setCarregando] = useState(false)

    //Remove a senha da memória quando o fluxo é encerrado.
    function limparFluxo() {
        setEtapa('senha')
        setSenha('')
        setErroSenha('')
        setAcaoComErro(null)
        setCarregando(false)
    }

    useEffect(() => {
        if (!visivel) {
            limparFluxo()
        }
    }, [visivel])

    //Fecha o fluxo somente quando nenhuma requisição está em andamento.
    function fechar() {
        if (carregando) {
            return
        }

        limparFluxo()
        onFechar?.()
    }

    //Confere a senha no backend antes de mostrar a confirmação final.
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

    //Confirma a exclusão e permite que o backend verifique novamente a senha.
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

    //Repete somente a operação que apresentou erro.
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
                visivel={visivel && etapa === 'senha'}
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
                visivel={visivel && etapa === 'confirmacao'}
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
                visivel={visivel && etapa === 'erro'}
                aoFechar={fechar}
                icone={WarningCircleIcon}
                corIcone={tema.cores.feedback.erro}
                fundoIcone={tema.cores.neutras.bordaClara}
                titulo="Algo deu errado"
                mensagem={
                    acaoComErro === 'exclusao'
                        ? 'Ocorreu um erro ao apagar sua conta.'
                        : 'Não foi possível concluir esta solicitação. Verifique sua conexão e tente novamente.'
                }
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

export { DeleteAccount }