//Inicializa os serviços reais e alterna entre login e configurações de perfil.
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'

import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular'
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium'
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold'
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold'

import LoginScreen from './screens/auth/LoginScreen'
import { ProfileSettingsScreen } from './screens/settings/ProfileSettingsScreen'
import { criarServicosApp } from './services/createAppServices'
import { obterToken } from './services/auth/tokenStorage'
import { estilos } from './App.style'

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

function sessaoEhValida(sessao) {
    return sessao !== null && typeof sessao === 'object' && typeof sessao.token === 'string' && Boolean(sessao.token.trim())
}

export default function App() {
    const [fontesCarregadas, erroFontes] = useFonts({DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold})
    const [configuracao] = useState(criarConfiguracao)
    const [estadoSessao, setEstadoSessao] = useState('verificando')
    const [perfil, setPerfil] = useState(null)
    const [carregandoPerfil, setCarregandoPerfil] = useState(false)
    const [erroPerfil, setErroPerfil] = useState(false)
    const requisicaoAtual = useRef(0)
    const controladorPerfilAtual = useRef(null)

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

        async function verificarSessao() {
            if (!configuracao.servicos) {
                return
            }

            try {
                const sessao = await obterToken()

                if (ativo) {
                    setEstadoSessao(sessaoEhValida(sessao) ? 'autenticada' : 'anonima')
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
    }, [configuracao.servicos])

    useEffect(() => {
        if (estadoSessao === 'autenticada') {
            carregarPerfil()
        }
    }, [estadoSessao, carregarPerfil])

    async function salvarPerfil(alteracoes) {
        const perfilAtualizado = await configuracao.servicos.accountService.atualizarPerfil(alteracoes)
        setPerfil(perfilAtualizado)
        return perfilAtualizado
    }

    function finalizarSessao() {
        requisicaoAtual.current += 1
        controladorPerfilAtual.current?.abort()
        controladorPerfilAtual.current = null
        setPerfil(null)
        setErroPerfil(false)
        setCarregandoPerfil(false)
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
                <LoginScreen realizarLogin={configuracao.servicos.authService.realizarLogin} aoEntrar={() => setEstadoSessao('autenticada')} />
            </>
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
                excluirConta={configuracao.servicos.accountService.excluirConta}
                encerrarSessao={configuracao.servicos.authService.encerrarSessao}
                onContaExcluida={finalizarSessao}
                onSessaoEncerrada={finalizarSessao}
                confirmarSenhaExclusao={configuracao.servicos.accountService.confirmarSenhaExclusao}
            />
        </View>
    )
}