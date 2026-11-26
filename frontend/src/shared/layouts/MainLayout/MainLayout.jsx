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
    corFundo,
    corTextoHeader,
    corFundoNavegacao,
    aplicarSafeAreaSuperiorHeader = true
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const navegacaoInferior = <BottomTabBar abaAtiva={abaAtiva} onSelecionar={onSelecionarAba} />;
    const cabecalho = (
        <Header
            titulo={titulo}
            variante={varianteHeader}
            onVoltar={onVoltar}
            corFundo={corFundo}
            corTexto={corTextoHeader}
            acoes={acoesHeader}
            aplicarSafeAreaSuperior={aplicarSafeAreaSuperiorHeader}
        />
    );

    return (
        <View
            testID="main-layout"
            style={[
                estilos.container,
                corFundo
                    ? {
                          backgroundColor: corFundo
                      }
                    : null
            ]}
        >
            {cabecalho}

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
                    style={[
                        estilos.navegacaoSegura,
                        corFundoNavegacao ? { backgroundColor: corFundoNavegacao } : null
                    ]}
                >
                    {navegacaoInferior}
                </SafeAreaView>
            ) : (
                navegacaoInferior
            )}
        </View>
    );
}

export { MainLayout };
