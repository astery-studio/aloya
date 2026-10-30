//Apresenta a legenda real e prevista do calendário em um bottom sheet.
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DropIcon } from 'phosphor-react-native/src/icons/Drop';
import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { SunIcon } from 'phosphor-react-native/src/icons/Sun';
import { WavesIcon } from 'phosphor-react-native/src/icons/Waves';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { BottomSheetLayout } from '../../../../shared/layouts/BottomSheet/BottomSheetLayout';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos, cores, fundosPrevistos, fundosReais } from './CycleLegendSheet.styles';

const iconesPorTipo = Object.freeze({
    menstruacao: DropIcon,
    folicular: PlantIcon,
    ovulacao: SunIcon,
    lutea: WavesIcon
});

function obterCorJanela(prevista, tema) {
    if (tema.escuro) {
        return prevista ? 'rgba(196, 200, 197, 0.62)' : tema.cores.interface.textoSecundario;
    }

    return prevista ? cores.janelaFertilPrevista : cores.janelaFertil;
}

function MarcadorLegenda({ item, estilos, tema }) {
    const prevista = item.prevista === true;
    const janelaFertil = item.tipo === 'janelaFertil';
    const Icone = iconesPorTipo[item.tipo];

    if (janelaFertil) {
        const cor = obterCorJanela(prevista, tema);

        return (
            <View
                testID={`marcador-legenda-${item.tipo}-${prevista ? 'prevista' : 'real'}`}
                style={[estilos.marcador, estilos.marcadorJanela, { borderColor: cor }]}
            >
                <Text style={estilos.diaJanela}>15</Text>
            </View>
        );
    }

    const fundos = prevista ? fundosPrevistos : fundosReais;
    const fundo = fundos[item.tipo];

    return (
        <View
            testID={`marcador-legenda-${item.tipo}-${prevista ? 'prevista' : 'real'}`}
            style={[estilos.marcador, fundo ? { backgroundColor: fundo } : null]}
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
    );
}

function CycleLegendSheet({ visivel, aoFechar, itens }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const itensValidos = Array.isArray(itens)
        ? itens.filter(
              (item) =>
                  item &&
                  typeof item.id === 'string' &&
                  typeof item.tipo === 'string' &&
                  typeof item.titulo === 'string' &&
                  typeof item.descricao === 'string'
          )
        : [];

    return (
        <BottomSheet visivel={visivel} onFechar={aoFechar}>
            <BottomSheetLayout titulo="Legenda" onFechar={aoFechar}>
                <ScrollView
                    style={estilos.lista}
                    contentContainerStyle={estilos.listaConteudo}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {itensValidos.map((item) => {
                        return (
                            <View
                                key={item.id}
                                testID={`item-legenda-${item.id}`}
                                accessible
                                accessibilityRole="text"
                                accessibilityLabel={`${item.titulo}. ${item.descricao}`}
                                style={estilos.item}
                            >
                                <MarcadorLegenda item={item} estilos={estilos} tema={tema} />

                                <View style={estilos.textos}>
                                    <Text style={estilos.nome}>{item.titulo}</Text>

                                    <Text style={estilos.descricao}>{item.descricao}</Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </BottomSheetLayout>
        </BottomSheet>
    );
}

export { CycleLegendSheet };
export default CycleLegendSheet;
