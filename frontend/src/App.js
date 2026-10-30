/**
 * Inicializa os fluxos públicos e a área autenticada da aplicação.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Linking,
    NativeModules,
    Text
} from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';

import { AppThemeRoot } from './app/AppThemeRoot';
import { criarServicosApp } from './app/createAppServices';
import { CalendarScreenContainer } from './features/calendar/screens/CalendarScreenContainer';
import { ForgotPasswordScreen } from './features/auth/screens/ForgotPasswordScreen';
import LoginScreen from './features/auth/screens/LoginScreen';
import ResetPasswordScreen from './features/auth/screens/ResetPasswordScreen';
import WelcomeScreen from './features/auth/screens/WelcomeScreen';
import { obterDestinoDeRetorno } from './features/auth/utils/authNavigation';
import OnboardingScreen from './features/onboarding/screens/OnboardingScreen';
import { ChangePasswordScreen } from './features/settings/screens/ChangePasswordScreen';
import { ProfileSettingsScreen } from './features/settings/screens/ProfileSettingsScreen';
import { SettingsScreen } from './features/settings/screens/SettingsScreen';
import { ContraceptiveFlow } from './features/contraceptives/ContraceptiveFlow';
import { MembersScreen } from './features/support-network/screens/MembersScreen';
import { NewSupportCategoryScreen } from './features/support-network/screens/NewSupportCategoryScreen';
import { SupportCategoriesScreen } from './features/support-network/screens/SupportCategoriesScreen';
import { CycleEditFlow } from './features/cycles/CycleEditFlow';
import { CycleHistoryFlow } from './features/cycles/CycleHistoryFlow';
import { CycleParametersScreen } from './features/cycles/screens/CycleParametersScreen';
import { CycleTodayContainer } from './features/cycles/screens/CycleTodayContainer';
import { MenstruationRegistrationContainer } from './features/cycles/screens/MenstruationRegistrationContainer';
import { useMenstruationSync } from './features/cycles/hooks/useMenstruationSync';
import { useTheme } from './shared/hooks/useTheme';
import { obterToken } from './shared/storage/tokenStorage';
import { fontFamilies } from './shared/theme';

const telasInternas = Object.freeze({
    configuracoes: 'configuracoes',
    membros: 'membros',
    categoriasPermissao: 'categoriasPermissao',
    ciclos: 'ciclos',
    perfil: 'perfil',
    alterarSenha: 'alterarSenha',
    anticoncepcionais: 'anticoncepcionais',
    novaCategoria: 'novaCategoria',
    calendario: 'calendario',
    cadastrarMenstruacao: 'cadastrarMenstruacao',
    parametrosCiclo: 'parametrosCiclo',
    inicio: 'inicio'
});

// Obtém a URL da API usando o endereço do Expo em desenvolvimento ou a variável de ambiente em produção.
function obterBaseUrl() {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    const script = NativeModules.SourceCode?.scriptURL || '';

    const host = script.match(/^[a-z][a-z\d+.-]*:\/\/([^/:]+)/i)?.[1];

    if (__DEV__ && host) {
        return `http://${host}:3000`;
    }

    return 'http://10.0.2.2:3000';
}

function permitirHttpParaTeste() {
    return process.env.EXPO_PUBLIC_ALLOW_HTTP_FOR_TESTING === 'true';
}

function obterTokenRecuperacao(url) {
    const token = url?.match(/[?&]token=([^&]+)/)?.[1];

    return token ? decodeURIComponent(token) : null;
}

// Verifica se o armazenamento seguro retornou uma sessão com token válido.
function sessaoEhValida(sessao) {
    return (
        sessao !== null &&
        typeof sessao === 'object' &&
        typeof sessao.token === 'string' &&
        Boolean(sessao.token.trim())
    );
}

function EstadoErroApp({ mensagem }) {
    const tema = useTheme();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                padding: 24,
                justifyContent: 'center',
                backgroundColor: tema.cores.interface.fundo
            }}
        >
            <Text
                style={{
                    color: tema.cores.interface.textoPrincipal,
                    fontFamily: fontFamilies.bold,
                    fontSize: 20,
                    textAlign: 'center'
                }}
            >
                Ocorreu um erro
            </Text>

            <Text
                style={{
                    color: tema.cores.interface.textoSecundario,
                    fontFamily: fontFamilies.regular,
                    marginTop: 12,
                    textAlign: 'center'
                }}
            >
                {mensagem}
            </Text>
        </SafeAreaView>
    );
}

function EstadoCarregamentoApp() {
    const tema = useTheme();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                backgroundColor: tema.cores.interface.fundo
            }}
        >
            <ActivityIndicator color={tema.cores.marca.primaria} size="large" />

            <Text
                style={{
                    color: tema.cores.interface.textoPrincipal,
                    fontFamily: fontFamilies.regular
                }}
            >
                Carregando...
            </Text>
        </SafeAreaView>
    );
}

// Inicializa fontes, sessão, serviços e navegação provisória entre as telas.
export default function App() {
    const [fontes, erroFontes] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold
    });

    const [telaPublica, setTelaPublica] = useState('boasVindas');

    const [telaInterna, setTelaInterna] = useState(telasInternas.configuracoes);

    const [origemNovaCategoria, setOrigemNovaCategoria] = useState(telasInternas.membros);

    const [retornoParametros, setRetornoParametros] = useState(telasInternas.configuracoes);
    const [retornoCadastro, setRetornoCadastro] = useState(telasInternas.inicio);
    const [dataInicialCadastro, setDataInicialCadastro] = useState(null);

    const [estadoSessao, setEstadoSessao] = useState('verificando');

    const [tokenRecuperacao, setTokenRecuperacao] = useState(null);

    const [mensagemLogin, setMensagemLogin] = useState(null);

    const [perfil, setPerfil] = useState(null);

    const [carregandoPerfil, setCarregandoPerfil] = useState(false);

    const [erroPerfil, setErroPerfil] = useState(false);

    const [cicloCalendarioEditado, setCicloCalendarioEditado] = useState(null);

    const [revisaoCalendario, setRevisaoCalendario] = useState(0);

    const requisicaoAtual = useRef(0);

    const controladorPerfilAtual = useRef(null);

    const apiUrl = obterBaseUrl();

    const configuracao = useMemo(() => {
        try {
            const emDesenvolvimento = typeof __DEV__ !== 'undefined' && __DEV__;

            return {
                servicos: criarServicosApp({
                    apiUrl,
                    permitirHttpDesenvolvimento: emDesenvolvimento || permitirHttpParaTeste()
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

    const sincronizacaoMenstrual = useMenstruationSync({
        fila: configuracao.servicos?.menstruationSyncQueue,
        ativo: estadoSessao === 'autenticada'
    });

    useEffect(() => {
        console.info(`[Aloya] API configurada em ${apiUrl}`);
    }, [apiUrl]);

    const carregarPerfil = useCallback(async () => {
        if (!configuracao.servicos) {
            return;
        }

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

            if (requisicaoAtual.current === identificador) {
                setPerfil(perfilRecebido);
            }
        } catch (erro) {
            if (erro?.name === 'AbortError') {
                return;
            }

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
            if (!configuracao.servicos) {
                return;
            }

            try {
                const sessao = await obterToken();

                if (!ativo) {
                    return;
                }

                if (sessaoEhValida(sessao)) {
                    setEstadoSessao('autenticada');

                    carregarPerfil();
                } else {
                    setEstadoSessao('anonima');
                }
            } catch {
                if (ativo) {
                    setEstadoSessao('erro');
                }
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

        Linking.getInitialURL().then((url) =>
            abrirLink({
                url
            })
        );

        const inscricao = Linking.addEventListener('url', abrirLink);

        return () => {
            inscricao.remove();
        };
    }, []);

    useEffect(() => {
        const inscricao = BackHandler.addEventListener('hardwareBackPress', () => {
            if (estadoSessao !== 'anonima') return false;
            const destino = obterDestinoDeRetorno(telaPublica);
            if (!destino) return false;
            setTelaPublica(destino);
            return true;
        });

        return () => inscricao.remove();
    }, [estadoSessao, telaPublica]);

    function renderizarComTema(conteudo) {
        return (
            <AppThemeRoot
                service={configuracao.servicos?.themePreferenceService}
                autenticado={estadoSessao === 'autenticada'}
            >
                {conteudo}
            </AppThemeRoot>
        );
    }

    async function salvarPerfil(alteracoes) {
        const perfilAtualizado =
            await configuracao.servicos.accountService.atualizarPerfil(alteracoes);

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

    function concluirCadastro() {
        concluirAutenticacao();
        setTelaInterna(telasInternas.inicio);
    }

    function finalizarSessao(resultado = {}) {
        requisicaoAtual.current += 1;

        controladorPerfilAtual.current?.abort();

        controladorPerfilAtual.current = null;

        setPerfil(null);
        setErroPerfil(false);
        setCarregandoPerfil(false);

        setTelaInterna(telasInternas.configuracoes);

        setOrigemNovaCategoria(telasInternas.membros);

        setTelaPublica('login');

        setMensagemLogin(resultado?.mensagem || null);

        setEstadoSessao('anonima');
    }

    function selecionarAba(aba) {
        if (aba === 'inicio') {
            setTelaInterna(telasInternas.inicio);

            return;
        }

        if (aba === 'membros') {
            setTelaInterna(telasInternas.membros);

            return;
        }

        if (aba === 'ciclos') {
            setTelaInterna(telasInternas.ciclos);

            return;
        }

        if (aba === 'configuracoes') {
            setTelaInterna(telasInternas.configuracoes);
        }
    }

    async function abrirEdicaoPeloCalendario({ registroCicloId }) {
        try {
            const ciclo = await configuracao.servicos.cycleHistoryService.buscar(registroCicloId);

            setCicloCalendarioEditado(ciclo);
        } catch (falha) {
            if (falha?.status === 401) {
                finalizarSessao({
                    mensagem: 'Sua sessão expirou. Entre novamente.'
                });
                return;
            }

            Alert.alert(
                'Algo deu errado',
                falha?.mensagemUsuario ||
                    'Não foi possível carregar este registro. Tente novamente.'
            );
        }
    }

    function abrirNovaCategoria(origem) {
        setOrigemNovaCategoria(origem);
        setTelaInterna(telasInternas.novaCategoria);
    }

    function retornarDaNovaCategoria() {
        setTelaInterna(origemNovaCategoria);
    }

    function abrirParametrosCiclo(origem) {
        setRetornoParametros(origem);
        setTelaInterna(telasInternas.parametrosCiclo);
    }

    if (erroFontes || configuracao.erro || estadoSessao === 'erro') {
        const mensagemErro =
            configuracao.erro ||
            (erroFontes
                ? `Não foi possível carregar as fontes: ${erroFontes.message}`
                : 'Não foi possível acessar a sessão segura deste aparelho.');

        return renderizarComTema(<EstadoErroApp mensagem={mensagemErro} />);
    }

    if (!fontes || estadoSessao === 'verificando') {
        return renderizarComTema(<EstadoCarregamentoApp />);
    }

    let conteudo;

    if (estadoSessao === 'anonima') {
        if (telaPublica === 'boasVindas') {
            conteudo = (
                <WelcomeScreen
                    aoCriarConta={() => setTelaPublica('cadastro')}
                    aoEntrar={() => setTelaPublica('login')}
                />
            );
        }

        if (telaPublica === 'login') {
            conteudo = (
                <LoginScreen
                    realizarLogin={configuracao.servicos.authService.realizarLogin}
                    mensagemSucesso={mensagemLogin}
                    aoDispensarMensagemSucesso={() => setMensagemLogin(null)}
                    aoVoltar={() => setTelaPublica('boasVindas')}
                    aoRecuperarSenha={() => setTelaPublica('recuperarSenha')}
                    aoCriarConta={() => setTelaPublica('cadastro')}
                    aoEntrar={concluirAutenticacao}
                />
            );
        }

        if (telaPublica === 'recuperarSenha') {
            conteudo = (
                <ForgotPasswordScreen
                    solicitarRecuperacao={configuracao.servicos.authService.solicitarRecuperacao}
                    reenviarRecuperacao={configuracao.servicos.authService.solicitarRecuperacao}
                    aoVoltar={() => setTelaPublica('login')}
                    aoConcluir={() => setTelaPublica('login')}
                />
            );
        }

        if (telaPublica === 'redefinirSenha') {
            conteudo = (
                <ResetPasswordScreen
                    token={tokenRecuperacao}
                    redefinirSenha={configuracao.servicos.authService.redefinirSenha}
                    aoVoltar={() => setTelaPublica('login')}
                    aoEntrar={() => setTelaPublica('login')}
                />
            );
        }

        if (telaPublica === 'cadastro') {
            conteudo = (
                <OnboardingScreen
                    cadastrar={configuracao.servicos.authService.cadastrar}
                    verificarEmailDisponivel={
                        configuracao.servicos.authService.verificarEmailDisponivel
                    }
                    aoVoltar={() => setTelaPublica('boasVindas')}
                    aoEntrar={() => setTelaPublica('login')}
                    aoConcluir={concluirCadastro}
                />
            );
        }
    } else if (telaInterna === telasInternas.inicio) {
        conteudo = (
            <CycleTodayContainer
                key={sincronizacaoMenstrual.revisao}
                aoCadastrarMenstruacao={(data) => {
                    setDataInicialCadastro(data);
                    setRetornoCadastro(telasInternas.inicio);
                    setTelaInterna(telasInternas.cadastrarMenstruacao);
                }}
                service={configuracao.servicos.cyclePredictionService}
                aoVoltar={() => setTelaInterna(telasInternas.configuracoes)}
                aoAbrirAnticoncepcional={() => setTelaInterna(telasInternas.anticoncepcionais)}
                aoAbrirCalendario={() => setTelaInterna(telasInternas.calendario)}
                aoSelecionarAba={selecionarAba}
                onSessaoExpirada={finalizarSessao}
            />
        );
    } else if (telaInterna === telasInternas.cadastrarMenstruacao) {
        conteudo = (
            <MenstruationRegistrationContainer
                dataInicial={dataInicialCadastro}
                calendarService={configuracao.servicos.calendarService}
                fila={configuracao.servicos.menstruationSyncQueue}
                onVoltar={() => setTelaInterna(retornoCadastro)}
                onSessaoExpirada={finalizarSessao}
            />
        );
    } else if (telaInterna === telasInternas.calendario) {
        conteudo = (
            <>
                <CalendarScreenContainer
                    key={`${revisaoCalendario}-${sincronizacaoMenstrual.revisao}`}
                    statusSincronizacao={sincronizacaoMenstrual.status}
                    aoTentarSincronizar={sincronizacaoMenstrual.sincronizar}
                    service={configuracao.servicos.calendarService}
                    onSessaoExpirada={finalizarSessao}
                    aoVoltar={() => setTelaInterna(telasInternas.inicio)}
                    aoCadastrarMenstruacao={() => {
                        setDataInicialCadastro(null);
                        setRetornoCadastro(telasInternas.calendario);
                        setTelaInterna(telasInternas.cadastrarMenstruacao);
                    }}
                    aoEditarCiclo={abrirEdicaoPeloCalendario}
                />
                {cicloCalendarioEditado ? (
                    <CycleEditFlow
                        key={cicloCalendarioEditado.id}
                        ciclo={cicloCalendarioEditado}
                        service={configuracao.servicos.cycleHistoryService}
                        onFechar={() => setCicloCalendarioEditado(null)}
                        onAtualizado={() => setRevisaoCalendario((atual) => atual + 1)}
                        onSessaoExpirada={finalizarSessao}
                    />
                ) : null}
            </>
        );
    } else if (telaInterna === telasInternas.membros) {
        conteudo = (
            <MembersScreen
                onAbrirCategorias={() => setTelaInterna(telasInternas.categoriasPermissao)}
                onCriarCategoria={() => abrirNovaCategoria(telasInternas.membros)}
                onSelecionarAba={selecionarAba}
            />
        );
    } else if (telaInterna === telasInternas.categoriasPermissao) {
        conteudo = (
            <SupportCategoriesScreen
                service={configuracao.servicos.supportCategoryService}
                onSessaoExpirada={finalizarSessao}
                onVoltar={() => setTelaInterna(telasInternas.membros)}
                onCriar={() => abrirNovaCategoria(telasInternas.categoriasPermissao)}
                onEditar={(categoria) => Alert.alert('Editar categoria', categoria.nome)}
                onExcluir={(categoria) => Alert.alert('Excluir categoria', categoria.nome)}
            />
        );
    } else if (telaInterna === telasInternas.ciclos) {
        conteudo = (
            <CycleHistoryFlow
                service={configuracao.servicos.cycleHistoryService}
                calendarService={configuracao.servicos.calendarService}
                aoAbrirCalendario={() => setTelaInterna(telasInternas.calendario)}
                onSelecionarAba={selecionarAba}
                onSessaoExpirada={finalizarSessao}
            />
        );
    } else if (telaInterna === telasInternas.configuracoes) {
        conteudo = (
            <SettingsScreen
                onSelecionarAba={selecionarAba}
                onAbrirParametrosCiclo={() => abrirParametrosCiclo(telasInternas.configuracoes)}
                onAbrirPerfil={() => {
                    setTelaInterna(telasInternas.perfil);

                    if (!perfil && !carregandoPerfil && !erroPerfil) {
                        carregarPerfil();
                    }
                }}
            />
        );
    } else if (telaInterna === telasInternas.parametrosCiclo) {
        conteudo = (
            <CycleParametersScreen
                service={configuracao.servicos.cycleParametersService}
                onVoltar={() => setTelaInterna(retornoParametros)}
                onSessaoExpirada={finalizarSessao}
            />
        );
    } else if (telaInterna === telasInternas.novaCategoria) {
        conteudo = (
            <NewSupportCategoryScreen
                criarCategoria={configuracao.servicos.supportCategoryService.criarCategoria}
                onVoltar={retornarDaNovaCategoria}
                onConcluido={retornarDaNovaCategoria}
                onSessaoExpirada={finalizarSessao}
            />
        );
    } else if (telaInterna === telasInternas.anticoncepcionais) {
        conteudo = (
            <ContraceptiveFlow
                key="lista-anticoncepcionais"
                service={configuracao.servicos.contraceptiveService}
                onVoltar={() => setTelaInterna(telasInternas.inicio)}
                onSessaoExpirada={finalizarSessao}
            />
        );
    } else if (telaInterna === telasInternas.alterarSenha) {
        conteudo = (
            <ChangePasswordScreen
                alterarSenha={configuracao.servicos.accountService.alterarSenha}
                onVoltar={() => setTelaInterna(telasInternas.perfil)}
                onConcluido={() => setTelaInterna(telasInternas.perfil)}
                onSessaoExpirada={finalizarSessao}
            />
        );
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
        );
    }

    return renderizarComTema(conteudo);
}
