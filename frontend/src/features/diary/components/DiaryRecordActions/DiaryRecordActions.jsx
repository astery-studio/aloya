import { Pressable, Text, View } from 'react-native';

import { PencilSimpleIcon, TrashIcon } from '../../../../shared/components/icons/AppIcons';

function criarEstiloBotaoAcao(estilos, bloqueado, pressionado) {
    return [
        estilos.botaoAcao,
        bloqueado ? estilos.botaoAcaoDesativado : null,
        pressionado ? estilos.pressionado : null
    ];
}

function DiaryRecordActions({ registro, dataFormatada, aoEditar, aoExcluir, bloqueado, estilos }) {
    if (typeof aoEditar !== 'function' && typeof aoExcluir !== 'function') return null;

    return (
        <View style={estilos.alteracao}>
            <Text style={[estilos.resumoDia, estilos.tituloAlteracao]}>ALTERAÇÃO DO REGISTRO</Text>
            <Text style={estilos.textoAlteracao}>
                Você pode alterar as informações desse registro por meio das opções:
            </Text>
            <View style={estilos.acoes}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Editar registro de ${dataFormatada}`}
                    accessibilityState={{ disabled: bloqueado || typeof aoEditar !== 'function' }}
                    disabled={bloqueado || typeof aoEditar !== 'function'}
                    onPress={() => aoEditar?.(registro)}
                    style={({ pressed }) =>
                        criarEstiloBotaoAcao(
                            estilos,
                            bloqueado || typeof aoEditar !== 'function',
                            pressed
                        )
                    }
                >
                    <PencilSimpleIcon size={13} color="#FFFFFF" />
                    <Text style={estilos.textoBotaoAcao}>Editar</Text>
                </Pressable>
                {typeof aoExcluir === 'function' ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Excluir registro de ${dataFormatada}`}
                        accessibilityState={{ disabled: bloqueado }}
                        disabled={bloqueado}
                        onPress={() => aoExcluir(registro)}
                        style={({ pressed }) => criarEstiloBotaoAcao(estilos, bloqueado, pressed)}
                    >
                        <TrashIcon size={13} color="#FFFFFF" />
                        <Text style={estilos.textoBotaoAcao}>Excluir</Text>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}

export { criarEstiloBotaoAcao, DiaryRecordActions };
