//Aplicativo temporário para testar visualmente a Profile Settings.
import { useState } from 'react'
import { ActivityIndicator, Alert, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular'
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium'
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold'
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold'

import { ProfileSettingsScreen } from './screens/settings/ProfileSettingsScreen'

const ESTADO_INICIAL = 'erro'
const SENHA_TESTE = '123456'

const perfilInicial = {
    id: 1,
    nome: 'Kayla Oliveira',
    email: 'kayla@email.com',
    dataNascimento: '2000-09-21',
    identidadeGenero: 'Mulher Cisgênero',
    consentimentoParentalNecessario: false
}

function esperar(tempo = 700) {
    return new Promise(resolve => setTimeout(resolve, tempo))
}

function precisaConsentimento(dataNascimento) {
    const anoNascimento = Number(String(dataNascimento).slice(0, 4))
    return Number.isFinite(anoNascimento) && new Date().getFullYear() - anoNascimento < 18
}

export default function AppPreview() {
    const [fontesCarregadas] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold })
    const [perfil, setPerfil] = useState(perfilInicial)
    const [estado, setEstado] = useState(ESTADO_INICIAL)

    async function salvarPerfil(alteracoes) {
        await esperar()

        if (alteracoes.email === 'erro@email.com') {
            throw new Error('Falha simulada.')
        }

        if (alteracoes.email === 'duplicado@email.com') {
            const erro = new Error('E-mail duplicado.')
            erro.codigo = 'EMAIL_JA_CADASTRADO'
            throw erro
        }

        const perfilAtualizado = {
            ...perfil,
            ...alteracoes
        }

        perfilAtualizado.consentimentoParentalNecessario = precisaConsentimento(perfilAtualizado.dataNascimento)

        setPerfil(perfilAtualizado)
        return perfilAtualizado
    }

    async function confirmarSenhaExclusao({ senhaAtual }) {
        await esperar()

        if (senhaAtual !== SENHA_TESTE) {
            const erro = new Error('Senha incorreta.')
            erro.codigo = 'SENHA_ATUAL_INCORRETA'
            throw erro
        }

        return true
    }

    async function excluirConta({ senhaAtual }) {
        await esperar()

        if (senhaAtual !== SENHA_TESTE) {
            const erro = new Error('Senha incorreta.')
            erro.codigo = 'SENHA_ATUAL_INCORRETA'
            throw erro
        }

        return { mensagem: 'Conta excluída.' }
    }

    async function encerrarSessao() {
        await esperar()
        return { mensagem: 'Sessão encerrada.' }
    }

    async function recarregar() {
        setEstado('carregando')
        await esperar()
        setEstado('normal')
    }

    if (!fontesCarregadas) {
        return (
            <SafeAreaProvider>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="small" />
                </View>
            </SafeAreaProvider>
        )
    }

    return (
        <SafeAreaProvider>
            <View style={{ flex: 1 }}>
                <StatusBar style="dark" />

                <ProfileSettingsScreen
                    perfil={perfil}
                    carregando={estado === 'carregando'}
                    erroCarregamento={estado === 'erro'}
                    onRecarregar={recarregar}
                    onSalvar={salvarPerfil}
                    onVoltar={() => Alert.alert('Teste', 'A ação de voltar funcionou.')}
                    onAlterarSenha={() => Alert.alert('Teste', 'O botão de alterar senha funcionou.')}
                    confirmarSenhaExclusao={confirmarSenhaExclusao}
                    excluirConta={excluirConta}
                    encerrarSessao={encerrarSessao}
                    onContaExcluida={() => Alert.alert('Teste', 'A exclusão foi concluída.')}
                    onSessaoEncerrada={() => Alert.alert('Teste', 'O logout foi concluído.')}
                />
            </View>
        </SafeAreaProvider>
    )
}