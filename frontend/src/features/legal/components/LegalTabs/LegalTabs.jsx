import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './LegalTabs.styles';

const opcoes = Object.freeze([
    { id: 'privacy', titulo: 'Privacidade' },
    { id: 'terms', titulo: 'Termos de uso' }
]);

function LegalTabs({ selecionado, onSelecionar }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    return (
        <View accessibilityRole="tablist" style={estilos.container}>
            {opcoes.map(({ id, titulo }) => {
                const ativo = selecionado === id;
                return (
                    <Pressable
                        key={id}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: ativo }}
                        onPress={() => onSelecionar(id)}
                        style={({ pressed }) => [estilos.aba, pressed && estilos.pressionado]}
                    >
                        <View style={[estilos.rotulo, ativo && estilos.ativo]}>
                            <Text style={[estilos.texto, ativo && estilos.textoAtivo]}>
                                {titulo}
                            </Text>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );
}

export { LegalTabs };
