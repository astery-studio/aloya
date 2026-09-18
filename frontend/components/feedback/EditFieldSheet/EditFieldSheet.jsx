//Mostra um campo de texto dentro de um BottomSheet.

import { Text, TextInput, View } from 'react-native'
import { BottomSheet } from './BottomSheet'
import { BottomSheetLayout } from '../../layouts/BottomSheetLayout'
import { estilos } from './EditFieldSheet.style'

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

    function tratarMudanca(texto) {
        const textoSemControle = texto.replace(/[\u0000-\u001F\u007F]/g, '')
        onAlterar(textoSemControle)
    }

    function fecharSePermitido() {
        if (!salvando) {
            onFechar()
        }
    }

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={fecharSePermitido}
            fecharAoTocarFora={!salvando}
        >
            <BottomSheetLayout
                titulo={titulo}
                cabecalho="alca"
            >
                <TextInput
                    value={valor}
                    onChangeText={tratarMudanca}
                    editable={!salvando}
                    maxLength={ehEmail ? 254 : 120}
                    keyboardType={
                        ehEmail
                            ? 'email-address'
                            : 'default'
                    }
                    autoCapitalize={
                        ehEmail
                            ? 'none'
                            : 'words'
                    }
                    autoCorrect={!ehEmail}
                    accessibilityLabel={
                        ehEmail
                            ? 'E-mail'
                            : 'Nome'
                    }
                    style={estilos.campo}
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