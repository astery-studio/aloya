//Mostra somente os componentes de configurações para testes visuais no Expo.
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'

import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular'
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium'
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold'
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold'

import { GenderSelector } from './features/settings/profile/GenderSelector'
import { ProfileField } from './features/settings/profile/ProfileField'
import { SettingsLayout } from './layouts/SettingsLayout/SettingsLayout'
import { estilos } from './App.style'

//Não recebe propriedades e retorna a galeria provisória dos componentes de configurações.
export default function App() {
    const [fontesCarregadas, erroFontes] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold })
    const [generoSelecionado, setGeneroSelecionado] = useState('Mulher Cisgênero')
    const [seletorGeneroVisivel, setSeletorGeneroVisivel] = useState(false)
    const [mostrarRodape, setMostrarRodape] = useState(true)
    const [mensagem, setMensagem] = useState('Toque nos componentes para testar as interações.')

    //Recebe uma mensagem e mostra qual interação foi executada durante o teste.
    function registrarAcao(novaMensagem) {
        setMensagem(novaMensagem)
    }

    //Recebe a identidade escolhida, atualiza o teste e fecha o painel.
    function selecionarGenero(novoGenero) {
        setGeneroSelecionado(novoGenero)
        setSeletorGeneroVisivel(false)
        registrarAcao(`Identidade selecionada: ${novoGenero}.`)
    }

    //Abre o painel usado para testar a seleção de identidade de gênero.
    function abrirSeletorGenero() {
        setSeletorGeneroVisivel(true)
        registrarAcao('Seletor de identidade de gênero aberto.')
    }

    //Fecha o painel sem alterar a identidade atualmente selecionada.
    function fecharSeletorGenero() {
        setSeletorGeneroVisivel(false)
        registrarAcao('Seletor fechado sem alteração.')
    }

    //Alterna entre as variações do SettingsLayout com e sem rodapé.
    function alternarRodape() {
        setMostrarRodape(valorAtual => !valorAtual)
    }

    if (erroFontes) {
        return (
            <View style={estilos.carregamento}>
                <Text style={estilos.textoCarregamento}>Não foi possível carregar as fontes.</Text>
            </View>
        )
    }

    if (!fontesCarregadas) {
        return (
            <View style={estilos.carregamento}>
                <Text style={estilos.textoCarregamento}>Carregando configurações...</Text>
            </View>
        )
    }

    const rodape = mostrarRodape ? (
        <View style={estilos.rodape}>
            <Pressable
                onPress={() => registrarAcao('Teste do botão Apagar conta. Nenhuma conta foi excluída.')}
                accessibilityRole="button"
                accessibilityLabel="Testar apagar conta"
                style={({ pressed }) => pressed && estilos.linkPressionado}
            >
                <Text style={estilos.linkPerigo}>Apagar conta</Text>
            </Pressable>

            <View style={estilos.separadorRodape} />

            <Pressable
                onPress={() => registrarAcao('Teste do botão Sair. Nenhuma sessão foi encerrada.')}
                accessibilityRole="button"
                accessibilityLabel="Testar sair"
                style={({ pressed }) => pressed && estilos.linkPressionado}
            >
                <Text style={estilos.linkNormal}>Sair</Text>
            </Pressable>
        </View>
    ) : null

    return (
        <>
            <StatusBar style="dark" />

            <SettingsLayout
                titulo="Configurações de Perfil"
                onVoltar={() => registrarAcao('Botão Voltar pressionado.')}
                rodape={rodape}
            >
                <View style={estilos.conteudo}>
                    <Text accessibilityLiveRegion="polite" style={estilos.mensagem}>{mensagem}</Text>

                    <View style={estilos.secao}>
                        <Text style={estilos.tituloSecao}>Dados Pessoais</Text>

                        <ProfileField
                            label="Nome"
                            valor="Julia"
                            onPress={() => registrarAcao('Campo Nome pressionado.')}
                        />

                        <ProfileField
                            label="E-mail"
                            valor="juliadesign2025@gmail.com"
                            onPress={() => registrarAcao('Campo E-mail pressionado.')}
                        />

                        <ProfileField
                            label="Data de Nascimento"
                            valor="08/04/1999"
                            onPress={() => registrarAcao('Campo Data de Nascimento pressionado.')}
                        />

                        <ProfileField
                            label="Identidade de Gênero"
                            valor={generoSelecionado}
                            onPress={abrirSeletorGenero}
                        />
                    </View>

                    <View style={estilos.secao}>
                        <Text style={estilos.tituloSecao}>Estados do ProfileField</Text>

                        <ProfileField
                            label="Valor não informado"
                            valor={null}
                            onPress={() => registrarAcao('Campo sem valor pressionado.')}
                        />

                        <ProfileField
                            label="Campo desabilitado"
                            valor="Este campo não pode ser aberto"
                            onPress={() => registrarAcao('Esta ação não deveria ser executada.')}
                            desabilitado
                        />

                        <ProfileField
                            label="Valor muito longo"
                            valor="valor-extremamente-longo-usado-para-conferir-as-reticencias@example.com"
                            onPress={() => registrarAcao('Campo com valor longo pressionado.')}
                        />
                    </View>

                    <View style={estilos.secao}>
                        <Text style={estilos.tituloSecao}>Variações do SettingsLayout</Text>

                        <Pressable
                            onPress={alternarRodape}
                            accessibilityRole="button"
                            accessibilityLabel={mostrarRodape ? 'Ocultar rodapé' : 'Mostrar rodapé'}
                            style={({ pressed }) => [
                                estilos.botaoTeste,
                                pressed && estilos.botaoTestePressionado
                            ]}
                        >
                            <Text style={estilos.textoBotaoTeste}>
                                {mostrarRodape ? 'Testar sem rodapé' : 'Testar com rodapé'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </SettingsLayout>

            <GenderSelector
                visivel={seletorGeneroVisivel}
                valorSelecionado={generoSelecionado}
                onSelecionar={selecionarGenero}
                onFechar={fecharSeletorGenero}
            />
        </>
    )
}