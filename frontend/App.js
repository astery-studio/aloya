/**
 * Mostra os componentes de BottomSheet para teste no Expo.
 * É usado temporariamente no lugar da tela principal do aplicativo.
 * Existe para conferir aparência e interações sem chamar a API.
 */

import { useEffect, useState } from 'react'

import {
    Alert,
    Button as BotaoNativo,
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

import { CheckIcon } from 'phosphor-react-native/src/icons/Check'

import { tema } from './theme'
import { BottomSheet } from './components/feedback/Bottomsheet/BottomSheet'
import { BottomSheetLayout } from './layouts/BottomSheet/BottomSheetLayout'
import { ButtonSelection } from './components/common/Button/ButtonSelection/ButtonSelection'
import { SelectionSheet } from './components/feedback/SelectionSheet/SelectionSheet'
import { EditFieldSheet } from './components/feedback/EditFieldSheet/EditFieldSheet'

const opcoesGenero = [
    { id: 'nao-informar', label: 'Prefiro não informar' },
    { id: 'mulher-cis', label: 'Mulher Cisgênero' },
    { id: 'homem-cis', label: 'Homem Cisgênero' },
    { id: 'mulher-trans', label: 'Mulher Trans' },
    { id: 'homem-trans', label: 'Homem Trans' },
    { id: 'nao-binario', label: 'Não-binário' },
    { id: 'outro', label: 'Outro' }
]

const opcoesTipo = [
    { id: 'pilula', label: 'Pílula' },
    { id: 'injetavel', label: 'Injetável' },
    { id: 'adesivo', label: 'Adesivo' },
    { id: 'anel', label: 'Anel Vaginal' },
    { id: 'diu', label: 'DIU Hormonal' }
]

const opcoesFrequencia = [
    { id: 'mensal', label: 'Mensal' },
    { id: 'dois-meses', label: 'A cada 2 meses' },
    { id: 'tres-meses', label: 'A cada 3 meses' }
]

/**
 * Recebe o índice de uma opção de teste.
 * Cria uma opção com identificação única.
 * Retorna uma opção para testar a rolagem.
 */
function criarOpcaoLonga(_, indice) {
    return {
        id: `opcao-${indice}`,
        label: `Opção de teste ${indice + 1}`
    }
}

const opcoesLongas =
    Array.from({ length: 30 }, criarOpcaoLonga)

const selecoesDisponiveis = {
    genero: {
        titulo: 'Identidade de Gênero',
        opcoes: opcoesGenero
    },

    tipo: {
        titulo: 'Tipo de Anticoncepcional',
        opcoes: opcoesTipo
    },

    frequencia: {
        titulo: 'Frequência de Uso',
        opcoes: opcoesFrequencia
    },

    vazia: {
        titulo: 'Lista vazia',
        opcoes: []
    },

    longa: {
        titulo: 'Lista longa para rolagem',
        opcoes: opcoesLongas
    }
}

/**
 * Recebe uma data em DD/MM/AAAA.
 * Rejeita datas impossíveis, bissextos incorretos e datas futuras.
 * Retorna AAAA-MM-DD quando a data é válida; senão, null.
 */
function converterDataValida(valor) {
    const partes =
        /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor)

    if (!partes) {
        return null
    }

    const dia = Number(partes[1])
    const mes = Number(partes[2])
    const ano = Number(partes[3])

    if (ano < 1 || mes < 1 || mes > 12) {
        return null
    }

    const bissexto =
        ano % 4 === 0
        && (
            ano % 100 !== 0
            || ano % 400 === 0
        )

    const diasPorMes = [
        31,
        bissexto ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ]

    if (
        dia < 1
        || dia > diasPorMes[mes - 1]
    ) {
        return null
    }

    const hoje = new Date()

    const futura =
        ano > hoje.getFullYear()
        || (
            ano === hoje.getFullYear()
            && mes > hoje.getMonth() + 1
        )
        || (
            ano === hoje.getFullYear()
            && mes === hoje.getMonth() + 1
            && dia > hoje.getDate()
        )

    if (futura) {
        return null
    }

    return `${partes[3]}-${partes[2]}-${partes[1]}`
}

/**
 * Recebe texto, código e ação de abertura.
 * Mostra um botão nativo somente nesta tela de testes.
 * Retorna o botão de um caso de teste.
 */
function BotaoTeste({
    titulo,
    codigo,
    onAbrir
}) {
    /**
     * Não recebe dados.
     * Abre o caso de teste indicado pelo código.
     * Não retorna valor.
     */
    function abrirEsteTeste() {
        onAbrir(codigo)
    }

    return (
        <View style={{ marginBottom: 8 }}>
            <BotaoNativo
                title={titulo}
                onPress={abrirEsteTeste}
            />
        </View>
    )
}

/**
 * Não recebe propriedades.
 * Mostra os estados dos componentes para conferência no Expo.
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

    const [painel, setPainel] = useState(null)

    const [nome, setNome] = useState('Julia')

    const [email, setEmail] =
        useState('juliadesign2025@gmail.com')

    const [dataNascimento, setDataNascimento] =
        useState('08/04/1999')

    const [erroCampo, setErroCampo] =
        useState('')

    const [simulandoSalvar, setSimulandoSalvar] =
        useState(false)

    const [selecoes, setSelecoes] = useState({
        genero: 'nao-informar',
        tipo: 'pilula',
        frequencia: 'mensal',
        longa: 'opcao-0'
    })

    /**
     * Recebe o código de um caso de teste.
     * Prepara erro e carregamento antes de abrir o painel.
     * Não retorna valor.
     */
    function abrirPainel(codigo) {
        setErroCampo(
            codigo === 'erroNome'
                ? 'Mensagem de erro para testar o layout.'
                : ''
        )

        setSimulandoSalvar(
            codigo === 'salvando'
        )

        setPainel(codigo)
    }

    /**
     * Não recebe dados.
     * Fecha o painel que está aberto.
     * Não retorna valor.
     */
    function fecharPainel() {
        setPainel(null)
    }

    /**
     * Recebe o identificador da opção tocada.
     * Atualiza a opção selecionada no painel atual.
     * Não retorna valor.
     */
    function selecionarOpcao(id) {
        /**
         * Recebe as seleções anteriores.
         * Troca somente a opção do painel aberto.
         * Retorna as seleções atualizadas.
         */
        function atualizarSelecoes(anteriores) {
            return {
                ...anteriores,
                [painel]: id
            }
        }

        setSelecoes(atualizarSelecoes)
    }

    /**
     * Recebe o texto digitado.
     * Atualiza o campo aberto e limpa o erro anterior.
     * Não retorna valor.
     */
    function alterarCampo(texto) {
        setErroCampo('')

        if (painel === 'data') {
            setDataNascimento(texto)
            return
        }

        if (painel === 'email') {
            setEmail(texto)
            return
        }

        setNome(texto)
    }

    /**
     * Não recebe dados.
     * Valida o campo somente para testar a interface.
     * Não chama a API nem retorna valor.
     */
    function testarSalvar() {
        if (painel === 'data') {
            const dataParaApi =
                converterDataValida(
                    dataNascimento
                )

            if (!dataParaApi) {
                setErroCampo(
                    'Informe uma data de nascimento válida.'
                )
                return
            }

            Alert.alert(
                'Teste',
                'Data validada localmente.'
            )
            return
        }

        if (painel === 'email') {
            const emailNormalizado =
                email.trim().toLowerCase()

            const emailValido =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    emailNormalizado
                )

            if (!emailValido) {
                setErroCampo(
                    'Informe um e-mail válido.'
                )
                return
            }

            Alert.alert(
                'Teste',
                'E-mail validado localmente.'
            )
            return
        }

        const nomeNormalizado =
            nome.trim().replace(/\s+/g, ' ')

        if (nomeNormalizado.length < 3) {
            setErroCampo(
                'O nome deve ter pelo menos 3 caracteres.'
            )
            return
        }

        Alert.alert(
            'Teste',
            'Nome validado localmente.'
        )
    }

    /**
     * Não recebe dados.
     * Confirma o toque em uma opção isolada.
     * Não retorna valor.
     */
    function testarToqueNaOpcao() {
        Alert.alert(
            'Teste',
            'A opção recebeu o toque.'
        )
    }

    /**
     * Não recebe dados.
     * Encerra o estado de salvamento simulado.
     * Não retorna valor.
     */
    function terminarSimulacao() {
        setSimulandoSalvar(false)
    }

    // useEffect executa um efeito depois da renderização.
    // Aqui, ele encerra o teste de salvamento após cinco segundos.
    useEffect(() => {
        if (painel !== 'salvando') {
            return undefined
        }

        const temporizador =
            setTimeout(terminarSimulacao, 5000)

        /**
         * Não recebe dados.
         * Cancela o temporizador se o painel mudar.
         * Não retorna valor.
         */
        function limparTemporizador() {
            clearTimeout(temporizador)
        }

        return limparTemporizador
    }, [painel])

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

    const configuracaoSelecao =
        selecoesDisponiveis[painel]

    const mostraPainelBase =
        painel === 'basePadrao'
        || painel === 'baseTituloLongo'

    const mostraEdicao = [
        'nome',
        'email',
        'data',
        'erroNome',
        'salvando',
        'semBotao'
    ].includes(painel)

    return (
        <View
            style={{
                flex: 1,
                backgroundColor:
                    tema.cores.neutras.fundoClaro
            }}
        >
            <ScrollView
                contentContainerStyle={{
                    padding: 24,
                    paddingBottom: 48
                }}
            >
                <Text>BottomSheet padrão</Text>

                <BotaoTeste
                    titulo="Cabeçalho padrão com X"
                    codigo="basePadrao"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Título longo: testar quebra"
                    codigo="baseTituloLongo"
                    onAbrir={abrirPainel}
                />

                <Text>ButtonSelection</Text>

                <ButtonSelection
                    label="Opção normal"
                    onPress={testarToqueNaOpcao}
                />

                <ButtonSelection
                    label="Opção selecionada"
                    selected
                    onPress={testarToqueNaOpcao}
                />

                <ButtonSelection
                    label="Com descrição"
                    descricao="Informação complementar."
                    onPress={testarToqueNaOpcao}
                />

                <ButtonSelection
                    label="Com ícone"
                    icone={CheckIcon}
                    onPress={testarToqueNaOpcao}
                />

                <ButtonSelection
                    label="Selecionada, ícone e descrição"
                    descricao="Todos os elementos juntos."
                    icone={CheckIcon}
                    selected
                    onPress={testarToqueNaOpcao}
                />

                <ButtonSelection
                    label="Desabilitada"
                    desabilitado
                    onPress={testarToqueNaOpcao}
                />

                <Text>SelectionSheet</Text>

                <BotaoTeste
                    titulo="Identidade de gênero"
                    codigo="genero"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Tipo de anticoncepcional"
                    codigo="tipo"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Frequência de uso"
                    codigo="frequencia"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Lista vazia"
                    codigo="vazia"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Lista longa: 30 opções"
                    codigo="longa"
                    onAbrir={abrirPainel}
                />

                <Text>EditFieldSheet</Text>

                <BotaoTeste
                    titulo="Editar nome"
                    codigo="nome"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Editar e-mail"
                    codigo="email"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Editar data de nascimento"
                    codigo="data"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Mostrar erro no campo"
                    codigo="erroNome"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Salvando por 5 segundos"
                    codigo="salvando"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Sem botão Salvar"
                    codigo="semBotao"
                    onAbrir={abrirPainel}
                />
            </ScrollView>

            <BottomSheet
                visivel={mostraPainelBase}
                onFechar={fecharPainel}
            >
                <BottomSheetLayout
                    titulo={
                        painel === 'baseTituloLongo'
                            ? 'Um título muito longo para testar a quebra de linha no cabeçalho do painel'
                            : 'Cabeçalho padrão'
                    }
                    onFechar={fecharPainel}
                >
                    <Text>
                        Toque fora do painel: ele deve
                        continuar aberto. Feche pelo X.
                    </Text>
                </BottomSheetLayout>
            </BottomSheet>

            <SelectionSheet
                visivel={Boolean(configuracaoSelecao)}
                titulo={
                    configuracaoSelecao?.titulo ?? ''
                }
                opcoes={
                    configuracaoSelecao?.opcoes ?? []
                }
                valorSelecionado={
                    selecoes[painel]
                }
                onSelecionar={selecionarOpcao}
                onFechar={fecharPainel}
            />

            <EditFieldSheet
                visivel={mostraEdicao}
                titulo={
                    painel === 'data'
                        ? 'Editar Data de Nascimento'
                        : painel === 'email'
                            ? 'Editar E-mail'
                            : 'Editar Nome'
                }
                tipo={
                    painel === 'data'
                        ? 'data'
                        : painel === 'email'
                            ? 'email'
                            : 'nome'
                }
                valor={
                    painel === 'data'
                        ? dataNascimento
                        : painel === 'email'
                            ? email
                            : nome
                }
                onAlterar={alterarCampo}
                onFechar={fecharPainel}
                erro={erroCampo}
                salvando={simulandoSalvar}
                botaoSalvar={
                    painel === 'semBotao'
                        ? null
                        : (
                            <BotaoNativo
                                title={
                                    simulandoSalvar
                                        ? 'Salvando...'
                                        : 'Salvar'
                                }
                                onPress={testarSalvar}
                                disabled={simulandoSalvar}
                            />
                        )
                }
            />
        </View>
    )
}