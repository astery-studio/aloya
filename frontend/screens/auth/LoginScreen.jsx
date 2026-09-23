import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LockKey } from 'phosphor-react-native';
import Button from '../../components/common/Button/Button';
import SimpleModal from '../../components/feedback/Modal/SimpleModal';
import EmailInput from '../../components/forms/EmailInput';
import PasswordInput from '../../components/forms/PasswordInput';
import { useLogin } from '../../features/auth/hooks/useLogin';
import AuthLayout from '../../layouts/AuthLayout';
import { isValidEmail } from '../../utils/validation/isValidEmail';
import { estilos } from './AuthScreens.styles';

export default function LoginScreen({
    realizarLogin, aoVoltar, aoRecuperarSenha, aoCriarConta, aoEntrar
}) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const { carregando, erro, enviarLogin, limparErro } = useLogin({ realizarLogin });
    const valido = isValidEmail(email) && Boolean(senha);

    async function enviar() {
        const resultado = await enviarLogin({ email, senha });
        if (resultado) aoEntrar?.(resultado);
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
            <Pressable onPress={aoRecuperarSenha}><Text style={estilos.link}>Esqueceu a senha?</Text></Pressable>
            <Button texto="Entrar" aoPressionar={enviar} desativado={!valido} carregando={carregando} />
        </AuthLayout>
        <SimpleModal visivel={Boolean(erro)} aoFechar={limparErro} icone={LockKey}
            titulo="Não foi possível entrar" mensagem={erro}
            acaoPrincipal={{ texto: 'Tentar novamente', aoPressionar: limparErro }} />
    </>;
}
