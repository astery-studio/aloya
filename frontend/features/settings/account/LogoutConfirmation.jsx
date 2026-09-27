//Confirma o logout e encerra a sessão no servidor e no armazenamento seguro.
import { useState } from 'react'
import { WarningCircleIcon } from '../../../components/icons/AppIcons'
import ButtonPopup from '../../../components/common/Button/ButtonPopup'
import AlertModal from '../../../components/feedback/Modal/AlertModal/AlertModal'
import AppModal from '../../../components/feedback/Modal/AppModal'
import { tema } from '../../../theme'

function ignorarFechamento() {}

function LogoutConfirmation({visivel, onFechar, encerrarSessao, onSessaoEncerrada}) {
    const [carregando, setCarregando] = useState(false)
    const [erroVisivel, setErroVisivel] = useState(false)

    async function confirmarLogout() {
        if (typeof encerrarSessao !== 'function' || carregando) {
            return
        }

        setCarregando(true)
        setErroVisivel(false)

        try {
            const resultado = await encerrarSessao()
            onFechar?.()
            onSessaoEncerrada?.(resultado)
        } catch {
            setErroVisivel(true)
        } finally {
            setCarregando(false)
        }
    }

    return (
        <>
            <AppModal
                variante="simples"
                visivel={visivel && !erroVisivel}
                aoFechar={carregando ? ignorarFechamento : onFechar}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Sair da Conta"
                mensagem="Você deverá realizar login novamente para acessar sua conta."
                destaque="Deseja continuar?"
            >
                <ButtonPopup
                    texto="Sair da conta"
                    variante="branco"
                    aoPressionar={confirmarLogout}
                    carregando={carregando}
                    estilo={{ width: '100%' }}
                />

                <ButtonPopup
                    texto="Voltar"
                    variante="verde"
                    aoPressionar={onFechar}
                    desativado={carregando}
                    estilo={{ width: '100%' }}
                />
            </AppModal>

            <AlertModal
                visivel={erroVisivel}
                aoFechar={() => setErroVisivel(false)}
                titulo="Não foi possível sair"
                mensagem="Não foi possível limpar sua sessão deste aparelho. Tente novamente."
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'vermelho',
                    aoPressionar: confirmarLogout,
                    carregando
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: () => setErroVisivel(false),
                    desativado: carregando
                }}
            />
        </>
    )
}

export { LogoutConfirmation }