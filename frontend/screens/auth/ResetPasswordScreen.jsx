/**
 * Tela que confirma uma nova senha usando o token de recuperação recebido.
 */
import { useState } from 'react';
import { LockKeyIcon as LockKey } from 'phosphor-react-native/src/icons/LockKey';
import { WarningCircleIcon as WarningCircle } from 'phosphor-react-native/src/icons/WarningCircle';
import Button from '../../components/common/Button/Button';
import SimpleModal from '../../components/feedback/Modal/SimpleModal';
import PasswordInput from '../../components/forms/PasswordInput';
import { useResetPassword } from '../../features/auth/hooks/useResetPassword';
import AuthLayout from '../../layouts/AuthLayout';

export default function ResetPasswordScreen({
    token, redefinirSenha, aoVoltar, aoEntrar
}) {
    const fluxo = useResetPassword({ redefinirSenha, token });
    const [erroValidacao, setErroValidacao] = useState(null);
    const preenchido = Boolean(fluxo.senha && fluxo.confirmacao);

    function enviar() {
        if (fluxo.senha !== fluxo.confirmacao) {
            setErroValidacao('A confirmação deve ser igual à nova senha.');
            return;
        }
        fluxo.enviar();
    }

    function limparErro() {
        setErroValidacao(null);
        fluxo.limparErro();
    }

    return <>
        <AuthLayout titulo="Nova senha!" aoVoltar={aoVoltar}
            descricao="Crie uma nova senha segura. Escolha uma combinação que você lembre para continuar acompanhando seu ciclo com tranquilidade.">
            <PasswordInput label="Nova senha" value={fluxo.senha}
                onChangeText={fluxo.setSenha} autoComplete="new-password" />
            <PasswordInput label="Confirmar nova senha" value={fluxo.confirmacao}
                onChangeText={fluxo.setConfirmacao} autoComplete="new-password" />
            <Button texto="Confirmar" aoPressionar={enviar}
                desativado={!preenchido} carregando={fluxo.carregando} />
        </AuthLayout>
        <SimpleModal visivel={fluxo.sucesso} icone={LockKey}
            titulo="Senha redefinida com sucesso"
            mensagem="Faça login com sua nova senha."
            acaoPrincipal={{ texto: 'Entrar', aoPressionar: aoEntrar }} />
        <SimpleModal visivel={Boolean(fluxo.erro || erroValidacao)} aoFechar={limparErro}
            icone={WarningCircle} titulo={erroValidacao ? 'Senhas diferentes' : 'Algo deu errado'}
            mensagem={erroValidacao || fluxo.erro}
            acaoPrincipal={{ texto: 'Tentar novamente', variante: 'preto', aoPressionar: limparErro }} />
    </>;
}
