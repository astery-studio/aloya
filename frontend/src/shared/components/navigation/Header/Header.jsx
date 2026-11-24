import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowLeftIcon } from '../../icons/AppIcons';
import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './Header.style';

function Header({
    titulo,
    variante = 'padrao',
    onVoltar,
    corFundo,
    corTexto,
    acoes = null,
    acoesDireita = null,
    complementoTitulo = null,
    aplicarSafeAreaSuperior = true
}) {
    const tema = useTheme();
    const insets = useSafeAreaInsets();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const temVoltar = variante === 'comVoltar';

    const acoesExibidas = acoesDireita ?? acoes;
    const temAcoes = temVoltar ? Boolean(acoesDireita) : Boolean(acoesExibidas);

    const voltarDesabilitado = typeof onVoltar !== 'function';
    const paddingTop =
        (aplicarSafeAreaSuperior ? insets.top : 0) +
        tema.espacamentosLayout.espacamentoSuperiorHeader;

    return (
        <View
            testID="header-container"
            style={[
                estilos.container,
                temVoltar && estilos.containerComVoltar,
                { paddingTop },
                corFundo ? { backgroundColor: corFundo } : null
            ]}
        >
            <View
                testID="header-content"
                style={[estilos.areaTitulo, temVoltar && estilos.areaTituloComVoltar]}
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

                {complementoTitulo ? (
                    <View style={[estilos.blocoTitulo, temVoltar && estilos.blocoTituloComVoltar]}>
                        <Text
                            style={[
                                estilos.tituloNoBloco,
                                temVoltar && estilos.tituloComVoltar,
                                corTexto ? { color: corTexto } : null
                            ]}
                            accessibilityRole="header"
                        >
                            {titulo}
                        </Text>
                        {complementoTitulo}
                    </View>
                ) : (
                    <Text
                        style={[
                            estilos.titulo,
                            temVoltar && estilos.tituloComVoltar,
                            corTexto ? { color: corTexto } : null
                        ]}
                        accessibilityRole="header"
                    >
                        {titulo}
                    </Text>
                )}

                {temVoltar && !temAcoes ? (
                    <View
                        testID="header-back-balance"
                        pointerEvents="none"
                        style={estilos.espacadorVoltar}
                    />
                ) : null}

                {temAcoes ? (
                    <View
                        testID="header-actions"
                        accessibilityRole="toolbar"
                        accessibilityLabel="Ações da tela"
                        style={[estilos.acoes, temVoltar && estilos.acoesComVoltar]}
                    >
                        {acoesExibidas}
                    </View>
                ) : null}
            </View>
        </View>
    );
}

export { Header };
