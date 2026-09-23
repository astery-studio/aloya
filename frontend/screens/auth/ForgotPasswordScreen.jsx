/**
 * Tela que solicita e permite reenviar instruções de recuperação por e-mail.
 */
import { useState } from 'react';
import { EnvelopeSimple, WarningCircle } from 'phosphor-react-native';
import Button from '../../components/common/Button/Button';
import SimpleModal from '../../components/feedback/Modal/SimpleModal';
import EmailInput from '../../components/forms/EmailInput';
import { useForgotPassword } from '../../features/auth/hooks/useForgotPassword';
import AuthLayout from '../../layouts/AuthLayout';
import { isValidEmail } from '../../utils/validation/isValidEmail';

export default function ForgotPasswordScreen({
    solicitarRecuperacao, reenviarRecuperacao, aoVoltar, aoConcluir
}) {
    const fluxo = useForgotPassword({ solicitarRecuperacao, reenviarRecuperacao });
    const [erroValidacao, setErroValidacao] = useState(null);
    const preenchido = Boolean(fluxo.email.trim());

    function enviar() {
        if (!isValidEmail(fluxo.email)) {
            setErroValidacao('Informe um e-mail válido.');
            return;
        }
        fluxo.enviar();
    }

    function limparErro() {
        setErroValidacao(null);
        fluxo.limparErro();
    }

    return <>
        <AuthLayout titulo="Esqueceu a senha?" aoVoltar={aoVoltar}
            descricao="Digite seu e-mail cadastrado e enviaremos um link para você redefinir seu acesso de forma segura.">
            <EmailInput value={fluxo.email} onChangeText={fluxo.setEmail} />
            <Button texto="Enviar" aoPressionar={enviar}
                desativado={!preenchido} carregando={fluxo.carregando} />
        </AuthLayout>
        <SimpleModal visivel={Boolean(fluxo.resultado)} icone={EnvelopeSimple}
            titulo="E-mail enviado"
            mensagem="Se este e-mail estiver cadastrado, você receberá as instruções em breve."
            acaoPrincipal={{ texto: 'Entendi', aoPressionar: aoConcluir }}
            acaoSecundaria={{ texto: 'Enviar Novamente', aoPressionar: fluxo.reenviar,
                carregando: fluxo.carregando }} />
        <SimpleModal visivel={Boolean(fluxo.erro || erroValidacao)} aoFechar={limparErro}
            icone={WarningCircle} titulo={erroValidacao ? 'E-mail inválido' : 'Algo deu errado'}
            mensagem={erroValidacao || fluxo.erro}
            acaoPrincipal={{ texto: 'Tentar novamente', variante: 'preto', aoPressionar: limparErro }} />
    </>;
}
