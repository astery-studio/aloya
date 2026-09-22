/**
 * Mostra somente os testes do MainLayout no Expo.
 * É usado temporariamente como entrada do aplicativo.
 * Existe para conferir Header, conteúdo e BottomTabBar juntos.
 */

import { useState } from 'react'
import {
    Button,
    ScrollView,
    Text,
    View
} from 'react-native'

import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts
} from '@expo-google-fonts/dm-sans'

import { MainLayout } from './layouts/MainLayout/MainLayout'
import { fontFamilies, tema } from './theme'

const nomesDasAbas = {
    membros: 'Membros',
    ciclos: 'Ciclos',
    inicio: 'Início',
    diario: 'Diário',
    configuracoes: 'Configurações'
}

/**
 * Não recebe propriedades.
 * Mostra as variações do MainLayout e permite trocar a aba ativa.
 * Retorna a tela temporária de teste.
 */
export default function App() {
    const [fontesCarregadas, erroFontes] =
        useFonts({
            DMSans_400Regular,
            DMSans_500Medium,
            DMSans_600SemiBold,
            DMSans_700Bold
        })

    const [abaAtiva, setAbaAtiva] =
        useState('configuracoes')

    const [cabecalhoComVoltar, setCabecalhoComVoltar] =
        useState(false)

    function mostrarCabecalhoComVoltar() {
        setCabecalhoComVoltar(true)
    }

    function voltarParaCabecalhoPadrao() {
        setCabecalhoComVoltar(false)
    }

    if (erroFontes) {
        return (
            <View style={{ padding: 24 }}>
                <Text>
                    Não foi possível carregar as fontes.
                </Text>
            </View>
        )
    }

    if (!fontesCarregadas) {
        return (
            <View style={{ padding: 24 }}>
                <Text>
                    Carregando fontes...
                </Text>
            </View>
        )
    }

    return (
        <MainLayout
            titulo={
                cabecalhoComVoltar
                    ? 'Tela interna'
                    : 'Configurações'
            }
            varianteHeader={
                cabecalhoComVoltar
                    ? 'comVoltar'
                    : 'padrao'
            }
            onVoltar={
                cabecalhoComVoltar
                    ? voltarParaCabecalhoPadrao
                    : undefined
            }
            abaAtiva={abaAtiva}
            onSelecionarAba={setAbaAtiva}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 24,
                    paddingBottom: 32
                }}
            >
                <Text
                    style={{
                        color:
                            tema.cores.neutras
                                .textoSecundarioClaro,
                        fontFamily: fontFamilies.medium,
                        fontSize: 16,
                        lineHeight: 24
                    }}
                >
                    Área de conteúdo da screen
                </Text>

                <View
                    style={{
                        marginTop: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor:
                            tema.cores.neutras.bordaClara,
                        borderRadius:
                            tema.radius.buttonAndInput,
                        backgroundColor:
                            tema.cores.neutras
                                .superficieClara
                    }}
                >
                    <Text
                        style={{
                            color:
                                tema.cores.neutras
                                    .textoPrincipalClaro,
                            fontFamily:
                                fontFamilies.regular,
                            fontSize: 16,
                            lineHeight: 24
                        }}
                    >
                        Aba ativa: {
                            nomesDasAbas[abaAtiva]
                        }
                    </Text>
                </View>

                <View
                    style={{
                        marginTop: 16,
                        gap: 12
                    }}
                >
                    <Button
                        title="Testar Header com voltar"
                        onPress={
                            mostrarCabecalhoComVoltar
                        }
                    />

                    <Button
                        title="Voltar ao Header padrão"
                        onPress={
                            voltarParaCabecalhoPadrao
                        }
                    />
                </View>

                <View
                    style={{
                        height: 400,
                        justifyContent: 'flex-end'
                    }}
                >
                    <Text
                        style={{
                            color:
                                tema.cores.neutras
                                    .textoSecundarioClaro,
                            fontFamily:
                                fontFamilies.regular,
                            fontSize: 14,
                            lineHeight: 20,
                            textAlign: 'center'
                        }}
                    >
                        Role esta área e confirme que o Header
                        e a barra inferior permanecem no lugar.
                    </Text>
                </View>
            </ScrollView>
        </MainLayout>
    )
}