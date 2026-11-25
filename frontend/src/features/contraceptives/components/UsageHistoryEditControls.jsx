import { Pressable, Text, View } from 'react-native';
import { CheckIcon } from 'phosphor-react-native';
import Button from '../../../shared/components/common/Button/Button';
import { useTheme } from '../../../shared/hooks/useTheme';
import { fontFamilies } from '../../../shared/theme';

const opcoes = [
    ['confirmado', 'Confirmado', '#546E5F'],
    ['foraDoPrazo', 'Fora do prazo', '#DCA15E'],
    ['naoConfirmado', 'Não confirmado', '#D17966'],
    ['remover', 'Remover', 'transparent']
];

function UsageHistoryEditControls({
    opcaoSelecionada, opcoesDisponiveis, podeSalvar, salvando, erro,
    aoSelecionarOpcao, aoSalvar, modo = 'calendario'
}) {
    const tema = useTheme();
    const corRemover = tema.escuro ? tema.cores.interface.textoSecundario : '#999999';
    return (
        <View style={{ width: '100%', gap: 10 }}>
            <View style={{ gap: 10 }}>
                {[opcoes.slice(0, 2), opcoes.slice(2)].map((linha) => (
                    <View key={linha[0][0]} style={{
                        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
                        gap: modo === 'lista' ? 20 : 10
                    }}>
                        {linha.map(([id, rotulo, fundo]) => {
                            const selecionada = opcaoSelecionada === id;
                            const desabilitada = salvando || !opcoesDisponiveis.includes(id);
                            const remover = id === 'remover';
                            const cor = remover ? corRemover : '#FFFFFF';
                            return (
                                <Pressable key={id} accessibilityRole="button"
                                    accessibilityState={{ selected: selecionada, disabled: Boolean(desabilitada) }}
                                    disabled={desabilitada} onPress={() => aoSelecionarOpcao(id)}
                                    style={{
                                        flexGrow: modo === 'lista' ? 1 : 0, minHeight: 24,
                                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                        paddingHorizontal: 14, gap: 6, borderRadius: 30, backgroundColor: fundo,
                                        borderWidth: remover ? 0.67 : 0, borderColor: corRemover,
                                        opacity: desabilitada && !remover ? 0.65 : 1
                                    }}>
                                    {selecionada ? <CheckIcon size={10} weight="bold" color={cor} /> : null}
                                    <Text style={{ color: cor, fontFamily: fontFamilies.semibold, fontSize: 10, lineHeight: 20 }}>{rotulo}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                ))}
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
