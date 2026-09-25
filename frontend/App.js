//Inicializa os serviços reais e controla os fluxos autenticados da aplicação.
import {useCallback, useEffect, useRef, useState} from 'react'
import {ActivityIndicator, Text, View} from 'react-native'
import {StatusBar} from 'expo-status-bar'
import {useFonts} from 'expo-font'

import {DMSans_400Regular} from '@expo-google-fonts/dm-sans/400Regular'
import {DMSans_500Medium} from '@expo-google-fonts/dm-sans/500Medium'
import {DMSans_600SemiBold} from '@expo-google-fonts/dm-sans/600SemiBold'
import {DMSans_700Bold} from '@expo-google-fonts/dm-sans/700Bold'

import LoginScreen from './screens/auth/LoginScreen'
import {FlowSelectionScreen} from './screens/testing/FlowSelectionScreen'
import {NewSupportCategoryScreen} from './screens/support-network/NewSupportCategoryScreen'
import {ChangePasswordScreen} from './screens/settings/ChangePasswordScreen'
import {ProfileSettingsScreen} from './screens/settings/ProfileSettingsScreen'
import {SettingsScreen} from './screens/settings/SettingsScreen'
import {criarServicosApp} from './services/createAppServices'
import {obterToken} from './services/auth/tokenStorage'
import {rotas} from './constants/routes'
import {estilos} from './App.style'

//Cria os serviços da aplicação e devolve uma mensagem segura quando a configuração falha.
function criarConfiguracao() {
    try {
        return {
            servicos: criarServicosApp(),
            erro: null
        }
    } catch {
        return {
            servicos: null,
            erro: 'Não foi possível configurar a conexão segura com a API.'
        }
    }
}

//Recebe os dados armazenados no aparelho e informa se existe um token de sessão válido.
function sessaoEhValida(sessao) {
    return sessao !== null && typeof sessao === 'object' && typeof sessao.token === 'string' && Boolean(sessao.token.trim())
}

//Inicializa o aplicativo e controla autenticação e navegação provisória dos fluxos.
export default function App() {
    const [fontesCarregadas, erroFontes] = useFonts({DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold})
    const [configuracao] = useState(criarConfiguracao)
    const [estadoSessao, setEstadoSessao] = useState('verificando')
    const [telaInterna, setTelaInterna] = useState(rotas.selecaoFluxo)
    const [perfil, setPerfil] = useState(null)
    const [carregandoPerfil, setCarregandoPerfil] = useState(false)
    const [erroPerfil, setErroPerfil] = useState(false)
    const requisicaoAtual = useRef(0)
    const controladorPerfilAtual = useRef(null)

    //Busca somente os dados da conta autenticada e ignora respostas antigas ou canceladas.
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
                setTelaInterna(rotas.selecaoFluxo)
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

        //Consulta o armazenamento seguro e restaura uma sessão que já existia no aparelho.
        async function verificarSessao() {
            if (!configuracao.servicos) {
                return
            }

            try {
                const sessao = await obterToken()

                if (!ativo) {
                    return
                }

                const sessaoAutenticada = sessaoEhValida(sessao)

                setEstadoSessao(sessaoAutenticada ? 'autenticada' : 'anonima')
                setTelaInterna(rotas.selecaoFluxo)

                if (sessaoAutenticada) {
                    carregarPerfil()
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

    //Envia as alterações permitidas e mantém o perfil local sincronizado com o backend.
    async function salvarPerfil(alteracoes) {
        const perfilAtualizado = await configuracao.servicos.accountService.atualizarPerfil(alteracoes)

        setPerfil(perfilAtualizado)

        return perfilAtualizado
    }

    //Abre a seleção provisória somente depois que login e armazenamento seguro terminam.
    function concluirLogin() {
        setPerfil(null)
        setErroPerfil(false)
        setTelaInterna(rotas.selecaoFluxo)
        setEstadoSessao('autenticada')
        carregarPerfil()
    }

    //Abre o menu principal do fluxo de configurações.
    function abrirConfiguracoes() {
        setTelaInterna(rotas.configuracoes)
    }

    //Abre o formulário autenticado de criação de categoria.
    function abrirNovaCategoria() {
        setTelaInterna(rotas.novaCategoria)
    }

    //Volta para a tela provisória de escolha dos fluxos.
    function abrirSelecaoFluxos() {
        setTelaInterna(rotas.selecaoFluxo)
    }

    //Abre o perfil sem iniciar outra busca quando os dados já estão sendo carregados.
    function abrirPerfil() {
        setTelaInterna(rotas.perfil)

        if (!perfil && !carregandoPerfil && !erroPerfil) {
            carregarPerfil()
        }
    }

    //Abre a tela de alteração de senha a partir das configurações do perfil.
    function abrirAlteracaoSenha() {
        setTelaInterna(rotas.alterarSenha)
    }

    //Limpa os dados visuais e volta ao login quando a sessão termina ou expira.
    function finalizarSessao() {
        requisicaoAtual.current += 1
        controladorPerfilAtual.current?.abort()
        controladorPerfilAtual.current = null

        setPerfil(null)
        setErroPerfil(false)
        setCarregandoPerfil(false)
        setTelaInterna(rotas.selecaoFluxo)
        setEstadoSessao('anonima')
    }

    if (erroFontes || configuracao.erro || estadoSessao === 'erro') {
        return (
            <View style={estilos.estadoInicial}>
                <Text accessibilityRole="alert" style={estilos.tituloEstado}>Ocorreu um erro</Text>
                <Text style={estilos.textoEstado}>{configuracao.erro || 'Não foi possível acessar a sessão segura deste aparelho.'}</Text>
            </View>
        )
    }

    if (!fontesCarregadas || estadoSessao === 'verificando') {
        return (
            <View style={estilos.estadoInicial}>
                <ActivityIndicator size="small" />
                <Text style={estilos.textoEstado}>Carregando...</Text>
            </View>
        )
    }

    if (estadoSessao === 'anonima') {
        return (
            <>
                <StatusBar style="dark" />

                <LoginScreen
                    realizarLogin={configuracao.servicos.authService.realizarLogin}
                    aoEntrar={concluirLogin}
                />
            </>
        )
    }

    if (telaInterna === rotas.selecaoFluxo) {
        return (
            <View style={estilos.tela}>
                <StatusBar style="dark" />

                <FlowSelectionScreen
                    onAbrirConfiguracoes={abrirConfiguracoes}
                    onAbrirNovaCategoria={abrirNovaCategoria}
                />
            </View>
        )
    }

    if (telaInterna === rotas.novaCategoria) {
        return (
            <View style={estilos.tela}>
                <StatusBar style="dark" />

                <NewSupportCategoryScreen
                    criarCategoria={configuracao.servicos.supportCategoryService.criarCategoria}
                    onVoltar={abrirSelecaoFluxos}
                    onConcluido={abrirSelecaoFluxos}
                    onSessaoExpirada={finalizarSessao}
                />
            </View>
        )
    }

    if (telaInterna === rotas.configuracoes) {
        return (
            <View style={estilos.tela}>
                <StatusBar style="dark" />

                <SettingsScreen onAbrirPerfil={abrirPerfil} />
            </View>
        )
    }

    if (telaInterna === rotas.alterarSenha) {
        return (
            <View style={estilos.tela}>
                <StatusBar style="dark" />

                <ChangePasswordScreen
                    alterarSenha={configuracao.servicos.accountService.alterarSenha}
                    onVoltar={() => setTelaInterna(rotas.perfil)}
                    onConcluido={() => setTelaInterna(rotas.perfil)}
                    onSessaoExpirada={finalizarSessao}
                />
            </View>
        )
    }

    return (
        <View style={estilos.tela}>
            <StatusBar style="dark" />

            <ProfileSettingsScreen
                perfil={perfil}
                carregando={carregandoPerfil}
                erroCarregamento={erroPerfil}
                onRecarregar={carregarPerfil}
                onSalvar={salvarPerfil}
                onVoltar={abrirConfiguracoes}
                onAlterarSenha={abrirAlteracaoSenha}
                excluirConta={configuracao.servicos.accountService.excluirConta}
                encerrarSessao={configuracao.servicos.authService.encerrarSessao}
                onContaExcluida={finalizarSessao}
                onSessaoEncerrada={finalizarSessao}
                confirmarSenhaExclusao={configuracao.servicos.accountService.confirmarSenhaExclusao}
            />
        </View>
    )
}