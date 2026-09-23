import { LockKey, WarningCircle } from 'phosphor-react-native';
import Button from '../../components/common/Button/Button';
import SimpleModal from '../../components/feedback/Modal/SimpleModal';
import PasswordInput from '../../components/forms/PasswordInput';
import { useResetPassword } from '../../features/auth/hooks/useResetPassword';
import AuthLayout from '../../layouts/AuthLayout';

export default function ResetPasswordScreen({
    token, redefinirSenha, aoVoltar, aoEntrar
}) {
    const fluxo = useResetPassword({ redefinirSenha, token });

    return <>
        <AuthLayout titulo="Nova senha!" aoVoltar={aoVoltar}
            descricao="Crie uma nova senha segura. Escolha uma combinação que você lembre para continuar acompanhando seu ciclo com tranquilidade.">
            <PasswordInput label="Nova senha" value={fluxo.senha}
                onChangeText={fluxo.setSenha} autoComplete="new-password" />
            <PasswordInput label="Confirmar nova senha" value={fluxo.confirmacao}
                onChangeText={fluxo.setConfirmacao} autoComplete="new-password" />
            <Button texto="Confirmar" aoPressionar={fluxo.enviar}
                desativado={!fluxo.valido} carregando={fluxo.carregando} />
        </AuthLayout>
        <SimpleModal visivel={fluxo.sucesso} icone={LockKey}
            titulo="Senha redefinida com sucesso"
            mensagem="Faça login com sua nova senha."
            acaoPrincipal={{ texto: 'Entrar', aoPressionar: aoEntrar }} />
        <SimpleModal visivel={Boolean(fluxo.erro)} icone={WarningCircle}
            titulo="Algo deu errado" mensagem={fluxo.erro}
            acaoPrincipal={{ texto: 'Tentar novamente', variante: 'preto', aoPressionar: fluxo.enviar }} />
    </>;
}
