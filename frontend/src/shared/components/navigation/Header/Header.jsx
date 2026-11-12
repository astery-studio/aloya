import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArrowLeftIcon } from '../../icons/AppIcons';
import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './Header.style';

function Header({ titulo, variante = 'padrao', onVoltar, corFundo, acoes = null }) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const temVoltar = variante === 'comVoltar';

    const ehRedeApoio = variante === 'redeApoio';

    const temAcoes = !temVoltar && Boolean(acoes);

    const voltarDesabilitado = typeof onVoltar !== 'function';

    return (
        <SafeAreaView
            testID="header-container"
            edges={['top']}
            style={[
                estilos.container,
                temVoltar && estilos.containerComVoltar,
                corFundo
                    ? {
                          backgroundColor: corFundo
                      }
                    : null
            ]}
        >
            <View
                style={[
                    estilos.espacamentoSuperior,
                    temVoltar && estilos.espacamentoSuperiorComVoltar,
                    ehRedeApoio && estilos.espacamentoSuperiorRedeApoio
                ]}
            />

            <View
                style={[
                    estilos.areaTitulo,
                    temVoltar && estilos.areaTituloComVoltar,
                    ehRedeApoio && estilos.areaTituloRedeApoio
                ]}
            >
                {temVoltar ? (
                    <Pressable
                        onPress={onVoltar}
                        disabled={voltarDesabilitado}
                        accessibilityRole="button"
                        accessibilityLabel="Voltar"
                        accessibilityState={{
                            disabled: voltarDesabilitado
                        }}
                        style={[
                            estilos.containerVoltar,
                            voltarDesabilitado && estilos.desabilitado
                        ]}
                    >
                        <ArrowLeftIcon
                            size={24}
                            color={tema.cores.interface.textoSecundario}
                            weight="regular"
                        />
                    </Pressable>
                ) : null}

                {ehRedeApoio ? (
                    <View testID="header-title-container" style={estilos.containerTituloRedeApoio}>
                        <Text
                            style={[estilos.titulo, estilos.tituloRedeApoio]}
                            accessibilityRole="header"
                        >
                            {titulo}
                        </Text>
                    </View>
                ) : (
                    <Text
                        style={[estilos.titulo, temVoltar && estilos.tituloComVoltar]}
                        accessibilityRole="header"
                    >
                        {titulo}
                    </Text>
                )}

                {temAcoes ? (
                    <View
                        testID="header-actions"
                        accessibilityRole="toolbar"
                        accessibilityLabel="Ações da tela"
                        style={estilos.acoes}
                    >
                        {acoes}
                    </View>
                ) : null}
            </View>
        </SafeAreaView>
    );
}

export { Header };
