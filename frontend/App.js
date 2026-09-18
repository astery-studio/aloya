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

const [dataNascimento, setDataNascimento] = useState('08/04/1999')

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
 * Recebe um índice da lista de teste.
 * Cria uma opção com id e texto únicos.
 * Retorna a opção para testar rolagem.
 */
function criarOpcaoLonga(_, indice) {
    return {
        id: `opcao-${indice}`,
        label: `Opção de teste ${indice + 1}`
    }
}

const opcoesLongas =
    Array.from({ length: 30 }, criarOpcaoLonga)

/**
 * Recebe uma data em DD/MM/AAAA.
 * Verifica dia, mês, ano, ano bissexto e data futura.
 * Retorna YYYY-MM-DD se for válida; caso contrário, retorna null.
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

    const anoBissexto =
        ano % 4 === 0
        && (
            ano % 100 !== 0
            || ano % 400 === 0
        )

    const diasPorMes = [
        31,
        anoBissexto ? 29 : 28,
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

    const dataFutura =
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

    if (dataFutura) {
        return null
    }

    return `${partes[3]}-${partes[2]}-${partes[1]}`
}

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
 * Recebe o texto, o código do teste e a função de abertura.
 * Mostra um botão nativo somente nesta tela temporária.
 * Retorna o controle que abre um caso de teste.
 */
function BotaoTeste({ titulo, codigo, onAbrir }) {
    /**
     * Não recebe argumentos.
     * Abre o caso de teste informado ao botão.
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
 * Mostra todos os casos de teste dos painéis.
 * Retorna a tela temporária do Expo.
 */
export default function App() {
    const [fontesCarregadas, erroFontes] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold
    })

    const [painel, setPainel] = useState(null)
    const [nome, setNome] = useState('Julia')
    const [email, setEmail] =
        useState('juliadesign2025@gmail.com')
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
     * Recebe o código de um teste.
     * Abre apenas o painel escolhido e prepara seu estado.
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
     * Fecha o painel atualmente aberto.
     * Não retorna nenhum valor.
     */
    function fecharPainel() {
        setPainel(null)
    }

    /**
     * Recebe o id da opção tocada.
     * Atualiza a seleção sem fechar o painel, para permitir
     * observar a mudança de cor.
     * Não retorna nenhum valor.
     */
    function selecionarOpcao(id) {
        /**
         * Recebe as seleções anteriores.
         * Troca apenas a seleção do painel aberto.
         * Retorna o novo conjunto de seleções.
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
     * Recebe o texto do campo aberto.
     * Atualiza nome ou e-mail somente nesta tela de teste.
     * Não retorna nenhum valor.
     */
    function alterarCampo(texto) {
        setErroCampo('')

        if (painel === 'email') {
            setEmail(texto)
            return
        }

        setNome(texto)
    }

    /**
     * Não recebe argumentos.
     * Faz uma validação local para testar mensagens de erro.
     * Não envia nem salva dados reais.
     */
    function testarSalvar() {
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
     * Mostra que uma opção isolada recebeu o toque.
     * Não retorna nenhum valor.
     */
    function testarToqueNaOpcao() {
        Alert.alert(
            'Teste',
            'A opção recebeu o toque.'
        )
    }

    /**
     * Quando o teste "salvando" abre, espera cinco segundos.
     * Depois libera o fechamento do painel para que o teste
     * não fique preso na tela.
     */
    useEffect(() => {
        if (painel !== 'salvando') {
            return undefined
        }

        const temporizador = setTimeout(
            terminarSimulacao,
            5000
        )

        /**
         * Não recebe argumentos.
         * Cancela o tempo pendente se o teste mudar.
         * Não retorna nenhum valor.
         */
        function limparTemporizador() {
            clearTimeout(temporizador)
        }

        return limparTemporizador
    }, [painel])

    /**
     * Não recebe argumentos.
     * Termina o carregamento simulado após cinco segundos.
     * Não retorna nenhum valor.
     */
    function terminarSimulacao() {
        setSimulandoSalvar(false)
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

    const configuracaoSelecao =
        selecoesDisponiveis[painel]

    const mostraPainelBase = [
        'baseFecha',
        'baseBloqueado',
        'layoutAlca',
        'layoutFechar'
    ].includes(painel)

    const mostraEdicao = [
        'nome',
        'email',
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
                <Text>TESTE: BottomSheet</Text>

                <BotaoTeste
                    titulo="Abre e fecha pelo fundo"
                    codigo="baseFecha"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Fundo NÃO fecha"
                    codigo="baseBloqueado"
                    onAbrir={abrirPainel}
                />

                <Text>TESTE: BottomSheetLayout</Text>

                <BotaoTeste
                    titulo="Cabeçalho com alça"
                    codigo="layoutAlca"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Cabeçalho com X"
                    codigo="layoutFechar"
                    onAbrir={abrirPainel}
                />

                <Text>TESTE: ButtonSelection isolado</Text>

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
                    descricao="Texto complementar da opção."
                    onPress={testarToqueNaOpcao}
                />

                <ButtonSelection
                    label="Com ícone"
                    icone={CheckIcon}
                    onPress={testarToqueNaOpcao}
                />

                <ButtonSelection
                    label="Opção desabilitada"
                    desabilitado
                    onPress={testarToqueNaOpcao}
                />

                <Text>TESTE: SelectionSheet</Text>

                <BotaoTeste
                    titulo="Gênero: alça e 7 opções"
                    codigo="genero"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Tipo: X e 5 opções"
                    codigo="tipo"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Frequência: X e 3 opções"
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

                <Text>TESTE: EditFieldSheet</Text>

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
                    titulo="Mostrar erro"
                    codigo="erroNome"
                    onAbrir={abrirPainel}
                />

                <BotaoTeste
                    titulo="Carregando por 5 segundos"
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
                fecharAoTocarFora={
                    painel !== 'baseBloqueado'
                }
            >
                <BottomSheetLayout
                    titulo={
                        painel === 'layoutFechar'
                            ? 'Cabeçalho com X'
                            : 'Cabeçalho com alça'
                    }
                    cabecalho={
                        painel === 'layoutFechar'
                            ? 'fechar'
                            : 'alca'
                    }
                    onFechar={fecharPainel}
                >
                    <Text>
                        Conteúdo genérico do painel.
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
                    painel === 'email'
                        ? 'Editar E-mail'
                        : 'Editar Nome'
                }
                tipo={
                    painel === 'email'
                        ? 'email'
                        : 'nome'
                }
                valor={
                    painel === 'email'
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