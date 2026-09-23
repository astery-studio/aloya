//Executa testes visuais da tela de configurações de perfil sem acessar uma API real.
import { useEffect, useRef, useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'

import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular'
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium'
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold'
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold'

import { ProfileSettingsScreen } from './screens/settings/ProfileSettingsScreen'
import { estilos } from './App.style'

const perfilInicial = Object.freeze({
    id: 1,
    nome: 'Julia',
    email: 'juliadesign2025@gmail.com',
    dataNascimento: '1999-04-08',
    identidadeGenero: 'Mulher Cisgênero',
    atualizadoEm: '2026-09-23T10:00:00.000Z'
})

//Espera o tempo informado e simula a duração de uma requisição.
function aguardar(tempo) {
    return new Promise(resolve => setTimeout(resolve, tempo))
}

//Recebe o texto e a ação e retorna um botão exclusivo do painel provisório.
function BotaoPainel({texto, onPress, perigo = false, ativo = false}) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={texto}
            style={({ pressed }) => [
                estilos.botaoPainel,
                perigo && estilos.botaoPainelPerigo,
                ativo && estilos.botaoPainelAtivo,
                pressed && estilos.botaoPainelPressionado
            ]}
        >
            <Text style={[
                estilos.textoBotaoPainel,
                perigo && estilos.textoBotaoPainelPerigo,
                ativo && estilos.textoBotaoPainelAtivo
            ]}>
                {texto}
            </Text>
        </Pressable>
    )
}

//Não recebe propriedades e retorna o teste visual completo da tela de perfil.
export default function App() {
    const [fontesCarregadas, erroFontes] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold })
    const [perfil, setPerfil] = useState(perfilInicial)
    const [cenario, setCenario] = useState('carregado')
    const [painelVisivel, setPainelVisivel] = useState(true)
    const [falharProximoSalvamento, setFalharProximoSalvamento] = useState(false)
    const [mensagemTeste, setMensagemTeste] = useState('Escolha um cenário ou feche este painel para testar a tela.')
    const temporizadorCarregamento = useRef(null)

    useEffect(() => {
        return () => {
            if (temporizadorCarregamento.current) {
                clearTimeout(temporizadorCarregamento.current)
            }
        }
    }, [])

    //Mostra uma mensagem no painel quando uma navegação ainda não foi implementada.
    function registrarNavegacao(mensagem) {
        setMensagemTeste(mensagem)
        setPainelVisivel(true)
    }

    //Mostra a tela normalmente carregada.
    function mostrarTelaCarregada() {
        if (temporizadorCarregamento.current) {
            clearTimeout(temporizadorCarregamento.current)
        }

        setCenario('carregado')
        setPainelVisivel(false)
    }

    //Mostra o carregamento por um breve período e depois apresenta o perfil.
    function simularCarregamento() {
        if (temporizadorCarregamento.current) {
            clearTimeout(temporizadorCarregamento.current)
        }

        setCenario('carregando')
        setPainelVisivel(false)

        temporizadorCarregamento.current = setTimeout(() => {
            setCenario('carregado')
            temporizadorCarregamento.current = null
        }, 1800)
    }

    //Mostra a resposta visual usada quando não é possível carregar o perfil.
    function simularErroCarregamento() {
        if (temporizadorCarregamento.current) {
            clearTimeout(temporizadorCarregamento.current)
        }

        setCenario('erro')
        setPainelVisivel(false)
    }

    //Simula o botão Tentar novamente exibido no estado de erro.
    async function recarregarPerfil() {
        setCenario('carregando')
        await aguardar(1200)
        setCenario('carregado')
    }

    //Define se a próxima tentativa de salvar deve retornar um erro controlado.
    function alternarFalhaSalvamento() {
        setFalharProximoSalvamento(valorAtual => !valorAtual)
    }

    //Recebe apenas campos alterados e simula a atualização segura do perfil.
    async function salvarPerfil(alteracoes) {
        await aguardar(900)

        if (falharProximoSalvamento) {
            setFalharProximoSalvamento(false)
            throw new Error('Erro técnico fictício que não deve aparecer para a pessoa usuária.')
        }

        setPerfil(perfilAtual => ({
            ...perfilAtual,
            ...alteracoes,
            atualizadoEm: new Date().toISOString()
        }))

        return {
            configuracoes: {
                ...perfil,
                ...alteracoes
            }
        }
    }

    if (erroFontes) {
        return (
            <View style={estilos.estadoInicial}>
                <Text style={estilos.textoEstadoInicial}>Não foi possível carregar as fontes.</Text>
            </View>
        )
    }

    if (!fontesCarregadas) {
        return (
            <View style={estilos.estadoInicial}>
                <Text style={estilos.textoEstadoInicial}>Carregando teste de configurações...</Text>
            </View>
        )
    }

    return (
        <View style={estilos.tela}>
            <StatusBar style="dark" />

            <ProfileSettingsScreen
                perfil={perfil}
                carregando={cenario === 'carregando'}
                erroCarregamento={cenario === 'erro'}
                onRecarregar={recarregarPerfil}
                onSalvar={salvarPerfil}
                onVoltar={() => registrarNavegacao('A navegação de voltar foi acionada.')}
                onAlterarSenha={() => registrarNavegacao('A tela Alterar Senha será aberta aqui.')}
                onExcluirConta={() => registrarNavegacao('O fluxo DeleteAccount será aberto aqui.')}
                onSair={() => registrarNavegacao('O componente LogoutConfirmation será aberto aqui.')}
            />

            {!painelVisivel ? (
                <Pressable
                    onPress={() => setPainelVisivel(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Abrir painel de testes"
                    style={({ pressed }) => [
                        estilos.abrirPainel,
                        pressed && estilos.abrirPainelPressionado
                    ]}
                >
                    <Text style={estilos.textoAbrirPainel}>Teste</Text>
                </Pressable>
            ) : null}

            <Modal
                visible={painelVisivel}
                transparent
                animationType="fade"
                onRequestClose={() => setPainelVisivel(false)}
            >
                <View style={estilos.fundoPainel}>
                    <View accessibilityViewIsModal style={estilos.painel}>
                        <ScrollView
                            contentContainerStyle={estilos.conteudoPainel}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={estilos.cabecalhoPainel}>
                                <Text style={estilos.tituloPainel}>Teste de Configurações</Text>
                                <Text style={estilos.descricaoPainel}>Este painel é provisório e não envia dados para o backend.</Text>
                            </View>

                            <Text accessibilityLiveRegion="polite" style={estilos.mensagemPainel}>{mensagemTeste}</Text>

                            <View style={estilos.grupoPainel}>
                                <Text style={estilos.tituloGrupo}>Estados da tela</Text>

                                <BotaoPainel
                                    texto="Mostrar perfil carregado"
                                    onPress={mostrarTelaCarregada}
                                    ativo={cenario === 'carregado'}
                                />

                                <BotaoPainel
                                    texto="Testar carregamento"
                                    onPress={simularCarregamento}
                                    ativo={cenario === 'carregando'}
                                />

                                <BotaoPainel
                                    texto="Testar erro de carregamento"
                                    onPress={simularErroCarregamento}
                                    perigo={cenario === 'erro'}
                                />
                            </View>

                            <View style={estilos.grupoPainel}>
                                <Text style={estilos.tituloGrupo}>Salvamento</Text>

                                <BotaoPainel
                                    texto={falharProximoSalvamento ? 'Próximo salvamento falhará' : 'Fazer próximo salvamento falhar'}
                                    onPress={alternarFalhaSalvamento}
                                    perigo={falharProximoSalvamento}
                                />

                                <Text style={estilos.ajudaPainel}>
                                    Ative a falha, feche o painel, edite um campo e pressione Salvar alterações.
                                </Text>
                            </View>

                            <BotaoPainel texto="Fechar painel e testar" onPress={() => setPainelVisivel(false)} ativo />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
}