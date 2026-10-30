import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';

import { useTheme } from '../../../hooks/useTheme';
import { criarEstilos } from './Header.style';

function Header({ titulo, variante = 'padrao', onVoltar }) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const temVoltar = variante === 'comVoltar';

    const voltarDesabilitado = typeof onVoltar !== 'function';

    return (
        <View testID="header-container" style={estilos.container}>
            <View
                style={[
                    estilos.espacamentoSuperior,
                    temVoltar && estilos.espacamentoSuperiorComVoltar
                ]}
            />

            <View style={[estilos.areaTitulo, temVoltar && estilos.areaTituloComVoltar]}>
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
                    style={[estilos.titulo, temVoltar && estilos.tituloComVoltar]}
                    accessibilityRole="header"
                >
                    {titulo}
                </Text>
            </View>
        </View>
    );
}

export { Header };
