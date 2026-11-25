import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

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
    layoutRefatorado = false
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const temVoltar = variante === 'comVoltar';
    const ehDiario = variante === 'diario';

    const ehRedeApoio = variante === 'redeApoio';
    const voltarRefatorado = temVoltar && layoutRefatorado;

    const acoesExibidas = acoesDireita ?? acoes;
    const temAcoes = !temVoltar && Boolean(acoesExibidas);

    const voltarDesabilitado = typeof onVoltar !== 'function';

    return (
        <View
            testID="header-container"
            style={[
                estilos.container,
                temVoltar && estilos.containerComVoltar,
                ehDiario && estilos.containerDiario,
                voltarRefatorado && estilos.containerRefatorado,
                corFundo ? { backgroundColor: corFundo } : null
            ]}
        >
            {!voltarRefatorado && (
                <View
                    style={[
                        estilos.espacamentoSuperior,
                        temVoltar && estilos.espacamentoSuperiorComVoltar,
                        ehRedeApoio && estilos.espacamentoSuperiorRedeApoio,
                        ehDiario && estilos.espacamentoSuperiorDiario
                    ]}
                />
            )}

            <View
                style={[
                    estilos.areaTitulo,
                    temVoltar && estilos.areaTituloComVoltar,
                    ehRedeApoio && estilos.areaTituloRedeApoio,
                    ehDiario && estilos.areaTituloDiario,
                    voltarRefatorado && estilos.areaTituloRefatorada
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
                            style={[
                                estilos.titulo,
                                estilos.tituloRedeApoio,
                                corTexto ? { color: corTexto } : null
                            ]}
                            accessibilityRole="header"
                        >
                            {titulo}
                        </Text>
                    </View>
                ) : (
                    <Text
                        style={[
                            estilos.titulo,
                            temVoltar && estilos.tituloComVoltar,
                            voltarRefatorado && estilos.tituloRefatorado,
                            ehDiario && estilos.tituloDiario,
                            corTexto ? { color: corTexto } : null
                        ]}
                        accessibilityRole="header"
                    >
                        {titulo}
                    </Text>
                )}

                {voltarRefatorado && (
                    <View
                        testID="header-back-balance"
                        pointerEvents="none"
                        style={estilos.espacadorVoltar}
                    />
                )}

                {temAcoes ? (
                    <View
                        testID="header-actions"
                        accessibilityRole="toolbar"
                        accessibilityLabel="Ações da tela"
                        style={[estilos.acoes, ehDiario && estilos.acoesDireitaDiario]}
                    >
                        {acoesExibidas}
                    </View>
                ) : null}
            </View>
        </View>
    );
}

export { Header };
