//Mostra os campos e o botão usados para alterar a senha da conta.
import { memo } from 'react'
import { View } from 'react-native'
import ButtonScreen from '../../../components/common/Button/ButtonScreen'
import PasswordInput from '../../../components/forms/PasswordInput'
import { estilos } from './ChangePassword.style'

function ChangePassword({senhaAtual, novaSenha, confirmacaoNovaSenha, onAlterarSenhaAtual, onAlterarNovaSenha, onAlterarConfirmacao, onSalvar, carregando = false}) {
    const camposPreenchidos = Boolean(senhaAtual && novaSenha && confirmacaoNovaSenha)
    const semAcao = typeof onSalvar !== 'function'
    const bloqueado = carregando || semAcao

    return (
        <View style={estilos.container}>
            <View style={estilos.campos}>
                <PasswordInput
                    label="Senha atual"
                    value={senhaAtual}
                    onChangeText={onAlterarSenhaAtual}
                    desativado={carregando}
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="next"
                    maxLength={72}
                />

                <PasswordInput
                    label="Nova senha"
                    value={novaSenha}
                    onChangeText={onAlterarNovaSenha}
                    desativado={carregando}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="next"
                    maxLength={72}
                />

                <PasswordInput
                    label="Confirmar nova senha"
                    value={confirmacaoNovaSenha}
                    onChangeText={onAlterarConfirmacao}
                    onSubmitEditing={camposPreenchidos && !bloqueado ? onSalvar : undefined}
                    desativado={carregando}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    maxLength={72}
                />
            </View>

            <ButtonScreen
                texto="Salvar senha"
                variante="verde"
                aoPressionar={onSalvar}
                desativado={!camposPreenchidos || bloqueado}
                carregando={carregando}
            />
        </View>
    )
}

export default memo(ChangePassword)
export { ChangePassword }