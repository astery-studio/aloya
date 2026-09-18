/**
 * Mostra um painel para editar nome, e-mail ou data de nascimento.
 * É usado nas configurações da conta.
 * Existe para reaproveitar a mesma estrutura nas três edições.
 */

import { useRef } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { estilos } from './EditFieldSheet.style'
import { BottomSheet } from '../Bottomsheet/BottomSheet'
import { BottomSheetLayout } from '../../../layouts/BottomSheet/BottomSheetLayout'

/**
 * Recebe o valor da data, inclusive quando vem da API em AAAA-MM-DD.
 * Prepara a data para aparecer como DD/MM/AAAA.
 * Retorna o texto mostrado no campo.
 */
function obterDataVisivel(valor) {
    const texto = String(valor ?? '')

    const dataDaApi =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto)

    if (dataDaApi) {
        return (
            `${dataDaApi[3]}/`
            + `${dataDaApi[2]}/`
            + dataDaApi[1]
        )
    }

    return texto
}

/**
 * Recebe o texto digitado e o valor anterior.
 * Insere as barras depois do dia e do mês e permite apagar.
 * Retorna a data parcial em DD/MM/AAAA.
 */
function formatarDataDigitada(texto, valorAnterior) {
    let numeros = texto.replace(/\D/g, '').slice(0, 8)

    const apagouBarraFinal =
        valorAnterior.endsWith('/')
        && texto === valorAnterior.slice(0, -1)

    if (apagouBarraFinal) {
        numeros = numeros.slice(0, -1)
    }

    if (numeros.length < 2) {
        return numeros
    }

    if (numeros.length < 4) {
        return (
            `${numeros.slice(0, 2)}/`
            + numeros.slice(2)
        )
    }

    return (
        `${numeros.slice(0, 2)}/`
        + `${numeros.slice(2, 4)}/`
        + numeros.slice(4)
    )
}

/**
 * Recebe o valor atual e as ações da tela.
 * Mostra o campo adequado a nome, e-mail ou data.
 * Retorna o painel de edição.
 */
function EditFieldSheet({
    visivel,
    titulo,
    tipo = 'nome',
    valor = '',
    onAlterar,
    onFechar,
    erro,
    salvando = false,
    botaoSalvar
}) {
    const campoRef = useRef(null)

    const ehEmail = tipo === 'email'
    const ehData = tipo === 'data'

    const valorVisivel = ehData
        ? obterDataVisivel(valor)
        : String(valor ?? '')

    /**
     * Não recebe dados.
     * Foca o campo quando a pessoa toca em qualquer parte da caixa.
     * Não retorna valor.
     */
    function focarCampo() {
        if (!salvando) {
            campoRef.current?.focus()
        }
    }

    /**
     * Recebe o texto digitado.
     * Aplica a máscara da data ou remove caracteres de controle.
     * Não retorna valor.
     */
    function tratarMudanca(texto) {
        if (ehData) {
            onAlterar(
                formatarDataDigitada(
                    texto,
                    valorVisivel
                )
            )
            return
        }

        const textoSemControle =
            texto.replace(/[\u0000-\u001F\u007F]/g, '')

        onAlterar(textoSemControle)
    }

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            bloquearFechamento={salvando}
        >
            <BottomSheetLayout
                titulo={titulo}
                onFechar={onFechar}
                bloquearFechamento={salvando}
            >
                <Pressable
                    onPress={focarCampo}
                    style={estilos.caixaCampo}
                    accessible={false}
                >
                    <TextInput
                        ref={campoRef}
                        value={valorVisivel}
                        onChangeText={tratarMudanca}
                        editable={!salvando}
                        multiline={false}
                        maxLength={
                            ehData
                                ? 10
                                : ehEmail
                                    ? 254
                                    : 120
                        }
                        keyboardType={
                            ehData
                                ? 'number-pad'
                                : ehEmail
                                    ? 'email-address'
                                    : 'default'
                        }
                        autoCapitalize={
                            ehEmail || ehData
                                ? 'none'
                                : 'words'
                        }
                        autoCorrect={
                            !ehEmail && !ehData
                        }
                        placeholder={
                            ehData
                                ? 'DD/MM/AAAA'
                                : undefined
                        }
                        underlineColorAndroid="transparent"
                        accessibilityLabel={
                            ehData
                                ? 'Data de nascimento'
                                : ehEmail
                                    ? 'E-mail'
                                    : 'Nome'
                        }
                        style={[
                            estilos.campo,
                            ehData && estilos.campoData
                        ]}
                    />
                </Pressable>

                {erro ? (
                    <Text
                        style={estilos.erro}
                        accessibilityLiveRegion="polite"
                    >
                        {erro}
                    </Text>
                ) : null}

                <View style={estilos.espacoBotaoSalvar}>
                    {botaoSalvar}
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    )
}

export { EditFieldSheet }