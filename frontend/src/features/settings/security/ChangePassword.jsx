//Mostra os campos e o botão usados para alterar a senha da conta.
import { memo, useMemo } from 'react';
import { View } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import PasswordInput from '../../../shared/components/forms/PasswordInput';
import { criarEstilos } from './ChangePassword.style';
import { useTheme } from '../../../shared/hooks/useTheme';

function ChangePassword({
    senhaAtual,
    novaSenha,
    confirmacaoNovaSenha,
    onAlterarSenhaAtual,
    onAlterarNovaSenha,
    onAlterarConfirmacao,
    onSalvar,
    carregando = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const camposPreenchidos = Boolean(senhaAtual && novaSenha && confirmacaoNovaSenha);
    const semAcao = typeof onSalvar !== 'function';
    const bloqueado = carregando || semAcao;

    return (
        <View style={estilos.container}>
            <View style={estilos.campos}>
                <PasswordInput
                    label="Senha atual"
                    estilo={estilos.campoSenha}
                    estiloEntrada={estilos.textoSenha}
                    estiloLabel={estilos.labelSenha}
                    corIcone={tema.escuro ? '#757575' : undefined}
                    {...(tema.escuro ? { placeholderTextColor: '#999999' } : {})}
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
                    estilo={estilos.campoSenha}
                    estiloEntrada={estilos.textoSenha}
                    estiloLabel={estilos.labelSenha}
                    corIcone={tema.escuro ? '#757575' : undefined}
                    {...(tema.escuro ? { placeholderTextColor: '#999999' } : {})}
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
                    estilo={estilos.campoSenha}
                    estiloEntrada={estilos.textoSenha}
                    estiloLabel={estilos.labelSenha}
                    corIcone={tema.escuro ? '#757575' : undefined}
                    {...(tema.escuro ? { placeholderTextColor: '#999999' } : {})}
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
    );
}

export default memo(ChangePassword);
export { ChangePassword };
