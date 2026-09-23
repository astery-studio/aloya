//Mostra alertas comuns e confirmações que exigem a senha atual da pessoa usuária.
import { Text, View } from 'react-native'
import { LockKeyIcon } from 'phosphor-react-native/src/icons/LockKey'
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle'

import ButtonPopup from '../../common/Button/ButtonPopup'
import PasswordInput from '../../forms/PasswordInput'
import AppModal from './AppModal'
import { estilos } from './AlertModal.styles'

function ignorarFechamento() {}

export default function AlertModal({variante = 'padrao', visivel, aoFechar, icone, titulo, mensagem, destaque, senha = '', aoAlterarSenha, erroSenha, acaoPrincipal, acaoSecundaria}) {
    const comSenha = variante === 'comSenha'
    const senhaAtual = typeof senha === 'string' ? senha : ''
    const Icone = icone === undefined ? (comSenha ? LockKeyIcon : WarningCircleIcon) : icone
    const acaoPadrao = !comSenha && !acaoPrincipal && typeof aoFechar === 'function' ? { texto: 'Entendi', aoPressionar: aoFechar } : null
    const principal = acaoPrincipal || acaoPadrao
    const secundariaPadrao = comSenha && !acaoSecundaria && typeof aoFechar === 'function' ? { texto: 'Cancelar', aoPressionar: aoFechar } : null
    const secundaria = acaoSecundaria || secundariaPadrao
    const carregando = Boolean(principal?.carregando)
    const possuiAcao = Boolean(principal || secundaria)
    const principalDesativada = Boolean(principal?.desativado || (comSenha && senhaAtual.length === 0))
    const fechamentoDoModal = carregando ? ignorarFechamento : aoFechar

    if (!['padrao', 'comSenha'].includes(variante)) {
        throw new Error(`Variante de AlertModal inválida: ${variante}`)
    }

    if (visivel && comSenha && !acaoPrincipal) {
        throw new Error('AlertModal com senha precisa de uma ação principal.')
    }

    if (visivel && comSenha && typeof aoAlterarSenha !== 'function') {
        throw new Error('AlertModal com senha precisa da função aoAlterarSenha.')
    }

    if (visivel && !possuiAcao) {
        throw new Error('AlertModal precisa de pelo menos uma ação ou de uma função aoFechar.')
    }

    return (
        <AppModal variante={comSenha ? 'acao' : 'alerta'} visivel={visivel} aoFechar={fechamentoDoModal} icone={Icone} titulo={titulo} mensagem={mensagem} destaque={destaque}>
            {comSenha ? (
                <View style={estilos.campoSenha}>
                    <PasswordInput
                        label="Senha atual"
                        placeholder="Senha atual"
                        value={senhaAtual}
                        onChangeText={aoAlterarSenha}
                        variante="popup"
                        desativado={carregando}
                        autoComplete="current-password"
                        textContentType="password"
                        returnKeyType="done"
                    />

                    {erroSenha ? (
                        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={estilos.erroSenha}>
                            {erroSenha}
                        </Text>
                    ) : null}
                </View>
            ) : null}

            {principal ? (
                <ButtonPopup
                    texto={principal.texto}
                    aoPressionar={principal.aoPressionar}
                    variante={principal.variante || 'vermelho'}
                    desativado={principalDesativada}
                    carregando={carregando}
                    rotuloAcessibilidade={principal.rotuloAcessibilidade}
                    estilo={{ width: '100%' }}
                />
            ) : null}

            {secundaria ? (
                <ButtonPopup
                    texto={secundaria.texto}
                    aoPressionar={secundaria.aoPressionar}
                    variante={secundaria.variante || 'branco'}
                    desativado={secundaria.desativado || carregando}
                    carregando={secundaria.carregando}
                    rotuloAcessibilidade={secundaria.rotuloAcessibilidade}
                    estilo={{ width: '100%' }}
                />
            ) : null}
        </AppModal>
    )
}