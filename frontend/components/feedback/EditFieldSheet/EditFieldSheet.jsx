//Mostra um painel para editar nome, e-mail ou data de nascimento. É usado nas configurações da conta.

import { useRef } from 'react'
import { Text, TextInput, View } from 'react-native'

import { estilos } from './EditFieldSheet.style'
import { BottomSheet } from '../Bottomsheet/BottomSheet'
import { BottomSheetLayout } from '../../../layouts/BottomSheet/BottomSheetLayout'

function separarData(valor) {
    const texto = String(valor ?? '')

    const dataDaApi =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto)

    if (dataDaApi) {
        return {
            dia: dataDaApi[3],
            mes: dataDaApi[2],
            ano: dataDaApi[1]
        }
    }

    const partes = texto.split('/')

    return {
        dia: partes[0] ?? '',
        mes: partes[1] ?? '',
        ano: partes[2] ?? ''
    }
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
    const campoMes = useRef(null)
    const campoAno = useRef(null)

    const ehEmail = tipo === 'email'
    const ehData = tipo === 'data'

    const data = separarData(valor)

    function alterarTexto(texto) {
        const textoSemControle = texto.replace(/[\u0000-\u001F\u007F]/g, '')
        onAlterar(textoSemControle)
    }

    function informarData(dia, mes, ano) {
        onAlterar(`${dia}/${mes}/${ano}`)
    }

    function alterarDia(texto) {
        const dia = texto.replace(/\D/g, '').slice(0, 2)

        informarData(dia, data.mes, data.ano)

        if (dia.length === 2) {
            campoMes.current?.focus()
        }
    }

    function alterarMes(texto) {
        const mes = texto.replace(/\D/g, '').slice(0, 2)

        informarData(data.dia, mes, data.ano)

        if (mes.length === 2) {
            campoAno.current?.focus()
        }
    }

    function alterarAno(texto) {
        const ano = texto.replace(/\D/g, '').slice(0, 4)

        informarData(data.dia, data.mes, ano)
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
                {ehData ? (
                    <View style={estilos.caixaData}>
                        <TextInput
                            value={data.dia}
                            onChangeText={alterarDia}
                            editable={!salvando}
                            keyboardType="number-pad"
                            maxLength={2}
                            placeholder="DD"
                            textAlign="center"
                            style={[
                                estilos.parteData,
                                estilos.diaMes
                            ]}
                            accessibilityLabel="Dia de nascimento"
                        />

                        <Text style={estilos.barraData}>
                            /
                        </Text>

                        <TextInput
                            ref={campoMes}
                            value={data.mes}
                            onChangeText={alterarMes}
                            editable={!salvando}
                            keyboardType="number-pad"
                            maxLength={2}
                            placeholder="MM"
                            textAlign="center"
                            style={[
                                estilos.parteData,
                                estilos.diaMes
                            ]}
                            accessibilityLabel="Mês de nascimento"
                        />

                        <Text style={estilos.barraData}>
                            /
                        </Text>

                        <TextInput
                            ref={campoAno}
                            value={data.ano}
                            onChangeText={alterarAno}
                            editable={!salvando}
                            keyboardType="number-pad"
                            maxLength={4}
                            placeholder="AAAA"
                            textAlign="center"
                            style={[
                                estilos.parteData,
                                estilos.ano
                            ]}
                            accessibilityLabel="Ano de nascimento"
                        />
                    </View>
                ) : (
                    <TextInput
                        value={String(valor ?? '')}
                        onChangeText={alterarTexto}
                        editable={!salvando}
                        multiline={false}
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
                )}

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