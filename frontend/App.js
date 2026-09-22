/**
 * Mostra cenários de teste do DatePickerSheet no Expo.
 * É usado temporariamente como entrada do aplicativo.
 */

import {useState} from 'react'
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'

import {StatusBar} from 'expo-status-bar'

import {
    useFonts
} from '@expo-google-fonts/dm-sans/useFonts'

import {
    DMSans_400Regular
} from '@expo-google-fonts/dm-sans/400Regular'

import {
    DMSans_500Medium
} from '@expo-google-fonts/dm-sans/500Medium'

import {
    DMSans_600SemiBold
} from '@expo-google-fonts/dm-sans/600SemiBold'

import {
    DMSans_700Bold
} from '@expo-google-fonts/dm-sans/700Bold'

import {
    DatePickerSheet
} from './components/feedback/DatePickerSheet/DatePickerSheet'

import {
    fontFamilies,
    tema
} from './theme'

function obterDataDeHoje() {
    const hoje = new Date()

    return (
        `${hoje.getFullYear()}-`
        + `${String(
            hoje.getMonth() + 1
        ).padStart(2, '0')}-`
        + String(
            hoje.getDate()
        ).padStart(2, '0')
    )
}

function formatarData(data) {
    const partes =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(
            data ?? ''
        )

    if (!partes) {
        return 'Nenhuma data selecionada'
    }

    return (
        `${partes[3]}/`
        + `${partes[2]}/`
        + partes[1]
    )
}

const dataDeHoje =
    obterDataDeHoje()

const cenarios = [
    {
        id: 'completo',
        titulo: 'Calendário completo',
        descricao:
            'Teste a navegação entre meses e a lista de anos.',
        dataInicial: '2026-09-21',
        dataMinima: null,
        dataMaxima: null
    },
    {
        id: 'nascimento',
        titulo: 'Data de nascimento',
        descricao:
            'Permite selecionar datas entre 1900 e hoje.',
        dataInicial: '2000-01-15',
        dataMinima: '1900-01-01',
        dataMaxima: dataDeHoje
    },
    {
        id: 'intervalo',
        titulo: 'Intervalo limitado',
        descricao:
            'Somente os dias 10 a 20 de setembro de 2026 ficam habilitados.',
        dataInicial: '2026-09-15',
        dataMinima: '2026-09-10',
        dataMaxima: '2026-09-20'
    }
]

const datasIniciais =
    Object.fromEntries(
        cenarios.map(
            (cenario) => [
                cenario.id,
                cenario.dataInicial
            ]
        )
    )

function obterEstiloDoBotao({
    pressed
}) {
    return [
        estilos.botaoAbrir,
        pressed
        && estilos.botaoPressionado
    ]
}

export default function App() {
    const [
        fontesCarregadas,
        erroFontes
    ] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold
    })

    const [
        datas,
        setDatas
    ] = useState(
        datasIniciais
    )

    const [
        cenarioAtivo,
        setCenarioAtivo
    ] = useState(
        'completo'
    )

    const [
        calendarioVisivel,
        setCalendarioVisivel
    ] = useState(false)

    const configuracaoAtiva =
        cenarios.find(
            (cenario) =>
                cenario.id
                === cenarioAtivo
        ) ?? cenarios[0]

    function abrirCalendario(id) {
        setCenarioAtivo(id)
        setCalendarioVisivel(true)
    }

    function fecharCalendario() {
        setCalendarioVisivel(false)
    }

    async function selecionarData(data) {
        /**
         * O atraso é proposital.
         * Ele permite testar a mensagem de salvamento
         * e o bloqueio contra vários toques.
         */
        await new Promise(
            (resolver) => {
                setTimeout(
                    resolver,
                    350
                )
            }
        )

        setDatas(
            (datasAtuais) => ({
                ...datasAtuais,
                [cenarioAtivo]: data
            })
        )

        return true
    }

    if (erroFontes) {
        return (
            <View
                style={
                    estilos.estadoCentralizado
                }
            >
                <Text
                    style={estilos.erro}
                >
                    Não foi possível carregar as fontes.
                </Text>
            </View>
        )
    }

    if (!fontesCarregadas) {
        return (
            <View
                style={
                    estilos.estadoCentralizado
                }
            >
                <Text
                    style={
                        estilos.textoSecundario
                    }
                >
                    Carregando fontes...
                </Text>
            </View>
        )
    }

    return (
        <View style={estilos.tela}>
            <StatusBar style="dark" />

            <ScrollView
                style={estilos.rolagem}
                contentContainerStyle={
                    estilos.conteudo
                }
            >
                <Text style={estilos.titulo}>
                    Teste do calendário
                </Text>

                <Text
                    style={
                        estilos.introducao
                    }
                >
                    Abra cada cenário, navegue pelos meses e anos e escolha uma data. O atraso curto ao salvar é proposital para testar o bloqueio de toques.
                </Text>

                <View style={estilos.aviso}>
                    <Text
                        style={
                            estilos.avisoTitulo
                        }
                    >
                        O que conferir
                    </Text>

                    <Text
                        style={
                            estilos.avisoTexto
                        }
                    >
                        • animação sem travamentos
                        {'\n'}
                        • rolagem fluida na lista de anos
                        {'\n'}
                        • dias fora do limite desabilitados
                        {'\n'}
                        • apenas um salvamento por toque
                        {'\n'}
                        • fechamento pelo X e pelo botão voltar
                    </Text>
                </View>

                <View
                    style={
                        estilos.listaCenarios
                    }
                >
                    {cenarios.map(
                        (cenario) => (
                            <View
                                key={
                                    cenario.id
                                }
                                style={
                                    estilos.cartao
                                }
                            >
                                <Text
                                    style={
                                        estilos
                                            .tituloCartao
                                    }
                                >
                                    {
                                        cenario
                                            .titulo
                                    }
                                </Text>

                                <Text
                                    style={
                                        estilos
                                            .descricaoCartao
                                    }
                                >
                                    {
                                        cenario
                                            .descricao
                                    }
                                </Text>

                                <View
                                    style={
                                        estilos
                                            .dataSelecionada
                                    }
                                >
                                    <Text
                                        style={
                                            estilos
                                                .rotuloData
                                        }
                                    >
                                        Data selecionada
                                    </Text>

                                    <Text
                                        style={
                                            estilos
                                                .valorData
                                        }
                                    >
                                        {
                                            formatarData(
                                                datas[
                                                    cenario
                                                        .id
                                                ]
                                            )
                                        }
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={
                                        () =>
                                            abrirCalendario(
                                                cenario.id
                                            )
                                    }
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        `Abrir ${cenario.titulo}`
                                    }
                                    style={
                                        obterEstiloDoBotao
                                    }
                                >
                                    <Text
                                        style={
                                            estilos
                                                .textoBotao
                                        }
                                    >
                                        Abrir calendário
                                    </Text>
                                </Pressable>
                            </View>
                        )
                    )}
                </View>
            </ScrollView>

            <DatePickerSheet
                visivel={
                    calendarioVisivel
                }
                titulo={
                    configuracaoAtiva
                        .titulo
                }
                valorSelecionado={
                    datas[
                        cenarioAtivo
                    ]
                }
                dataMinima={
                    configuracaoAtiva
                        .dataMinima
                }
                dataMaxima={
                    configuracaoAtiva
                        .dataMaxima
                }
                onSelecionar={
                    selecionarData
                }
                onFechar={
                    fecharCalendario
                }
            />
        </View>
    )
}

const estilos =
    StyleSheet.create({
        tela: {
            flex: 1,
            backgroundColor:
                tema.cores.neutras
                    .fundoClaro
        },

        rolagem: {
            flex: 1
        },

        conteudo: {
            paddingTop: 64,
            paddingHorizontal:
                tema
                    .espacamentosLayout
                    .margemHorizontalTela,
            paddingBottom:
                tema.espacamentos
                    .maximo
        },

        titulo: {
            ...tema.typography.h1,
            color:
                tema.cores.neutras
                    .textoPrincipalClaro
        },

        introducao: {
            ...tema.typography
                .bodyDefault,
            marginTop:
                tema.espacamentos
                    .pequeno,
            color:
                tema.cores.neutras
                    .textoSecundarioClaro
        },

        aviso: {
            marginTop:
                tema.espacamentos
                    .grande,
            padding:
                tema.espacamentos
                    .medio,
            borderWidth: 1,
            borderColor:
                tema.cores.neutras
                    .bordaClara,
            borderRadius:
                tema.radius
                    .buttonAndInput,
            backgroundColor:
                tema.cores.icones
                    .configuracoes
                    .verde
                    .caixa
        },

        avisoTitulo: {
            fontFamily:
                fontFamilies.bold,
            fontSize: 16,
            lineHeight: 24,
            color:
                tema.cores.marca
                    .secundaria
        },

        avisoTexto: {
            ...tema.typography.caption,
            marginTop:
                tema.espacamentos
                    .minimo,
            color:
                tema.cores.neutras
                    .textoSecundarioClaro
        },

        listaCenarios: {
            gap:
                tema.espacamentos
                    .medio,
            marginTop:
                tema.espacamentos
                    .grande
        },

        cartao: {
            padding:
                tema.espacamentos
                    .medio,
            borderWidth: 1,
            borderColor:
                tema.cores.neutras
                    .bordaClara,
            borderRadius:
                tema.radius
                    .onboardingCalendar,
            backgroundColor:
                tema.cores.neutras
                    .superficieClara
        },

        tituloCartao: {
            ...tema.typography
                .bodyLarge,
            color:
                tema.cores.neutras
                    .textoPrincipalClaro
        },

        descricaoCartao: {
            ...tema.typography
                .caption,
            marginTop:
                tema.espacamentos
                    .minimo,
            color:
                tema.cores.neutras
                    .textoSecundarioClaro
        },

        dataSelecionada: {
            marginTop:
                tema.espacamentos
                    .medio,
            padding:
                tema.espacamentos
                    .pequeno,
            borderRadius:
                tema.radius
                    .buttonAndInput,
            backgroundColor:
                tema.cores.neutras
                    .fundoClaro
        },

        rotuloData: {
            ...tema.typography.micro,
            color:
                tema.cores.neutras
                    .textoSecundarioClaro,
            textTransform:
                'uppercase'
        },

        valorData: {
            ...tema.typography
                .bodyDefault,
            marginTop:
                tema.espacamentos
                    .minimo,
            color:
                tema.cores.neutras
                    .textoPrincipalClaro
        },

        botaoAbrir: {
            minHeight: 48,
            alignItems:
                'center',
            justifyContent:
                'center',
            marginTop:
                tema.espacamentos
                    .medio,
            paddingHorizontal:
                tema.espacamentos
                    .medio,
            borderRadius:
                tema.radius
                    .buttonAndInput,
            backgroundColor:
                tema.cores.marca
                    .secundaria
        },

        botaoPressionado: {
            opacity: 0.8
        },

        textoBotao: {
            fontFamily:
                fontFamilies.bold,
            fontSize: 16,
            lineHeight: 24,
            color:
                tema.cores.neutras
                    .superficieClara
        },

        estadoCentralizado: {
            flex: 1,
            alignItems:
                'center',
            justifyContent:
                'center',
            padding:
                tema.espacamentos
                    .grande,
            backgroundColor:
                tema.cores.neutras
                    .fundoClaro
        },

        textoSecundario: {
            ...tema.typography
                .bodyDefault,
            color:
                tema.cores.neutras
                    .textoSecundarioClaro
        },

        erro: {
            ...tema.typography
                .bodyDefault,
            color:
                tema.cores.feedback
                    .erro,
            textAlign: 'center'
        }
    })