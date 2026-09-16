/**
 * Mostra o título de uma tela, com ou sem botão de voltar.
 * É usado no topo das telas do aplicativo.
 * Existe para reunir as duas variantes de cabeçalho em um componente.
 */

import { Pressable, Text, View } from 'react-native'
import { estilos } from './Header.style'

/**
 * Recebe o título, a variante e a ação de voltar.
 * Mostra o botão somente na variante "comVoltar".
 * Retorna o cabeçalho pronto para a tela.
 */
function Header({
    titulo,
    variante = 'padrao',
    onVoltar
}) {
    const temVoltar = variante === 'comVoltar'

    return (
        <View style={estilos.container}>
            <View style={estilos.espacamentoSuperior} />

            <View
                style={[
                    estilos.areaTitulo,
                    temVoltar && estilos.areaTituloComVoltar
                ]}
            >
                <Text
                    style={estilos.titulo}
                    numberOfLines={1}
                    accessibilityRole="header"
                >
                    {titulo}
                </Text>

                {temVoltar ? (
                    <Pressable
                        onPress={onVoltar}
                        disabled={typeof onVoltar !== 'function'}
                        accessibilityRole="button"
                        accessibilityLabel="Voltar"
                        accessibilityState={{
                            disabled: typeof onVoltar !== 'function'
                        }}
                        style={estilos.containerVoltar}
                    >
                        <Text style={estilos.iconeVoltar}>
                            ←
                        </Text>
                    </Pressable>
                ) : null}

                {temVoltar ? (
                    <View style={estilos.espacamentoFinal} />
                ) : null}
            </View>
        </View>
    )
}

export { Header }