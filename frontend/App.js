/**
 * Mostra somente os testes do NavigationField no Expo.
 * É usado temporariamente como entrada do aplicativo.
 * Existe para conferir aparência e toque sem navegar de verdade.
 */

import { Alert, ScrollView, Text, View } from 'react-native'

import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts
} from '@expo-google-fonts/dm-sans'

import { UserIcon } from 'phosphor-react-native/src/icons/User'
import { ArrowsClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowsClockwise'
import { LockIcon } from 'phosphor-react-native/src/icons/Lock'
import { HouseIcon } from 'phosphor-react-native/src/icons/House'
import { BellIcon } from 'phosphor-react-native/src/icons/Bell'
import { InfoIcon } from 'phosphor-react-native/src/icons/Info'
import { ShieldCheckIcon } from 'phosphor-react-native/src/icons/ShieldCheck'
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock'

import { NavigationField } from './components/common/NavigationField/NavigationField'
import { tema } from './theme'

/**
 * Recebe o texto da linha tocada.
 * Mostra uma confirmação simples para testar o onPress.
 * Não retorna valor.
 */
function mostrarToque(label) {
    Alert.alert(
        'Teste de toque',
        `Você tocou em: ${label}`
    )
}

/**
 * Não recebe propriedades.
 * Mostra todas as variantes principais do NavigationField.
 * Retorna a tela temporária de testes.
 */
export default function App() {
    const [fontesCarregadas, erroFontes] =
        useFonts({
            DMSans_400Regular,
            DMSans_500Medium,
            DMSans_600SemiBold,
            DMSans_700Bold
        })

    /**
     * Não recebe dados.
     * Confirma o toque na linha de perfil.
     * Não retorna valor.
     */
    function tocarPerfil() {
        mostrarToque('Configurações de Perfil')
    }

    /**
     * Não recebe dados.
     * Confirma o toque na linha de ciclo.
     * Não retorna valor.
     */
    function tocarCiclo() {
        mostrarToque('Parâmetros do Ciclo')
    }

    /**
     * Não recebe dados.
     * Confirma o toque na linha de senha.
     * Não retorna valor.
     */
    function tocarSenha() {
        mostrarToque('Alterar Senha')
    }

    /**
     * Não recebe dados.
     * Confirma o toque na linha de horário.
     * Não retorna valor.
     */
    function tocarHorario() {
        mostrarToque('08:00')
    }

    /**
     * Não recebe dados.
     * Confirma o toque na linha inicial.
     * Não retorna valor.
     */
    function tocarInicio() {
        mostrarToque('Tela inicial')
    }

    /**
     * Não recebe dados.
     * Confirma o toque na linha de notificações.
     * Não retorna valor.
     */
    function tocarNotificacoes() {
        mostrarToque('Notificações')
    }

    /**
     * Não recebe dados.
     * Confirma o toque na linha informativa.
     * Não retorna valor.
     */
    function tocarSobre() {
        mostrarToque('Sobre a aplicação')
    }

    /**
     * Não recebe dados.
     * Confirma o toque na linha de privacidade.
     * Não retorna valor.
     */
    function tocarPrivacidade() {
        mostrarToque('Políticas de Privacidade')
    }

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
        <ScrollView
            style={{
                flex: 1,
                backgroundColor:
                    tema.cores.neutras.fundoClaro
            }}
            contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 64,
                paddingBottom: 48
            }}
        >
            <Text
                style={{
                    marginBottom: 16,
                    color:
                        tema.cores.neutras
                            .textoPrincipalClaro,
                    fontFamily:
                        'DMSans_700Bold',
                    fontSize: 24
                }}
            >
                NavigationField
            </Text>

            <Text style={{ marginBottom: 12 }}>
                Com borda
            </Text>

            <View style={{ gap: 10 }}>
                <NavigationField
                    label="Configurações de Perfil"
                    icone={UserIcon}
                    onPress={tocarPerfil}
                />

                <NavigationField
                    label="Parâmetros do Ciclo"
                    icone={ArrowsClockwiseIcon}
                    tom="coral"
                    onPress={tocarCiclo}
                />

                <NavigationField
                    label="Alterar Senha"
                    icone={LockIcon}
                    tom="azul"
                    onPress={tocarSenha}
                />

                <NavigationField
                    label="08:00"
                    icone={ClockIcon}
                    variante="botao"
                    onPress={tocarHorario}
                />
            </View>

            <Text
                style={{
                    marginTop: 28,
                    marginBottom: 12
                }}
            >
                Sem borda
            </Text>

            <View style={{ gap: 4 }}>
                <NavigationField
                    label="Tela inicial"
                    icone={HouseIcon}
                    variante="semBorda"
                    onPress={tocarInicio}
                />

                <NavigationField
                    label="Notificações"
                    icone={BellIcon}
                    variante="semBorda"
                    tom="coral"
                    onPress={tocarNotificacoes}
                />

                <NavigationField
                    label="Sobre a aplicação"
                    icone={InfoIcon}
                    variante="semBorda"
                    tom="azul"
                    onPress={tocarSobre}
                />

                <NavigationField
                    label="Políticas de Privacidade"
                    icone={ShieldCheckIcon}
                    variante="semBorda"
                    onPress={tocarPrivacidade}
                />
            </View>

            <Text
                style={{
                    marginTop: 28,
                    marginBottom: 12
                }}
            >
                Casos adicionais
            </Text>

            <View style={{ gap: 10 }}>
                <NavigationField
                    label="Texto comprido para conferir a quebra dentro da linha sem empurrar a seta para fora da tela"
                    icone={UserIcon}
                    onPress={tocarPerfil}
                />

                <NavigationField
                    label="Sem ícone"
                    onPress={tocarPerfil}
                />

                <NavigationField
                    label="Desabilitado"
                    icone={LockIcon}
                    desabilitado
                    onPress={tocarSenha}
                />
            </View>
        </ScrollView>
    )
}