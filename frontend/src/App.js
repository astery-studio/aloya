/**
 * Inicializa os fluxos públicos e a área autenticada da aplicação.
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
import ForgotPasswordScreen from './features/auth/screens/ForgotPasswordScreen';
import LoginScreen from './features/auth/screens/LoginScreen';
import ResetPasswordScreen from './features/auth/screens/ResetPasswordScreen';
import WelcomeScreen from './features/auth/screens/WelcomeScreen';
import OnboardingScreen from './features/onboarding/screens/OnboardingScreen';
import { ChangePasswordScreen } from './features/settings/screens/ChangePasswordScreen';
import { ProfileSettingsScreen } from './features/settings/screens/ProfileSettingsScreen';
import { SettingsScreen } from './features/settings/screens/SettingsScreen';
import { ContraceptiveFlow } from './features/contraceptives/ContraceptiveFlow';
import { MembersScreen } from './features/support-network/screens/MembersScreen';
import { NewSupportCategoryScreen } from './features/support-network/screens/NewSupportCategoryScreen';
import { CycleTodayContainer } from './features/cycles/screens/CycleTodayContainer';
import { CyclesScreen } from './features/cycles/screens/CyclesScreen';
import { criarServicosApp } from './app/createAppServices';
import { obterToken } from './shared/storage/tokenStorage';
import { cores, fontFamilies } from './shared/theme';

const telasInternas = Object.freeze({
    configuracoes: 'configuracoes',
    membros: 'membros',
    ciclos: 'ciclos',
    perfil: 'perfil',
    alterarSenha: 'alterarSenha',
    anticoncepcionais: 'anticoncepcionais',
    novaCategoria: 'novaCategoria',
    inicio: 'inicio'
});

//Obtém a URL da API usando o endereço do Expo em desenvolvimento ou a variável de ambiente em produção.
function obterBaseUrl() {
    const script = NativeModules.SourceCode?.scriptURL || ''
    const host = script.match(/^[a-z][a-z\d+.-]*:\/\/([^/:]+)/i)?.[1]

    if (__DEV__ && host) {
        return `http://${host}:3000`
    }

    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL
    }

    return 'http://10.0.2.2:3000'
}

function permitirHttpParaTeste() {
    return process.env.EXPO_PUBLIC_ALLOW_HTTP_FOR_TESTING === 'true';
}

function obterTokenRecuperacao(url) {
    const token = url?.match(/[?&]token=([^&]+)/)?.[1]

    return token
        ? decodeURIComponent(token)
        : null
}

//Verifica se o armazenamento seguro retornou uma sessão com token válido.
function sessaoEhValida(sessao) {
    return sessao !== null
        && typeof sessao === 'object'
        && typeof sessao.token === 'string'
        && Boolean(sessao.token.trim())
}

//Inicializa fontes, sessão, serviços e navegação provisória entre as telas.
export default function App() {
    const [fontes, erroFontes] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold
    })

    const [telaPublica, setTelaPublica] = useState('boasVindas')
    const [telaInterna, setTelaInterna] = useState(telasInternas.configuracoes)
    const [estadoSessao, setEstadoSessao] = useState('verificando')
    const [tokenRecuperacao, setTokenRecuperacao] = useState(null)
    const [mensagemLogin, setMensagemLogin] = useState(null)
    const [perfil, setPerfil] = useState(null)
    const [carregandoPerfil, setCarregandoPerfil] = useState(false)
    const [erroPerfil, setErroPerfil] = useState(false)
    const [origemAnticoncepcionais, setOrigemAnticoncepcionais] = useState(telasInternas.configuracoes)
    const requisicaoAtual = useRef(0)
    const controladorPerfilAtual = useRef(null)
    const apiUrl = obterBaseUrl()

    const configuracao = useMemo(() => {
        try {
            const emDesenvolvimento = typeof __DEV__ !== 'undefined' && __DEV__

            return {
                servicos: criarServicosApp({
                    apiUrl,
                    permitirHttpDesenvolvimento:
                        emDesenvolvimento || permitirHttpParaTeste()
                }),
                erro: null
            }
        } catch {
            return {
                servicos: null,
                erro: 'Não foi possível configurar a conexão com a API.'
            }
        }
    }, [apiUrl])

    useEffect(() => {
        console.info(`[Aloya] API configurada em ${apiUrl}`)
    }, [apiUrl])

    const carregarPerfil = useCallback(async () => {
        if (!configuracao.servicos) {
            return
        }

        controladorPerfilAtual.current?.abort()

        const controlador = new AbortController()
        const identificador = requisicaoAtual.current + 1

        controladorPerfilAtual.current = controlador
        requisicaoAtual.current = identificador

        setCarregandoPerfil(true)
        setErroPerfil(false)

        try {
            const perfilRecebido = await configuracao.servicos.accountService.buscarPerfil({
                signal: controlador.signal
            })

            if (requisicaoAtual.current === identificador) {
                setPerfil(perfilRecebido)
            }
        } catch (erro) {
            if (erro?.name === 'AbortError') {
                return
            }

            if (erro?.status === 401) {
                setPerfil(null)
                setTelaInterna(telasInternas.configuracoes)
                setTelaPublica('login')
                setEstadoSessao('anonima')
            } else if (requisicaoAtual.current === identificador) {
                setErroPerfil(true)
            }
        } finally {
            if (requisicaoAtual.current === identificador) {
                controladorPerfilAtual.current = null
                setCarregandoPerfil(false)
            }
        }
    }, [configuracao.servicos])

    useEffect(() => {
        let ativo = true

        //Consulta o armazenamento seguro e restaura somente uma sessão válida.
        async function verificarSessao() {
            if (!configuracao.servicos) {
                return
            }

            try {
                const sessao = await obterToken()

                if (!ativo) {
                    return
                }

                if (sessaoEhValida(sessao)) {
                    setEstadoSessao('autenticada')
                    carregarPerfil()
                } else {
                    setEstadoSessao('anonima')
                }
            } catch {
                if (ativo) {
                    setEstadoSessao('erro')
                }
            }
        }

        verificarSessao()

        return () => {
            ativo = false
            requisicaoAtual.current += 1
            controladorPerfilAtual.current?.abort()
            controladorPerfilAtual.current = null
        }
    }, [carregarPerfil, configuracao.servicos])

    useEffect(() => {
        //Abre a tela de redefinição somente quando o link contém um token.
        function abrirLink({url}) {
            const token = obterTokenRecuperacao(url)

            if (token) {
                setTokenRecuperacao(token)
                setTelaPublica('redefinirSenha')
                setEstadoSessao('anonima')
            }
        }

        Linking.getInitialURL().then(url => abrirLink({
            url
        }))

        const inscricao = Linking.addEventListener(
            'url',
            abrirLink
        )

        return () => {
            inscricao.remove()
        }
    }, [])

    //Envia as alterações do perfil e mantém a tela sincronizada com a resposta da API.
    async function salvarPerfil(alteracoes) {
        const perfilAtualizado = await configuracao.servicos.accountService.atualizarPerfil(alteracoes)

        setPerfil(perfilAtualizado)

        return perfilAtualizado
    }

    //Finaliza o fluxo de autenticação e inicia o carregamento da área interna.
    function concluirAutenticacao() {
        setMensagemLogin(null)
        setPerfil(null)
        setErroPerfil(false)
        setTelaInterna(telasInternas.configuracoes)
        setEstadoSessao('autenticada')
        carregarPerfil()
    }

    //Limpa os dados locais da área autenticada e retorna para o login.
    function finalizarSessao(resultado = {}) {
        requisicaoAtual.current += 1
        controladorPerfilAtual.current?.abort()
        controladorPerfilAtual.current = null

        setPerfil(null)
        setErroPerfil(false)
        setCarregandoPerfil(false)
        setTelaInterna(telasInternas.configuracoes)
        setTelaPublica('login')
        setMensagemLogin(resultado?.mensagem || null)
        setEstadoSessao('anonima')
    }

    //Recebe a aba da barra inferior e abre as telas internas já disponíveis.
    function selecionarAba(aba) {
        if (aba === 'inicio') {
            setTelaInterna(telasInternas.inicio);
            return;
        }

        if (aba === 'membros') {
            setTelaInterna(telasInternas.membros)
            return
        }

        if (aba === 'ciclos') {
            setTelaInterna(telasInternas.ciclos)
            return
        }

        if (aba === 'configuracoes') {
            setTelaInterna(telasInternas.configuracoes)
        }
    }

    if (erroFontes || configuracao.erro || estadoSessao === 'erro') {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    padding: 24,
                    justifyContent: 'center'
                }}
            >
                <Text
                    style={{
                        fontFamily: fontFamilies.bold,
                        fontSize: 20,
                        textAlign: 'center'
                    }}
                >
                    Ocorreu um erro
                </Text>

                <Text
                    style={{
                        fontFamily: fontFamilies.regular,
                        marginTop: 12,
                        textAlign: 'center'
                    }}
                >
                    {configuracao.erro || (
                        erroFontes
                            ? `Não foi possível carregar as fontes: ${erroFontes.message}`
                            : 'Não foi possível acessar a sessão segura deste aparelho.'
                    )}
                </Text>
            </SafeAreaView>
        )
    }

    if (!fontes || estadoSessao === 'verificando') {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16
                }}
            >
                <ActivityIndicator
                    color={cores.marca.primaria}
                    size="large"
                />

                <Text>
                    Carregando...
                </Text>
            </SafeAreaView>
        )
    }

    let conteudo

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
    } else if (telaInterna === telasInternas.inicio) {
        conteudo = <CycleTodayContainer
            service={configuracao.servicos.cyclePredictionService}
            aoVoltar={() => setTelaInterna(telasInternas.configuracoes)}
            aoAbrirAnticoncepcional={() => {
                setOrigemAnticoncepcionais(telasInternas.inicio)
                setTelaInterna(telasInternas.anticoncepcionais)
            }}
            aoSelecionarAba={selecionarAba}
            onSessaoExpirada={finalizarSessao} />;
    } else if (telaInterna === telasInternas.membros) {
        conteudo = (
            <MembersScreen
                onCriarCategoria={() => setTelaInterna(telasInternas.novaCategoria)}
                onSelecionarAba={selecionarAba}
            />
        )
    } else if (telaInterna === telasInternas.ciclos) {
        conteudo = (
            <CyclesScreen
                onSelecionarAba={selecionarAba}
            />
        )
    } else if (telaInterna === telasInternas.configuracoes) {
        conteudo = (
            <SettingsScreen
                onSelecionarAba={selecionarAba}
                onAbrirAnticoncepcionais={() => {
                    setOrigemAnticoncepcionais(telasInternas.configuracoes)
                    setTelaInterna(telasInternas.anticoncepcionais)
                }}
                onAbrirPerfil={() => {
                    setTelaInterna(telasInternas.perfil)

                    if (!perfil && !carregandoPerfil && !erroPerfil) {
                        carregarPerfil()
                    }
                }}
            />
        )
    } else if (telaInterna === telasInternas.novaCategoria) {
        conteudo = (
            <NewSupportCategoryScreen
                criarCategoria={configuracao.servicos.supportCategoryService.criarCategoria}
                onVoltar={() => setTelaInterna(telasInternas.membros)}
                onConcluido={() => setTelaInterna(telasInternas.membros)}
                onSessaoExpirada={finalizarSessao}
            />
        )
    } else if (telaInterna === telasInternas.anticoncepcionais) {
        conteudo = (
            <ContraceptiveFlow
                service={configuracao.servicos.contraceptiveService}
                onVoltar={() => setTelaInterna(origemAnticoncepcionais)}
                onSessaoExpirada={finalizarSessao}
            />
        )
    } else if (telaInterna === telasInternas.alterarSenha) {
        conteudo = (
            <ChangePasswordScreen
                alterarSenha={configuracao.servicos.accountService.alterarSenha}
                onVoltar={() => setTelaInterna(telasInternas.perfil)}
                onConcluido={() => setTelaInterna(telasInternas.perfil)}
                onSessaoExpirada={finalizarSessao}
            />
        )
    } else {
        conteudo = (
            <ProfileSettingsScreen
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
                onSessaoEncerrada={finalizarSessao}
            />
        )
    }

    return (
        <View style={{flex: 1}}>
            <StatusBar style="dark" />

            {conteudo}
        </View>
    )
}
