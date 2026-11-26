import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckIcon } from 'phosphor-react-native';
import Button from '../../../shared/components/common/Button/Button';
import { useTheme } from '../../../shared/hooks/useTheme';
import { fontFamilies } from '../../../shared/theme';

const opcoes = [
    ['confirmado', 'Usei', '#546E5F'],
    ['naoUsei', 'Não usei', '#A65140'],
    ['foraDoPrazo', 'Usei fora do prazo', '#DCA15E']
];

const estilos = StyleSheet.create({
    opcoes: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10
    },
    opcao: {
        minHeight: 24,
        maxWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
        borderRadius: 30
    },
    opcaoLista: { flexGrow: 1 },
    desabilitada: { opacity: 0.65 },
    iconeSelecionado: { position: 'absolute', left: 6 },
    rotulo: {
        color: '#FFFFFF',
        fontFamily: fontFamilies.semibold,
        fontSize: 10,
        lineHeight: 20,
        textAlign: 'center'
    }
});

function UsageHistoryEditControls({
    opcaoSelecionada,
    opcoesDisponiveis,
    podeSalvar,
    salvando,
    erro,
    aoSelecionarOpcao,
    aoSalvar,
    aoApagarRegistro,
    modo = 'calendario',
    children
}) {
    const tema = useTheme();
    return (
        <View style={{ width: '100%', gap: 10 }}>
            <View style={{ gap: 10 }}>
                {children}
                <View style={estilos.opcoes}>
                    {opcoes.map(([id, rotulo, fundo]) => {
                        const selecionada = opcaoSelecionada === id;
                        const desabilitada = Boolean(salvando || !opcoesDisponiveis.includes(id));

                        return (
                            <Pressable
                                key={id}
                                accessibilityRole="button"
                                accessibilityState={{
                                    selected: selecionada,
                                    disabled: desabilitada
                                }}
                                disabled={desabilitada}
                                onPress={() => aoSelecionarOpcao(id)}
                                style={[
                                    estilos.opcao,
                                    modo === 'lista' && estilos.opcaoLista,
                                    { backgroundColor: fundo },
                                    desabilitada && estilos.desabilitada
                                ]}
                            >
                                {selecionada ? (
                                    <CheckIcon
                                        size={10}
                                        weight="bold"
                                        color="#FFFFFF"
                                        style={estilos.iconeSelecionado}
                                    />
                                ) : null}
                                <Text style={estilos.rotulo}>{rotulo}</Text>
                            </Pressable>
                        );
                    })}
                    {aoApagarRegistro ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ disabled: Boolean(salvando) }}
                            disabled={salvando}
                            onPress={aoApagarRegistro}
                            style={[
                                estilos.opcao,
                                { borderWidth: 1, borderColor: tema.cores.interface.borda },
                                salvando && estilos.desabilitada
                            ]}
                        >
                            <Text
                                style={[
                                    estilos.rotulo,
                                    { color: tema.cores.interface.textoSecundario }
                                ]}
                            >
                                Apagar registro
                            </Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>
            {erro ? (
                <Text
                    accessibilityRole="alert"
                    style={{ color: tema.cores.interface.textoPrincipal }}
                >
                    {erro}
                </Text>
            ) : null}
            <Button
                texto="Salvar"
                variante="verde"
                tamanho="compacto"
                desativado={!podeSalvar}
                carregando={salvando}
                aoPressionar={aoSalvar}
                estilo={{
                    height: 'auto',
                    minHeight: 36,
                    borderRadius: 10,
                    ...(!podeSalvar && !tema.escuro && { backgroundColor: '#E6E2D8' })
                }}
                estiloTexto={{
                    fontSize: 13,
                    lineHeight: 20,
                    ...(!podeSalvar && !tema.escuro && { color: '#A8A49C' })
                }}
            />
        </View>
    );
}

export { UsageHistoryEditControls };
