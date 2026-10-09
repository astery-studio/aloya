//Apresenta a legenda real e prevista do calendário em um bottom sheet.
import {Pressable, ScrollView, Text, View} from 'react-native'
import {DropIcon} from 'phosphor-react-native/src/icons/Drop'
import {PlantIcon} from 'phosphor-react-native/src/icons/Plant'
import {SunIcon} from 'phosphor-react-native/src/icons/Sun'
import {WavesIcon} from 'phosphor-react-native/src/icons/Waves'
import {XIcon} from 'phosphor-react-native/src/icons/X'
import {BottomSheet} from '../../../../shared/components/feedback/BottomSheet/BottomSheet'
import {estilos, cores, fundosPrevistos, fundosReais} from './CycleLegendSheet.styles'

const iconesPorTipo = Object.freeze({
    menstruacao: DropIcon,
    folicular: PlantIcon,
    ovulacao: SunIcon,
    lutea: WavesIcon
})

const nomesPorTipo = Object.freeze({
    menstruacao: 'menstruação',
    folicular: 'fase folicular',
    ovulacao: 'ovulação',
    lutea: 'fase lútea',
    janelaFertil: 'janela fértil'
})

function obterCorJanela(prevista) {
    return prevista ? cores.janelaFertilPrevista : cores.janelaFertil
}

function MarcadorLegenda({item}) {
    const prevista = item.prevista === true
    const janelaFertil = item.tipo === 'janelaFertil'
    const Icone = iconesPorTipo[item.tipo]

    if (janelaFertil) {
        const cor = obterCorJanela(prevista)

        return (
            <View
                testID={`marcador-legenda-${item.tipo}-${prevista ? 'prevista' : 'real'}`}
                style={[
                    estilos.marcador,
                    estilos.marcadorJanela,
                    {borderColor: cor}
                ]}
            >
                <Text style={estilos.diaJanela}>15</Text>
            </View>
        )
    }

    const fundos = prevista ? fundosPrevistos : fundosReais
    const fundo = fundos[item.tipo]

    return (
        <View
            testID={`marcador-legenda-${item.tipo}-${prevista ? 'prevista' : 'real'}`}
            style={[
                estilos.marcador,
                fundo ? {backgroundColor: fundo} : null
            ]}
        >
            {Icone ? (
                <View style={estilos.icone}>
                    <Icone
                        color={cores.fundo}
                        size={12}
                        weight={item.tipo === 'menstruacao' ? 'fill' : 'regular'}
                    />
                </View>
            ) : null}

            <Text style={estilos.diaMarcado}>15</Text>
        </View>
    )
}

function CycleLegendSheet({visivel, aoFechar, itens}) {
    const itensValidos = Array.isArray(itens)
        ? itens.filter(item => (
            item
            && typeof item.id === 'string'
            && typeof item.tipo === 'string'
            && typeof item.titulo === 'string'
            && typeof item.descricao === 'string'
        ))
        : []

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={aoFechar}
        >
            <View style={estilos.painel}>
                <View
                    accessible={false}
                    importantForAccessibility="no"
                    style={estilos.puxador}
                />

                <View style={estilos.cabecalho}>
                    <Text
                        accessibilityRole="header"
                        style={estilos.titulo}
                    >
                        Legenda
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Fechar legenda"
                        onPress={aoFechar}
                        style={estilos.botaoFechar}
                    >
                        <XIcon
                            size={24}
                            color={cores.descricao}
                            weight="regular"
                        />
                    </Pressable>
                </View>

                <ScrollView
                    style={estilos.lista}
                    contentContainerStyle={estilos.listaConteudo}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {itensValidos.map(item => {
                        const prevista = item.prevista === true
                        const nomeTipo = nomesPorTipo[item.tipo] || item.tipo

                        return (
                            <View
                                key={item.id}
                                testID={`item-legenda-${item.id}`}
                                accessible
                                accessibilityRole="text"
                                accessibilityLabel={`${item.titulo}. ${item.descricao}`}
                                style={estilos.item}
                            >
                                <MarcadorLegenda item={item} />

                                <View style={estilos.textos}>
                                    <Text style={estilos.nome}>
                                        {item.titulo}
                                    </Text>

                                    <Text style={estilos.descricao}>
                                        {item.descricao}
                                    </Text>
                                </View>
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
        </BottomSheet>
    )
}

export {CycleLegendSheet}
export default CycleLegendSheet