// Organiza o cabeçalho, o conteúdo e a navegação inferior das telas internas.
import { useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../../components/navigation/BottomTab/BottomTabBar/BottomTabBar';
import { Header } from '../../components/navigation/Header/Header';
import { useTheme } from '../../hooks/useTheme';
import { criarEstilos } from './MainLayout.style';

function MainLayout({
    titulo,
    varianteHeader = 'padrao',
    onVoltar,
    acoesHeader = null,
    abaAtiva,
    onSelecionarAba,
    usarAreaSeguraInferior = true,
    children,
    corFundo
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const navegacaoInferior = <BottomTabBar abaAtiva={abaAtiva} onSelecionar={onSelecionarAba} />;

    return (
        <SafeAreaView
            testID="main-layout"
            edges={['left', 'right']}
            style={[
                estilos.container,
                corFundo
                    ? {
                          backgroundColor: corFundo
                      }
                    : null
            ]}
        >
            <Header
                titulo={titulo}
                variante={varianteHeader}
                onVoltar={onVoltar}
                acoes={acoesHeader}
                corFundo={corFundo}
            />

            <View
                testID="conteudo-main-layout"
                style={[
                    estilos.conteudo,
                    corFundo
                        ? {
                              backgroundColor: corFundo
                          }
                        : null
                ]}
            >
                {children}
            </View>

            {usarAreaSeguraInferior ? (
                <SafeAreaView
                    testID="navegacao-segura-main-layout"
                    edges={['bottom']}
                    style={estilos.navegacaoSegura}
                >
                    {navegacaoInferior}
                </SafeAreaView>
            ) : (
                navegacaoInferior
            )}
        </SafeAreaView>
    );
}

export { MainLayout };
