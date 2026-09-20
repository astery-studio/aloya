/**
 * Mostra somente o teste da navegação inferior.
 * É usado temporariamente como entrada do aplicativo no Expo.
 * Existe para conferir as cinco variantes sem abrir telas reais.
 */

import { useState } from 'react'
import { Text, View } from 'react-native'

import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts
} from '@expo-google-fonts/dm-sans'

import { BottomTabBar } from './components/navigation/BottomTab/BottomTabBar/BottomTabBar'
import { tema } from './theme'

const nomesDasAbas = {
    membros: 'Membros',
    ciclos: 'Ciclos',
    inicio: 'Início',
    diario: 'Diário',
    configuracoes: 'Configurações'
}

/**
 * Não recebe propriedades.
 * Mostra uma tela simples e permite testar as cinco abas.
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
        useState('inicio')

    if (erroFontes) {
        return (
            <Text>
                Não foi possível carregar as fontes.
            </Text>
        )
    }

    if (!fontesCarregadas) {
        return (
            <Text>Carregando fontes...</Text>
        )
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor:
                    tema.cores.neutras.fundoClaro
            }}
        >
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Text
                    style={{
                        color:
                            tema.cores.neutras
                                .textoPrincipalClaro,
                        fontFamily:
                            'DMSans_700Bold',
                        fontSize: 24
                    }}
                >
                    {nomesDasAbas[abaAtiva]}
                </Text>

                <Text
                    style={{
                        marginTop: 8,
                        color:
                            tema.cores.neutras
                                .textoSecundarioClaro
                    }}
                >
                    Toque em cada item da barra.
                </Text>
            </View>

            <BottomTabBar
                abaAtiva={abaAtiva}
                onSelecionar={setAbaAtiva}
            />
        </View>
    )
}