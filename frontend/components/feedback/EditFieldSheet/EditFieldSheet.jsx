//Mostra um campo para editar nome, e-mail ou data de nascimento. É usado nos painéis de edição da conta.

import { Text, TextInput, View } from 'react-native'
import { estilos } from './EditFieldSheet.style'
import { BottomSheet } from '../Bottomsheet/BottomSheet'
import { BottomSheetLayout } from '../../../layouts/BottomSheet/BottomSheetLayout'

function formatarDataDigitada(texto) {
    const numeros =
        texto.replace(/\D/g, '').slice(0, 8)

    if (numeros.length <= 2) {
        return numeros
    }

    if (numeros.length <= 4) {
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
    const ehEmail = tipo === 'email'
    const ehData = tipo === 'data'

    function tratarMudanca(texto) {
        if (ehData) {
            onAlterar(formatarDataDigitada(texto))
            return
        }

        const textoSemControle = texto.replace(/[\u0000-\u001F\u007F]/g, '')
        onAlterar(textoSemControle)
    }

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            fecharAoTocarFora
            bloquearFechamento={salvando}
        >
            <BottomSheetLayout
                titulo={titulo}
                cabecalho="alca"
            >
                <TextInput
                    value={valor}
                    onChangeText={tratarMudanca}
                    editable={!salvando}
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