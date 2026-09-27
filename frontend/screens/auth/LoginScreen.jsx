/**
 * Tela de login que valida credenciais, aciona autenticação e apresenta erros.
 */
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LockKeyIcon as LockKey } from 'phosphor-react-native/src/icons/LockKey';
import Button from '../../components/common/Button/Button';
import SimpleModal from '../../components/feedback/Modal/SimpleModal';
import EmailInput from '../../components/forms/EmailInput';
import PasswordInput from '../../components/forms/PasswordInput';
import { useLogin } from '../../features/auth/hooks/useLogin';
import AuthLayout from '../../layouts/AuthLayout';
import { isValidEmail } from '../../utils/validation/isValidEmail';
import { estilos } from './AuthScreens.styles';

export default function LoginScreen({
    realizarLogin, aoVoltar, aoRecuperarSenha, aoCriarConta, aoEntrar,
    mensagemSucesso, aoDispensarMensagemSucesso
}) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erroValidacao, setErroValidacao] = useState(null);
    const { carregando, erro, enviarLogin, limparErro } = useLogin({ realizarLogin });
    const preenchido = Boolean(email.trim() && senha);

    async function enviar() {
        if (!isValidEmail(email)) {
            setErroValidacao('Informe um e-mail válido.');
            return;
        }
        const resultado = await enviarLogin({ email, senha });
        if (resultado) aoEntrar?.(resultado);
    }

    function limparAviso() {
        setErroValidacao(null);
        limparErro();
    }

    const rodape = <View style={estilos.rodape}>
        <View style={estilos.separador}><View style={estilos.linha} />
            <Text style={estilos.legenda}>Não tem uma conta?</Text><View style={estilos.linha} /></View>
        <Button texto="Criar conta" variante="bordaLaranja" tamanho="compacto" aoPressionar={aoCriarConta} />
    </View>;

    return <>
        <AuthLayout titulo="Bem-vindo(a) de volta!" aoVoltar={aoVoltar}
            descricao="Que bom te ver de novo por aqui. Relembre-nos quem você é."
            rodape={rodape}>
            <View style={estilos.campos}>
                <EmailInput value={email} onChangeText={setEmail} />
                <PasswordInput value={senha} onChangeText={setSenha} />
            </View>
            {aoRecuperarSenha ? (
                <Pressable onPress={aoRecuperarSenha}>
                    <Text style={estilos.link}>Esqueceu a senha?</Text>
                </Pressable>
            ) : null}
            <Button texto="Entrar" aoPressionar={enviar} desativado={!preenchido} carregando={carregando} />
        </AuthLayout>
        <SimpleModal visivel={Boolean(erro || erroValidacao)} aoFechar={limparAviso} icone={LockKey}
            titulo={erroValidacao ? 'E-mail inválido' : 'Não foi possível entrar'}
            mensagem={erroValidacao || erro}
            acaoPrincipal={{ texto: 'Tentar novamente', aoPressionar: limparAviso }} />
        <SimpleModal visivel={Boolean(mensagemSucesso)}
            aoFechar={aoDispensarMensagemSucesso} icone={LockKey}
            titulo="Operação concluída" mensagem={mensagemSucesso}
            acaoPrincipal={{ texto: 'OK', aoPressionar: aoDispensarMensagemSucesso }} />
    </>;
}
