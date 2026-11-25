import { Pressable, Text, View } from 'react-native';
import { CheckIcon } from 'phosphor-react-native';
import Button from '../../../shared/components/common/Button/Button';
import { useTheme } from '../../../shared/hooks/useTheme';
import { fontFamilies } from '../../../shared/theme';

const opcoes = [
    ['confirmado', 'Usei', '#546E5F'],
    ['foraDoPrazo', 'Usei fora do prazo', '#DCA15E'],
    ['naoUsei', 'Não usei', '#A65140']
];

function UsageHistoryEditControls({
    opcaoSelecionada, opcoesDisponiveis, podeSalvar, salvando, erro,
    aoSelecionarOpcao, aoSalvar, aoApagarRegistro, modo = 'calendario', children, estiloOpcoes
}) {
    const tema = useTheme();
    return (
        <View style={{ width: '100%', gap: 10 }}>
            <View style={[{ gap: 10 }, estiloOpcoes]}>
                {children}
                {[opcoes.slice(0, 2), opcoes.slice(2)].map((linha) => (
                    <View key={linha[0][0]} style={{
                        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
                        gap: modo === 'lista' ? 20 : 10
                    }}>
                        {linha.map(([id, rotulo, fundo]) => {
                            const selecionada = opcaoSelecionada === id;
                            const desabilitada = salvando || !opcoesDisponiveis.includes(id);
                            const cor = '#FFFFFF';
                            return (
                                <Pressable key={id} accessibilityRole="button"
                                    accessibilityState={{ selected: selecionada, disabled: Boolean(desabilitada) }}
                                    disabled={desabilitada} onPress={() => aoSelecionarOpcao(id)}
                                    style={{
                                        flexGrow: modo === 'lista' ? 1 : 0, minHeight: 24,
                                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                        paddingHorizontal: 14, gap: 6, borderRadius: 30, backgroundColor: fundo,
                                        opacity: desabilitada ? 0.65 : 1
                                    }}>
                                    {selecionada ? <CheckIcon size={10} weight="bold" color={cor} /> : null}
                                    <Text style={{ color: cor, fontFamily: fontFamilies.semibold, fontSize: 10, lineHeight: 20 }}>{rotulo}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                ))}
                {aoApagarRegistro ? (
                    <Button texto="Apagar registro" variante="branco" tamanho="compacto"
                        desativado={salvando} aoPressionar={aoApagarRegistro}
                        estilo={{ height: 'auto', minHeight: 36, borderRadius: 10 }}
                    />
                ) : null}
            </View>
            {erro ? <Text accessibilityRole="alert" style={{ color: tema.cores.interface.textoPrincipal }}>{erro}</Text> : null}
            <Button texto="Salvar" variante="verde" tamanho="compacto"
                desativado={!podeSalvar} carregando={salvando} aoPressionar={aoSalvar}
                estilo={{ height: 'auto', minHeight: 36, borderRadius: 10, ...(!podeSalvar && !tema.escuro && { backgroundColor: '#E6E2D8' }) }}
                estiloTexto={{ fontSize: 13, lineHeight: 20, ...(!podeSalvar && !tema.escuro && { color: '#A8A49C' }) }}
            />
        </View>
    );
}

export { UsageHistoryEditControls };
