/**
 * Aplicativo provisório para testar o fluxo real de autenticação no Expo Go.
 */
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator, Linking, NativeModules, Text, View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import Button from './components/common/Button/Button';
import { criarAuthService } from './features/auth/services/authService';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import LoginScreen from './screens/auth/LoginScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import WelcomeScreen from './screens/auth/WelcomeScreen';
import OnboardingScreen from './screens/onboarding/OnboardingScreen';
import { criarApiClient } from './services/api/apiClient';
import { cores, fontFamilies } from './theme';

function obterBaseUrl() {
    const script = NativeModules.SourceCode?.scriptURL || '';
    // O Expo Go pode informar o bundle usando exp://, além de http(s)://.
    const host = script.match(/^[a-z][a-z\d+.-]*:\/\/([^/:]+)/i)?.[1];
    // Em desenvolvimento, o host do bundle é a fonte mais confiável e evita
    // manter um IP antigo carregado na memória do Metro.
    if (__DEV__ && host) return `http://${host}:3000`;
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    return 'http://10.0.2.2:3000';
}

function obterToken(url) {
    const token = url?.match(/[?&]token=([^&]+)/)?.[1];
    return token ? decodeURIComponent(token) : null;
}

export default function App() {
    const [fontes, erroFontes] = useFonts({
        DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold
    });
    const [tela, setTela] = useState('boasVindas');
    const [tokenRecuperacao, setTokenRecuperacao] = useState(null);
    const apiUrl = obterBaseUrl();
    useEffect(() => {
        console.info(`[Aloya] API configurada em ${apiUrl}`);
    }, [apiUrl]);
    const auth = useMemo(() => {
        const { requisicao } = criarApiClient({ baseUrl: apiUrl });
        return criarAuthService({ requisicao });
    }, [apiUrl]);

    useEffect(() => {
        function abrirLink({ url }) {
            const token = obterToken(url);
            if (token) {
                setTokenRecuperacao(token);
                setTela('redefinirSenha');
            }
        }
        Linking.getInitialURL().then((url) => abrirLink({ url }));
        const inscricao = Linking.addEventListener('url', abrirLink);
        return () => inscricao.remove();
    }, []);

    if (erroFontes) {
        return (
            <SafeAreaView style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
                <Text>Não foi possível carregar as fontes: {erroFontes.message}</Text>
            </SafeAreaView>
        );
    }
    if (!fontes) {
        return (
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <ActivityIndicator color={cores.marca.primaria} size="large" />
                <Text>Carregando o fluxo de autenticação...</Text>
            </SafeAreaView>
        );
    }

    let conteudo;
    if (tela === 'boasVindas') conteudo = <WelcomeScreen
        aoCriarConta={() => setTela('cadastro')} aoEntrar={() => setTela('login')} />;
    if (tela === 'login') conteudo = <LoginScreen realizarLogin={auth.realizarLogin}
        aoVoltar={() => setTela('boasVindas')} aoRecuperarSenha={() => setTela('recuperarSenha')}
        aoCriarConta={() => setTela('cadastro')} aoEntrar={() => setTela('autenticado')} />;
    if (tela === 'recuperarSenha') conteudo = <ForgotPasswordScreen
        solicitarRecuperacao={auth.solicitarRecuperacao}
        reenviarRecuperacao={auth.solicitarRecuperacao}
        aoVoltar={() => setTela('login')} aoConcluir={() => setTela('login')} />;
    if (tela === 'redefinirSenha') conteudo = <ResetPasswordScreen
        token={tokenRecuperacao} redefinirSenha={auth.redefinirSenha}
        aoVoltar={() => setTela('login')} aoEntrar={() => setTela('login')} />;
    if (tela === 'cadastro') conteudo = <OnboardingScreen cadastrar={auth.cadastrar}
        verificarEmailDisponivel={auth.verificarEmailDisponivel}
        aoVoltar={() => setTela('boasVindas')} aoEntrar={() => setTela('login')}
        aoConcluir={() => setTela('autenticado')} />;
    if (tela === 'autenticado') conteudo = (
        <SafeAreaView style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 24,
            backgroundColor: cores.neutras.fundoClaro }}>
            <Text style={{ fontFamily: fontFamilies.bold, fontSize: 28, textAlign: 'center' }}>
                Autenticação concluída
            </Text>
            <Text style={{ fontFamily: fontFamilies.regular, fontSize: 16, textAlign: 'center' }}>
                A API respondeu com sucesso e a sessão foi armazenada neste aparelho.
            </Text>
            <Button texto="Voltar ao início" variante="verde"
                aoPressionar={() => setTela('boasVindas')} />
        </SafeAreaView>
    );

    return <><StatusBar style="dark" />{conteudo}</>;
}
