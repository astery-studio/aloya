//Controla a tela completa de dados pessoais e suas edições temporárias.
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import ButtonScreen from '../../components/common/Button/ButtonScreen'
import { DatePickerSheet } from '../../components/feedback/DatePickerSheet/DatePickerSheet'
import { EditFieldSheet } from '../../components/feedback/EditFieldSheet/EditFieldSheet'
import { GenderSelector } from '../../features/settings/profile/GenderSelector'
import { ProfileSettings } from '../../features/settings/profile/ProfileSettings'
import { SettingsLayout } from '../../layouts/SettingsLayout/SettingsLayout'
import { tema } from '../../theme'
import { isValidEmail } from '../../utils/validation/isValidEmail'
import { estilos } from './ProfileSettingsScreen.style'

const regexNome = /^[\p{L}]+(?:[ -][\p{L}]+)*$/u

function copiarDadosPerfil(perfil) {
    return {
        nome: perfil?.nome ?? '',
        email: perfil?.email ?? '',
        dataNascimento: perfil?.dataNascimento ?? '',
        identidadeGenero: perfil?.identidadeGenero ?? null
    }
}

function perfilEhValido(perfil) {
    return perfil !== null
        && typeof perfil === 'object'
        && typeof perfil.nome === 'string'
        && typeof perfil.email === 'string'
        && typeof perfil.dataNascimento === 'string'
        && (perfil.identidadeGenero === null || typeof perfil.identidadeGenero === 'string')
}

function obterAlteracoes(dadosOriginais, dadosAtuais) {
    const alteracoes = {}

    Object.keys(dadosAtuais).forEach(campo => {
        if (dadosAtuais[campo] !== dadosOriginais[campo]) {
            alteracoes[campo] = dadosAtuais[campo]
        }
    })

    return alteracoes
}

function obterDataAtualIso() {
    const agora = new Date()
    const dataLocal = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)

    return dataLocal.toISOString().slice(0, 10)
}

function ProfileSettingsScreen({perfil, carregando = false, erroCarregamento = false, onRecarregar, onSalvar, onVoltar, onAlterarSenha, onExcluirConta, onSair}) {
    const [dadosOriginais, setDadosOriginais] = useState(() => copiarDadosPerfil(perfil))
    const [dadosAtuais, setDadosAtuais] = useState(() => copiarDadosPerfil(perfil))
    const [campoTexto, setCampoTexto] = useState(null)
    const [valorCampo, setValorCampo] = useState('')
    const [erroCampo, setErroCampo] = useState('')
    const [generoVisivel, setGeneroVisivel] = useState(false)
    const [dataVisivel, setDataVisivel] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [erroSalvar, setErroSalvar] = useState('')
    const [mensagem, setMensagem] = useState('')

    useEffect(() => {
        if (!perfilEhValido(perfil)) {
            return
        }

        const novosDados = copiarDadosPerfil(perfil)

        setDadosOriginais(novosDados)
        setDadosAtuais(novosDados)
        setErroSalvar('')
        setMensagem('')
    }, [perfil?.nome, perfil?.email, perfil?.dataNascimento, perfil?.identidadeGenero])

    const alteracoes = obterAlteracoes(dadosOriginais, dadosAtuais)
    const possuiAlteracoes = Object.keys(alteracoes).length > 0
    const podeSalvar = possuiAlteracoes && typeof onSalvar === 'function' && !salvando

    function abrirEdicao(campo) {
        if (salvando) {
            return
        }

        setErroSalvar('')
        setMensagem('')

        if (campo === 'identidadeGenero') {
            setGeneroVisivel(true)
            return
        }

        if (campo === 'dataNascimento') {
            setDataVisivel(true)
            return
        }

        setCampoTexto(campo)
        setValorCampo(dadosAtuais[campo])
        setErroCampo('')
    }

    function fecharEdicaoTexto() {
        setCampoTexto(null)
        setValorCampo('')
        setErroCampo('')
    }

    function confirmarEdicaoTexto() {
        const valorNormalizado = valorCampo.trim()

        if (campoTexto === 'nome') {
            const nomeValido = valorNormalizado.length >= 3 && valorNormalizado.length <= 120 && regexNome.test(valorNormalizado)

            if (!nomeValido) {
                setErroCampo('Informe um nome válido usando apenas letras, espaços ou hífens.')
                return
            }
        }

        if (campoTexto === 'email' && !isValidEmail(valorNormalizado)) {
            setErroCampo('Informe um e-mail válido.')
            return
        }

        const valorFinal = campoTexto === 'email' ? valorNormalizado.toLowerCase() : valorNormalizado

        setDadosAtuais(dadosAnteriores => ({...dadosAnteriores, [campoTexto]: valorFinal}))
        fecharEdicaoTexto()
    }

    //Recebe a identidade escolhida, atualiza o rascunho e fecha o painel.
    function selecionarGenero(identidadeGenero) {
        setDadosAtuais(dadosAnteriores => ({...dadosAnteriores, identidadeGenero}))
        setGeneroVisivel(false)
        setErroSalvar('')
        setMensagem('')
    }

    //Recebe uma data ISO do calendário e atualiza o rascunho.
    async function selecionarData(dataNascimento) {
        setDadosAtuais(dadosAnteriores => ({...dadosAnteriores, dataNascimento}))
        setErroSalvar('')
        setMensagem('')

        return true
    }

    //Envia somente os campos alterados e bloqueia envios duplicados.
    async function salvarAlteracoes() {
        if (!podeSalvar) {
            return
        }

        const dadosEnviados = {...dadosAtuais}

        setSalvando(true)
        setErroSalvar('')
        setMensagem('')

        try {
            await onSalvar(Object.freeze({...alteracoes}))
            setDadosOriginais(dadosEnviados)
            setMensagem('Dados atualizados com sucesso.')
        } catch {
            setErroSalvar('Não foi possível salvar suas alterações. Tente novamente.')
        } finally {
            setSalvando(false)
        }
    }

    const rodape = (
        <View style={estilos.rodape}>
            <Pressable
                onPress={onExcluirConta}
                disabled={salvando || typeof onExcluirConta !== 'function'}
                accessibilityRole="button"
                accessibilityLabel="Apagar conta"
                accessibilityState={{ disabled: salvando || typeof onExcluirConta !== 'function' }}
                style={({ pressed }) => [
                    pressed && estilos.acaoPressionada,
                    (salvando || typeof onExcluirConta !== 'function') && estilos.acaoDesabilitada
                ]}
            >
                <Text style={estilos.acaoPerigo}>Apagar conta</Text>
            </Pressable>

            <View style={estilos.separadorRodape} />

            <Pressable
                onPress={onSair}
                disabled={salvando || typeof onSair !== 'function'}
                accessibilityRole="button"
                accessibilityLabel="Sair"
                accessibilityState={{ disabled: salvando || typeof onSair !== 'function' }}
                style={({ pressed }) => [
                    pressed && estilos.acaoPressionada,
                    (salvando || typeof onSair !== 'function') && estilos.acaoDesabilitada
                ]}
            >
                <Text style={estilos.acaoNormal}>Sair</Text>
            </Pressable>
        </View>
    )

    if (carregando) {
        return (
            <SettingsLayout titulo="Configurações de Perfil" onVoltar={onVoltar}>
                <View style={estilos.estadoTela}>
                    <ActivityIndicator size="small" color={tema.cores.marca.secundaria} />
                    <Text style={estilos.textoEstado}>Carregando seus dados...</Text>
                </View>
            </SettingsLayout>
        )
    }

    if (erroCarregamento || !perfilEhValido(perfil)) {
        return (
            <SettingsLayout titulo="Configurações de Perfil" onVoltar={onVoltar}>
                <View style={estilos.estadoTela}>
                    <Text accessibilityRole="alert" style={estilos.erroEstado}>Não foi possível carregar os dados do perfil.</Text>

                    {typeof onRecarregar === 'function' ? (
                        <ButtonScreen texto="Tentar novamente" aoPressionar={onRecarregar} />
                    ) : null}
                </View>
            </SettingsLayout>
        )
    }

    return (
        <>
            <SettingsLayout titulo="Configurações de Perfil" onVoltar={onVoltar} rodape={rodape}>
                <View style={estilos.conteudo}>
                    {erroSalvar ? <Text accessibilityRole="alert" style={estilos.erro}>{erroSalvar}</Text> : null}
                    {mensagem ? <Text accessibilityLiveRegion="polite" style={estilos.sucesso}>{mensagem}</Text> : null}

                    <ProfileSettings
                        dados={dadosAtuais}
                        onEditarCampo={abrirEdicao}
                        onAlterarSenha={onAlterarSenha}
                        onSalvar={salvarAlteracoes}
                        podeSalvar={podeSalvar}
                        salvando={salvando}
                    />
                </View>
            </SettingsLayout>

            <EditFieldSheet
                visivel={campoTexto !== null}
                titulo={campoTexto === 'email' ? 'Editar E-mail' : 'Editar Nome'}
                tipo={campoTexto ?? 'nome'}
                valor={valorCampo}
                onAlterar={setValorCampo}
                onFechar={fecharEdicaoTexto}
                erro={erroCampo}
                salvando={salvando}
                botaoSalvar={<ButtonScreen texto="Salvar" aoPressionar={confirmarEdicaoTexto} />}
            />

            <GenderSelector
                visivel={generoVisivel}
                valorSelecionado={dadosAtuais.identidadeGenero}
                onSelecionar={selecionarGenero}
                onFechar={() => setGeneroVisivel(false)}
            />

            <DatePickerSheet
                visivel={dataVisivel}
                titulo="Data de Nascimento"
                valorSelecionado={dadosAtuais.dataNascimento}
                dataMinima="1900-01-01"
                dataMaxima={obterDataAtualIso()}
                onSelecionar={selecionarData}
                onFechar={() => setDataVisivel(false)}
            />
        </>
    )
}

export { ProfileSettingsScreen }