import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { InfoIcon } from 'phosphor-react-native/src/icons/Info';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { MenstrualDaysCalendar } from '../MenstrualDaysCalendar';
import { criarEstilos } from './CycleEditSheet.styles';

function CycleEditSheet({
    visivel,
    meses = [],
    mesInicial,
    alterado,
    salvando,
    carregando,
    onAlternarDia,
    onFechar,
    onOcultar,
    onSalvar
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [larguraMes, setLarguraMes] = useState(312);
    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            onOcultar={onOcultar}
            bloquearFechamento={salvando}
            corPainel={tema.escuro ? '#1E1E1E' : '#FFFFFF'}
        >
            <View style={estilos.painel}>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    Editar Menstruação
                </Text>
                <ScrollView
                    style={estilos.rolagem}
                    contentContainerStyle={estilos.conteudo}
                    showsVerticalScrollIndicator={false}
                >
                    <View
                        style={estilos.calendario}
                        onLayout={({ nativeEvent }) => {
                            const largura = nativeEvent.layout.width - 30.82;
                            if (largura > 0) setLarguraMes(largura);
                        }}
                    >
                        {carregando ? (
                            <ActivityIndicator
                                accessibilityLabel="Carregando dias da menstruação"
                                color={tema.cores.interface.destaque}
                            />
                        ) : (
                            <MenstrualDaysCalendar
                                meses={meses}
                                editavel
                                mesInicial={mesInicial}
                                desativado={salvando}
                                aoPressionarDia={onAlternarDia}
                                larguraMes={larguraMes}
                            />
                        )}
                    </View>
                    <View style={estilos.aviso}>
                        <InfoIcon
                            size={15}
                            color={tema.escuro ? '#999999' : tema.cores.interface.textoSecundario}
                        />
                        <Text style={estilos.instrucao}>
                            Clique em um dia para alterar seu estado.
                        </Text>
                    </View>
                </ScrollView>
                <View style={estilos.rodape}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Concluir"
                        disabled={!alterado || salvando || carregando}
                        accessibilityState={{ disabled: !alterado || salvando || carregando }}
                        onPress={onSalvar}
                        style={[
                            estilos.concluir,
                            (!alterado || salvando || carregando) && estilos.desativado
                        ]}
                    >
                        <Text
                            style={[
                                estilos.textoConcluir,
                                (!alterado || salvando || carregando) && estilos.textoDesativado
                            ]}
                        >
                            Concluir
                        </Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Descartar Alterações"
                        disabled={salvando}
                        onPress={onFechar}
                        style={estilos.descartar}
                    >
                        <Text style={estilos.textoDescartar}>Descartar Alterações</Text>
                    </Pressable>
                </View>
            </View>
        </BottomSheet>
    );
}
export { CycleEditSheet };
