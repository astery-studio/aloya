import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';

import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './Header.style';

function Header({ titulo, variante = 'padrao', onVoltar, corFundo, acoesDireita }) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const temVoltar = variante === 'comVoltar';
    const ehDiario = variante === 'diario';

    const voltarDesabilitado = typeof onVoltar !== 'function';

    return (
        <View
            testID="header-container"
            style={[
                estilos.container,
                temVoltar && estilos.containerComVoltar,
                ehDiario && estilos.containerDiario,
                corFundo ? { backgroundColor: corFundo } : null
            ]}
        >
            <View
                style={[
                    estilos.espacamentoSuperior,
                    temVoltar && estilos.espacamentoSuperiorComVoltar,
                    ehDiario && estilos.espacamentoSuperiorDiario
                ]}
            />

            <View
                style={[
                    estilos.areaTitulo,
                    temVoltar && estilos.areaTituloComVoltar,
                    ehDiario && estilos.areaTituloDiario
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

                <Text
                    style={[
                        estilos.titulo,
                        temVoltar && estilos.tituloComVoltar,
                        ehDiario && estilos.tituloDiario
                    ]}
                    accessibilityRole="header"
                >
                    {titulo}
                </Text>

                {!temVoltar && acoesDireita ? (
                    <View style={[estilos.acoesDireita, ehDiario && estilos.acoesDireitaDiario]}>
                        {acoesDireita}
                    </View>
                ) : null}
            </View>
        </View>
    );
}

export { Header };
