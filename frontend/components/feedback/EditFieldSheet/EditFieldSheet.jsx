//Mostra um painel para editar nome, e-mail ou data de nascimento. É usado nas configurações da conta
import { useRef } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { BottomSheetLayout } from '../../../layouts/BottomSheet/BottomSheetLayout'
import { formatDate } from '../../../utils/date/formatDate'
import { BottomSheet } from '../Bottomsheet/BottomSheet'
import { estilos } from './EditFieldSheet.style'

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

function EditFieldSheet({ visivel, titulo, tipo = 'nome', valor = '', onAlterar, onFechar, erro, salvando = false, botaoSalvar }) {
    const campoRef = useRef(null)
    const ehEmail = tipo === 'email'
    const ehData = tipo === 'data'

    const valorVisivel = ehData
        ? obterDataVisivel(valor)
        : String(valor ?? '')

    function focarCampo() {
        if (!salvando) {
            campoRef.current?.focus()
        }
    }

    function tratarMudanca(texto) {
        if (ehData) {
            onAlterar?.(formatDate(texto))
            return
        }

        const textoSemControle = texto.replace(/[\u0000-\u001F\u007F]/g, '')

        onAlterar?.(textoSemControle)
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
                    testID="area-campo-edicao"
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
                        maxLength={ehData ? 10 : ehEmail ? 254 : 120 }
                        keyboardType={ ehData ? 'number-pad' : ehEmail ? 'email-address' : 'default'
                        }
                        autoCapitalize={
                            ehEmail || ehData ? 'none' : 'words'
                        }
                        autoCorrect={
                            !ehEmail && !ehData
                        }
                        placeholder={
                            ehData ? 'DD/MM/AAAA' : undefined
                        }
                        underlineColorAndroid="transparent"
                        accessibilityLabel={ ehData ? 'Data de nascimento' : ehEmail ? 'E-mail' : 'Nome' }
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