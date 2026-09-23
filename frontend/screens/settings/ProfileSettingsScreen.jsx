//Controla a tela completa de dados pessoais e suas edições temporárias.
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { LockKeyIcon } from 'phosphor-react-native/src/icons/LockKey'
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle'

import ButtonScreen from '../../components/common/Button/ButtonScreen'
import { EditFieldSheet } from '../../components/feedback/EditFieldSheet/EditFieldSheet'
import AlertModal from '../../components/feedback/Modal/AlertModal/AlertModal'
import SimpleModal from '../../components/feedback/Modal/SimpleModal'
import { GenderSelector } from '../../features/settings/profile/GenderSelector'
import { ProfileSettings } from '../../features/settings/profile/ProfileSettings'
import { SettingsLayout } from '../../layouts/SettingsLayout/SettingsLayout'
import { tema } from '../../theme'
import { isValidDate } from '../../utils/validation/isValidDate'
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

function formatarDataParaEdicao(dataIso) {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso ?? '')

    return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : ''
}

function converterDataParaIso(dataBrasileira) {
    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dataBrasileira ?? '')

    return partes ? `${partes[3]}-${partes[2]}-${partes[1]}` : null
}

function obterDataAtualIso() {
    const agora = new Date()
    const dataLocal = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)

    return dataLocal.toISOString().slice(0, 10)
}

function ProfileSettingsScreen({perfil, carregando = false, erroCarregamento = false, onRecarregar, onSalvar, onVoltar, onAlterarSenha, onExcluirConta, onSair}) {
    const [dadosOriginais, setDadosOriginais] = useState(() => copiarDadosPerfil(perfil))
    const [dadosAtuais, setDadosAtuais] = useState(() => copiarDadosPerfil(perfil))
    const [campoEditado, setCampoEditado] = useState(null)
    const [valorCampo, setValorCampo] = useState('')
    const [erroCampo, setErroCampo] = useState('')
    const [generoVisivel, setGeneroVisivel] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [sucessoVisivel, setSucessoVisivel] = useState(false)
    const [erroSalvarVisivel, setErroSalvarVisivel] = useState(false)
    const [saidaSemSalvarVisivel, setSaidaSemSalvarVisivel] = useState(false)

    useEffect(() => {
        if (!perfilEhValido(perfil)) {
            return
        }

        const novosDados = copiarDadosPerfil(perfil)

        setDadosOriginais(novosDados)
        setDadosAtuais(novosDados)
    }, [perfil?.nome, perfil?.email, perfil?.dataNascimento, perfil?.identidadeGenero])

    const alteracoes = obterAlteracoes(dadosOriginais, dadosAtuais)
    const possuiAlteracoes = Object.keys(alteracoes).length > 0
    const podeSalvar = possuiAlteracoes && typeof onSalvar === 'function' && !salvando

    function abrirEdicao(campo) {
        if (salvando) {
            return
        }

        setErroCampo('')

        if (campo === 'identidadeGenero') {
            setGeneroVisivel(true)
            return
        }

        if (campo === 'dataNascimento') {
            setCampoEditado('data')
            setValorCampo(formatarDataParaEdicao(dadosAtuais.dataNascimento))
            return
        }

        setCampoEditado(campo)
        setValorCampo(dadosAtuais[campo])
    }

    function fecharEdicao() {
        setCampoEditado(null)
        setValorCampo('')
        setErroCampo('')
    }

    function confirmarEdicao() {
        const valorNormalizado = valorCampo.trim()

        if (campoEditado === 'nome') {
            const nomeValido = valorNormalizado.length >= 3 && valorNormalizado.length <= 120 && regexNome.test(valorNormalizado)

            if (!nomeValido) {
                setErroCampo('Informe um nome válido usando apenas letras, espaços ou hífens.')
                return
            }

            setDadosAtuais(dadosAnteriores => ({...dadosAnteriores, nome: valorNormalizado}))
            fecharEdicao()
            return
        }

        if (campoEditado === 'email') {
            if (!isValidEmail(valorNormalizado)) {
                setErroCampo('Informe um e-mail válido.')
                return
            }

            setDadosAtuais(dadosAnteriores => ({...dadosAnteriores, email: valorNormalizado.toLowerCase()}))
            fecharEdicao()
            return
        }

        const dataIso = converterDataParaIso(valorNormalizado)
        const dataValida = isValidDate(valorNormalizado) && dataIso !== null && dataIso <= obterDataAtualIso()

        if (!dataValida) {
            setErroCampo('Informe uma data de nascimento válida.')
            return
        }

        setDadosAtuais(dadosAnteriores => ({...dadosAnteriores, dataNascimento: dataIso}))
        fecharEdicao()
    }

    function selecionarGenero(identidadeGenero) {
        setDadosAtuais(dadosAnteriores => ({...dadosAnteriores, identidadeGenero}))
        setGeneroVisivel(false)
    }

    async function salvarAlteracoes() {
        if (!podeSalvar) {
            return
        }

        const dadosEnviados = {...dadosAtuais}

        setSalvando(true)
        setErroSalvarVisivel(false)

        try {
            await onSalvar(Object.freeze({...alteracoes}))
            setDadosOriginais(dadosEnviados)
            setSucessoVisivel(true)
        } catch {
            setErroSalvarVisivel(true)
        } finally {
            setSalvando(false)
        }
    }

    function tentarVoltar() {
        if (possuiAlteracoes) {
            setSaidaSemSalvarVisivel(true)
            return
        }

        onVoltar?.()
    }

    function sairSemSalvar() {
        setDadosAtuais({...dadosOriginais})
        setSaidaSemSalvarVisivel(false)
        onVoltar?.()
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
                        <ButtonScreen texto="Tentar novamente" variante="verde" aoPressionar={onRecarregar} />
                    ) : null}
                </View>
            </SettingsLayout>
        )
    }

    return (
        <>
            <SettingsLayout titulo="Configurações de Perfil" onVoltar={tentarVoltar} rodape={rodape}>
                <ProfileSettings
                    dados={dadosAtuais}
                    onEditarCampo={abrirEdicao}
                    onAlterarSenha={onAlterarSenha}
                    onSalvar={salvarAlteracoes}
                    podeSalvar={podeSalvar}
                    salvando={salvando}
                />
            </SettingsLayout>

            <EditFieldSheet
                visivel={campoEditado !== null}
                titulo={
                    campoEditado === 'email'
                        ? 'Editar E-mail'
                        : campoEditado === 'data'
                            ? 'Editar Data de Nascimento'
                            : 'Editar Nome'
                }
                tipo={campoEditado ?? 'nome'}
                valor={valorCampo}
                onAlterar={setValorCampo}
                onFechar={fecharEdicao}
                erro={erroCampo}
                salvando={salvando}
                botaoSalvar={<ButtonScreen texto="Salvar" variante="verde" aoPressionar={confirmarEdicao} />}
            />

            <GenderSelector
                visivel={generoVisivel}
                valorSelecionado={dadosAtuais.identidadeGenero}
                onSelecionar={selecionarGenero}
                onFechar={() => setGeneroVisivel(false)}
            />

            <SimpleModal
                visivel={sucessoVisivel}
                aoFechar={() => setSucessoVisivel(false)}
                icone={LockKeyIcon}
                titulo="Dados atualizados com sucesso"
                acaoPrincipal={{
                    texto: 'OK',
                    aoPressionar: () => setSucessoVisivel(false)
                }}
            />

            <SimpleModal
                visivel={saidaSemSalvarVisivel}
                aoFechar={() => setSaidaSemSalvarVisivel(false)}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Dados não salvos"
                mensagem="Você tem atualizações não salvas. Deseja mesmo sair?"
                acaoPrincipal={{
                    texto: 'Sair sem salvar',
                    variante: 'branco',
                    aoPressionar: sairSemSalvar
                }}
                acaoSecundaria={{
                    texto: 'Continuar a editar',
                    variante: 'verde',
                    aoPressionar: () => setSaidaSemSalvarVisivel(false)
                }}
            />

            <AlertModal
                visivel={erroSalvarVisivel}
                aoFechar={() => setErroSalvarVisivel(false)}
                titulo="Não foi possível salvar"
                mensagem="Verifique sua conexão e tente novamente."
            />
        </>
    )
}

export { ProfileSettingsScreen }