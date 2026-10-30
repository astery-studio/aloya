// Mostra uma linha que abre outra tela ou painel.
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';

import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './NavigationField.style';

function obterPaletasDosIcones(tema) {
    return {
        corVerde: tema.cores.icones.configuracoes.verde,

        corAzul: tema.cores.icones.configuracoes.azul,

        corLaranja: tema.cores.icones.configuracoes.laranja,

        corVermelho: tema.cores.icones.anticoncepcionais.vermelho,

        corVerde2: tema.cores.icones.anticoncepcionais.verde
    };
}

function obterPaleta(tema, paleta) {
    const paletas = obterPaletasDosIcones(tema);

    return paletas[paleta] ?? paletas.corVerde;
}

function NavigationField({
    label,
    icone: Icone,
    onPress,
    variante = 'comBorda',
    paleta = 'corVerde',
    desabilitado = false
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const coresDoIcone = obterPaleta(tema, paleta);

    const semBorda = variante === 'semBorda';

    const ehBotao = variante === 'botao';

    const estaDesabilitado = desabilitado || typeof onPress !== 'function';

    const corSetaNormal = tema.escuro
        ? tema.cores.interface.textoDesabilitado
        : tema.cores.neutras.bordaTracejada;

    const corSeta = ehBotao ? tema.cores.interface.textoSecundario : corSetaNormal;

    return (
        <Pressable
            onPress={onPress}
            disabled={estaDesabilitado}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint="Abre outra tela ou painel"
            accessibilityState={{
                disabled: estaDesabilitado
            }}
            style={[
                estilos.container,
                semBorda && estilos.semBorda,
                ehBotao && estilos.botao,
                estaDesabilitado && estilos.desabilitado
            ]}
        >
            {Icone ? (
                <View
                    style={[
                        estilos.caixaIcone,
                        ehBotao && estilos.caixaIconeBotao,
                        {
                            backgroundColor: coresDoIcone.caixa
                        }
                    ]}
                >
                    <Icone
                        size={semBorda || ehBotao ? 24 : 20}
                        color={coresDoIcone.icone}
                        weight="regular"
                    />
                </View>
            ) : null}

            <Text style={estilos.label} numberOfLines={2}>
                {label}
            </Text>

            <CaretRightIcon size={semBorda || ehBotao ? 20 : 18} color={corSeta} weight="regular" />
        </Pressable>
    );
}

export { NavigationField, obterPaleta };
