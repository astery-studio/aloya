/**
 * Inicializa os fluxos públicos e a área autenticada de configurações.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Linking, NativeModules, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import LoginScreen from './screens/auth/LoginScreen';
import ResetPasswordScreen from './screens/auth/ResetPasswordScreen';
import WelcomeScreen from './screens/auth/WelcomeScreen';
import OnboardingScreen from './screens/onboarding/OnboardingScreen';
import { ChangePasswordScreen } from './screens/settings/ChangePasswordScreen';
import { ProfileSettingsScreen } from './screens/settings/ProfileSettingsScreen';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { ContraceptiveFlow } from './features/contraceptives/ContraceptiveFlow';
import { NewSupportCategoryScreen } from './screens/support-network/NewSupportCategoryScreen';
import { criarServicosApp } from './services/createAppServices';
import { obterToken } from './services/auth/tokenStorage';
import { cores, fontFamilies } from './theme';

const telasInternas = Object.freeze({
    configuracoes: 'configuracoes',
    perfil: 'perfil',
    alterarSenha: 'alterarSenha',
    anticoncepcionais: 'anticoncepcionais',
    novaCategoria: 'novaCategoria'
});

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

function obterTokenRecuperacao(url) {
    const token = url?.match(/[?&]token=([^&]+)/)?.[1];
    return token ? decodeURIComponent(token) : null;
}

function sessaoEhValida(sessao) {
    return sessao !== null
        && typeof sessao === 'object'
        && typeof sessao.token === 'string'
        && Boolean(sessao.token.trim());
}

export default function App() {
    const [fontes, erroFontes] = useFonts({
        DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold
    });
    const [telaPublica, setTelaPublica] = useState('boasVindas');
    const [telaInterna, setTelaInterna] = useState(telasInternas.configuracoes);
    const [estadoSessao, setEstadoSessao] = useState('verificando');
    const [tokenRecuperacao, setTokenRecuperacao] = useState(null);
    const [mensagemLogin, setMensagemLogin] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [carregandoPerfil, setCarregandoPerfil] = useState(false);
    const [erroPerfil, setErroPerfil] = useState(false);
    const requisicaoAtual = useRef(0);
    const controladorPerfilAtual = useRef(null);
    const apiUrl = obterBaseUrl();

    const configuracao = useMemo(() => {
        try {
            const emDesenvolvimento = typeof __DEV__ !== 'undefined' && __DEV__;
            return {
                servicos: criarServicosApp({
                    apiUrl,
                    permitirHttpDesenvolvimento: emDesenvolvimento
                }),
                erro: null
            };
        } catch {
            return {
                servicos: null,
                erro: 'Não foi possível configurar a conexão com a API.'
            };
        }
    }, [apiUrl]);

    useEffect(() => {
        console.info(`[Aloya] API configurada em ${apiUrl}`);
    }, [apiUrl]);

    const carregarPerfil = useCallback(async () => {
        if (!configuracao.servicos) return;

        controladorPerfilAtual.current?.abort();
        const controlador = new AbortController();
        const identificador = requisicaoAtual.current + 1;
        controladorPerfilAtual.current = controlador;
        requisicaoAtual.current = identificador;
        setCarregandoPerfil(true);
        setErroPerfil(false);

        try {
            const perfilRecebido = await configuracao.servicos.accountService.buscarPerfil({
                signal: controlador.signal
            });
            if (requisicaoAtual.current === identificador) setPerfil(perfilRecebido);
        } catch (erro) {
            if (erro?.name === 'AbortError') return;
            if (erro?.status === 401) {
                setPerfil(null);
                setTelaInterna(telasInternas.configuracoes);
                setTelaPublica('login');
                setEstadoSessao('anonima');
            } else if (requisicaoAtual.current === identificador) {
                setErroPerfil(true);
            }
        } finally {
            if (requisicaoAtual.current === identificador) {
                controladorPerfilAtual.current = null;
                setCarregandoPerfil(false);
            }
        }
    }, [configuracao.servicos]);

    useEffect(() => {
        let ativo = true;

        async function verificarSessao() {
            if (!configuracao.servicos) return;
            try {
                const sessao = await obterToken();
                if (!ativo) return;
                if (sessaoEhValida(sessao)) {
                    setEstadoSessao('autenticada');
                    carregarPerfil();
                } else {
                    setEstadoSessao('anonima');
                }
            } catch {
                if (ativo) setEstadoSessao('erro');
            }
        }

        verificarSessao();
        return () => {
            ativo = false;
            requisicaoAtual.current += 1;
            controladorPerfilAtual.current?.abort();
            controladorPerfilAtual.current = null;
        };
    }, [carregarPerfil, configuracao.servicos]);

    useEffect(() => {
        function abrirLink({ url }) {
            const token = obterTokenRecuperacao(url);
            if (token) {
                setTokenRecuperacao(token);
                setTelaPublica('redefinirSenha');
                setEstadoSessao('anonima');
            }
        }

        Linking.getInitialURL().then((url) => abrirLink({ url }));
        const inscricao = Linking.addEventListener('url', abrirLink);
        return () => inscricao.remove();
    }, []);

    async function salvarPerfil(alteracoes) {
        const perfilAtualizado = await configuracao.servicos.accountService.atualizarPerfil(alteracoes);
        setPerfil(perfilAtualizado);
        return perfilAtualizado;
    }

    function concluirAutenticacao() {
        setMensagemLogin(null);
        setPerfil(null);
        setErroPerfil(false);
        setTelaInterna(telasInternas.configuracoes);
        setEstadoSessao('autenticada');
        carregarPerfil();
    }

    function finalizarSessao(resultado = {}) {
        requisicaoAtual.current += 1;
        controladorPerfilAtual.current?.abort();
        controladorPerfilAtual.current = null;
        setPerfil(null);
        setErroPerfil(false);
        setCarregandoPerfil(false);
        setTelaInterna(telasInternas.configuracoes);
        setTelaPublica('login');
        setMensagemLogin(resultado?.mensagem || null);
        setEstadoSessao('anonima');
    }

    if (erroFontes || configuracao.erro || estadoSessao === 'erro') {
        return (
            <SafeAreaView style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
                <Text style={{ fontFamily: fontFamilies.bold, fontSize: 20, textAlign: 'center' }}>
                    Ocorreu um erro
                </Text>
                <Text style={{ fontFamily: fontFamilies.regular, marginTop: 12, textAlign: 'center' }}>
                    {configuracao.erro || (erroFontes
                        ? `Não foi possível carregar as fontes: ${erroFontes.message}`
                        : 'Não foi possível acessar a sessão segura deste aparelho.')}
                </Text>
            </SafeAreaView>
        );
    }

    if (!fontes || estadoSessao === 'verificando') {
        return (
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <ActivityIndicator color={cores.marca.primaria} size="large" />
                <Text>Carregando...</Text>
            </SafeAreaView>
        );
    }

    let conteudo;
    if (estadoSessao === 'anonima') {
        if (telaPublica === 'boasVindas') conteudo = <WelcomeScreen
            aoCriarConta={() => setTelaPublica('cadastro')}
            aoEntrar={() => setTelaPublica('login')} />;
        if (telaPublica === 'login') conteudo = <LoginScreen
            realizarLogin={configuracao.servicos.authService.realizarLogin}
            mensagemSucesso={mensagemLogin}
            aoDispensarMensagemSucesso={() => setMensagemLogin(null)}
            aoVoltar={() => setTelaPublica('boasVindas')}
            aoRecuperarSenha={() => setTelaPublica('recuperarSenha')}
            aoCriarConta={() => setTelaPublica('cadastro')}
            aoEntrar={concluirAutenticacao} />;
        if (telaPublica === 'recuperarSenha') conteudo = <ForgotPasswordScreen
            solicitarRecuperacao={configuracao.servicos.authService.solicitarRecuperacao}
            reenviarRecuperacao={configuracao.servicos.authService.solicitarRecuperacao}
            aoVoltar={() => setTelaPublica('login')}
            aoConcluir={() => setTelaPublica('login')} />;
        if (telaPublica === 'redefinirSenha') conteudo = <ResetPasswordScreen
            token={tokenRecuperacao}
            redefinirSenha={configuracao.servicos.authService.redefinirSenha}
            aoVoltar={() => setTelaPublica('login')}
            aoEntrar={() => setTelaPublica('login')} />;
        if (telaPublica === 'cadastro') conteudo = <OnboardingScreen
            cadastrar={configuracao.servicos.authService.cadastrar}
            verificarEmailDisponivel={configuracao.servicos.authService.verificarEmailDisponivel}
            aoVoltar={() => setTelaPublica('boasVindas')}
            aoEntrar={() => setTelaPublica('login')}
            aoConcluir={concluirAutenticacao} />;
    } else if (telaInterna === telasInternas.configuracoes) {
        conteudo = <SettingsScreen
            onAbrirNovaCategoria={() => setTelaInterna(telasInternas.novaCategoria)}
            onAbrirAnticoncepcionais={() => setTelaInterna(telasInternas.anticoncepcionais)}
            onAbrirPerfil={() => {
                setTelaInterna(telasInternas.perfil);
                if (!perfil && !carregandoPerfil && !erroPerfil) carregarPerfil();
            }} />;
    } else if (telaInterna === telasInternas.novaCategoria) {
        conteudo = <NewSupportCategoryScreen
            criarCategoria={configuracao.servicos.supportCategoryService.criarCategoria}
            onVoltar={() => setTelaInterna(telasInternas.configuracoes)}
            onConcluido={() => setTelaInterna(telasInternas.configuracoes)}
            onSessaoExpirada={finalizarSessao} />;
    } else if (telaInterna === telasInternas.anticoncepcionais) {
        conteudo = <ContraceptiveFlow
            service={configuracao.servicos.contraceptiveService}
            onVoltar={() => setTelaInterna(telasInternas.configuracoes)}
            onSessaoExpirada={finalizarSessao} />;
    } else if (telaInterna === telasInternas.alterarSenha) {
        conteudo = <ChangePasswordScreen
            alterarSenha={configuracao.servicos.accountService.alterarSenha}
            onVoltar={() => setTelaInterna(telasInternas.perfil)}
            onConcluido={() => setTelaInterna(telasInternas.perfil)}
            onSessaoExpirada={finalizarSessao} />;
    } else {
        conteudo = <ProfileSettingsScreen
            perfil={perfil}
            carregando={carregandoPerfil}
            erroCarregamento={erroPerfil}
            onRecarregar={carregarPerfil}
            onSalvar={salvarPerfil}
            onVoltar={() => setTelaInterna(telasInternas.configuracoes)}
            onAlterarSenha={() => setTelaInterna(telasInternas.alterarSenha)}
            confirmarSenhaExclusao={configuracao.servicos.accountService.confirmarSenhaExclusao}
            excluirConta={configuracao.servicos.accountService.excluirConta}
            encerrarSessao={configuracao.servicos.authService.encerrarSessao}
            onContaExcluida={finalizarSessao}
            onSessaoEncerrada={finalizarSessao} />;
    }

    return <View style={{ flex: 1 }}><StatusBar style="dark" />{conteudo}</View>;
}
