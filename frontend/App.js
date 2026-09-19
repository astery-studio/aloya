/**
 * Mostra somente os testes do calendário no Expo.
 * É usado temporariamente como entrada do aplicativo.
 * Existe para conferir o DatePickerSheet sem API e sem outras telas.
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

import { DatePickerSheet } from './components/feedback/DatePickerSheet/DatePickerSheet'
import { tema } from './theme'

const titulos = {
    selecionada: 'Edição Data de Validade',
    vazia: 'Selecionar Data',
    bissexto: 'Edição Data de Validade',
    nascimento: 'Editar Data de Nascimento',
    limites: 'Selecionar Data',
    tituloLongo:
        'Título grande para testar a quebra de linha do calendário'
}

/**
 * Não recebe dados.
 * Monta a data de hoje no horário local do celular.
 * Retorna a data no formato AAAA-MM-DD.
 */
function obterHoje() {
    const hoje = new Date()

    const ano = hoje.getFullYear()
    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, '0')
    const dia = String(
        hoje.getDate()
    ).padStart(2, '0')

    return `${ano}-${mes}-${dia}`
}

/**
 * Não recebe propriedades.
 * Mostra os casos de teste e abre o calendário escolhido.
 * Retorna a tela temporária do Expo.
 */
export default function App() {
    const [fontesCarregadas, erroFontes] =
        useFonts({
            DMSans_400Regular,
            DMSans_500Medium,
            DMSans_600SemiBold,
            DMSans_700Bold
        })

    const [cenarioAberto, setCenarioAberto] =
        useState(null)

    const [datasSelecionadas, setDatasSelecionadas] =
        useState({
            selecionada: '1999-04-08',
            vazia: null,
            bissexto: '2024-02-29',
            nascimento: '1999-04-08',
            limites: '2024-02-15',
            tituloLongo: '1999-04-08'
        })

    /**
     * Recebe o nome de um cenário.
     * Abre o calendário correspondente.
     * Não retorna valor.
     */
    function abrirCalendario(cenario) {
        setCenarioAberto(cenario)
    }

    /**
     * Não recebe dados.
     * Fecha o calendário pelo X.
     * Não retorna valor.
     */
    function fecharCalendario() {
        setCenarioAberto(null)
    }

    /**
     * Recebe a data tocada no formato AAAA-MM-DD.
     * Atualiza somente o cenário que está aberto.
     * Não retorna valor.
     */
    function selecionarData(data) {
        /**
         * Recebe as datas anteriores.
         * Substitui somente a data do teste atual.
         * Retorna as datas atualizadas.
         */
        function atualizarDatas(anteriores) {
            return {
                ...anteriores,
                [cenarioAberto]: data
            }
        }

        setDatasSelecionadas(atualizarDatas)
    }

    /**
     * Recebe o nome e o texto de um cenário.
     * Mostra o botão que abre o teste e a data escolhida.
     * Retorna os elementos desse teste.
     */
    function mostrarTeste(cenario, descricao) {
        /**
         * Não recebe dados.
         * Abre este cenário ao tocar no botão.
         * Não retorna valor.
         */
        function abrirEsteTeste() {
            abrirCalendario(cenario)
        }

        return (
            <View
                key={cenario}
                style={{ marginBottom: 20 }}
            >
                <Button
                    title={descricao}
                    onPress={abrirEsteTeste}
                />

                <Text
                    style={{
                        marginTop: 6,
                        color:
                            tema.cores.neutras
                                .textoSecundarioClaro
                    }}
                >
                    Selecionada: {
                        datasSelecionadas[cenario]
                        ?? 'nenhuma'
                    }
                </Text>
            </View>
        )
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
                <Text>Carregando fontes...</Text>
            </View>
        )
    }

    const ehNascimento =
        cenarioAberto === 'nascimento'

    const temLimites =
        cenarioAberto === 'limites'

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
                    paddingTop: 64,
                    paddingBottom: 48
                }}
            >
                <Text
                    style={{
                        color:
                            tema.cores.neutras
                                .textoPrincipalClaro,
                        fontFamily:
                            'DMSans_700Bold',
                        fontSize: 24,
                        marginBottom: 8
                    }}
                >
                    Teste do calendário
                </Text>

                <Text
                    style={{
                        color:
                            tema.cores.neutras
                                .textoSecundarioClaro,
                        marginBottom: 24
                    }}
                >
                    Escolha um caso abaixo. Toque em
                    um dia para selecioná-lo e no X
                    para fechar.
                </Text>

                {mostrarTeste(
                    'selecionada',
                    'Data já selecionada: 08/04/1999'
                )}

                {mostrarTeste(
                    'vazia',
                    'Sem data selecionada'
                )}

                {mostrarTeste(
                    'bissexto',
                    'Ano bissexto: fevereiro de 2024'
                )}

                {mostrarTeste(
                    'nascimento',
                    'Nascimento: bloquear futuro'
                )}

                {mostrarTeste(
                    'limites',
                    'Permitir somente 10 a 20/02/2024'
                )}

                {mostrarTeste(
                    'tituloLongo',
                    'Título grande: testar quebra'
                )}
            </ScrollView>

            <DatePickerSheet
                visivel={cenarioAberto !== null}
                titulo={
                    titulos[cenarioAberto]
                    ?? 'Selecionar data'
                }
                valorSelecionado={
                    datasSelecionadas[
                        cenarioAberto
                    ] ?? null
                }
                dataMinima={
                    temLimites
                        ? '2024-02-10'
                        : null
                }
                dataMaxima={
                    ehNascimento
                        ? obterHoje()
                        : temLimites
                            ? '2024-02-20'
                            : null
                }
                onSelecionar={selecionarData}
                onFechar={fecharCalendario}
            />
        </View>
    )
}