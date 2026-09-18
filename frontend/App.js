/**
 * Mostra as variantes dos componentes de painel no Expo.
 * É usado temporariamente durante os testes visuais.
 * Existe para conferir estados e interações sem chamar a API.
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
 * Cria uma opção com chave única.
 * Retorna uma opção para testar rolagem.
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
        cabecalho: 'alca',
        opcoes: opcoesGenero
    },

    tipo: {
        titulo: 'Tipo de Anticoncepcional',
        cabecalho: 'fechar',
        opcoes: opcoesTipo
    },

    frequencia: {
        titulo: 'Frequência de Uso',
        cabecalho: 'fechar',
        opcoes: opcoesFrequencia
    },

    vazia: {
        titulo: 'Lista vazia',
        cabecalho: 'fechar',
        opcoes: []
    },

    longa: {
        titulo: 'Lista longa para rolagem',
        cabecalho: 'fechar',
        opcoes: opcoesLongas
    }
}

/**
 * Recebe uma data em DD/MM/AAAA.
 * Rejeita dias impossíveis, ano bissexto incorreto e data futura.
 * Retorna YYYY-MM-DD quando a data é válida; senão, null.
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
 * Mostra um botão nativo apenas nesta tela temporária.
 * Retorna o controle de um caso de teste.
 */
function BotaoTeste({
    titulo,
    codigo,
    onAbrir
}) {
    /**
     * Não recebe argumentos.
     * Abre o caso indicado pelo código.
     * Não retorna nenhum valor.
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
 * Mostra os casos de teste dos cinco componentes.
 * Retorna uma tela temporária para o Expo.
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
    const [erroCampo, setErroCampo] = useState('')
    const [simulandoSalvar, setSimulandoSalvar] =
        useState(false)

    const [selecoes, setSelecoes] = useState({
        genero: 'mulher-cis',
        tipo: 'pilula',
        frequencia: 'mensal',
        longa: 'opcao-0'
    })

    /**
     * Recebe o código do teste.
     * Prepara o estado e abre somente aquele painel.
     * Não retorna nenhum valor.
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
     * Não recebe argumentos.
     * Fecha o painel aberto.
     * Não retorna nenhum valor.
     */
    function fecharPainel() {
        setPainel(null)
    }

    /**
     * Recebe o id tocado.
     * Atualiza a seleção sem fechar, para mostrar o destaque.
     * Não retorna nenhum valor.
     */
    function selecionarOpcao(id) {
        /**
         * Recebe as seleções anteriores.
         * Troca somente a seleção do painel atual.
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
     * Não retorna nenhum valor.
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
     * Não recebe argumentos.
     * Valida o campo atual somente para testar a interface.
     * Não envia dados nem retorna um valor.
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
     * Não recebe argumentos.
     * Confirma que uma opção isolada recebeu o toque.
     * Não retorna nenhum valor.
     */
    function testarToqueNaOpcao() {
        Alert.alert(
            'Teste',
            'A opção recebeu o toque.'
        )
    }

    /**
     * Não recebe argumentos.
     * Termina o salvamento simulado.
     * Não retorna nenhum valor.
     */
    function terminarSimulacao() {
        setSimulandoSalvar(false)
    }

    // useEffect agenda o fim do teste de carregamento após 5 segundos.
    useEffect(() => {
        if (painel !== 'salvando') {
            return undefined
        }

        const temporizador =
            setTimeout(terminarSimulacao, 5000)

        /**
         * Não recebe argumentos.
         * Cancela o tempo pendente se o painel mudar.
         * Não retorna nenhum valor.
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
        painel === 'baseAlca'
        || painel === 'baseX'

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
                <Text>BottomSheet e layout</Text>

                <BotaoTeste
                    titulo="Sem X: tocar fora fecha"
                    codigo="baseAlca"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Com X: tocar fora NÃO fecha"
                    codigo="baseX"
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
                    titulo="Gênero: sem X"
                    codigo="genero"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Tipo: com X"
                    codigo="tipo"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Frequência: com X"
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
                    titulo="Mostrar erro"
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
                        painel === 'baseX'
                            ? 'Cabeçalho com X'
                            : 'Cabeçalho com alça'
                    }
                    cabecalho={
                        painel === 'baseX'
                            ? 'fechar'
                            : 'alca'
                    }
                    onFechar={fecharPainel}
                >
                    <Text>
                        Teste o toque fora do painel.
                    </Text>

                    <BotaoNativo
                        title="Fechar por dentro"
                        onPress={fecharPainel}
                    />
                </BottomSheetLayout>
            </BottomSheet>

            <SelectionSheet
                visivel={Boolean(configuracaoSelecao)}
                titulo={
                    configuracaoSelecao?.titulo ?? ''
                }
                cabecalho={
                    configuracaoSelecao?.cabecalho
                    ?? 'fechar'
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