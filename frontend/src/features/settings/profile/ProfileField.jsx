// Mostra uma informação do perfil e permite abrir sua edição.
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { NotePencilIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos } from './ProfileField.style';

const VALOR_NAO_INFORMADO = 'Não informado';

function valorFoiInformado(valor) {
    if (typeof valor !== 'string' && typeof valor !== 'number') {
        return false;
    }

    return Boolean(String(valor).trim());
}

function obterValorVisivel(valor) {
    if (!valorFoiInformado(valor)) {
        return VALOR_NAO_INFORMADO;
    }

    return String(valor).trim();
}

function obterEstiloCampo({ estilos, pressionado, desabilitado }) {
    return [
        estilos.container,

        pressionado && !desabilitado ? estilos.pressionado : null,

        desabilitado ? estilos.desabilitado : null
    ];
}

function ProfileField({ label, valor, onPress, desabilitado = false }) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const estaDesabilitado = desabilitado || typeof onPress !== 'function';

    const valorInformado = valorFoiInformado(valor);

    const valorVisivel = obterValorVisivel(valor);

    return (
        <Pressable
            onPress={onPress}
            disabled={estaDesabilitado}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${label}`}
            accessibilityHint="Abre a edição deste dado"
            accessibilityValue={{
                text: valorVisivel
            }}
            accessibilityState={{
                disabled: estaDesabilitado
            }}
            style={({ pressed }) =>
                obterEstiloCampo({
                    estilos,
                    pressionado: pressed,
                    desabilitado: estaDesabilitado
                })
            }
        >
            <View style={estilos.textos}>
                <Text style={estilos.label} numberOfLines={1}>
                    {label}
                </Text>

                <Text
                    style={[estilos.valor, !valorInformado && estilos.valorNaoInformado]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {valorVisivel}
                </Text>
            </View>

            <NotePencilIcon
                size={20}
                color={tema.cores.interface.textoDesabilitado}
                weight="regular"
            />
        </Pressable>
    );
}

export { ProfileField, obterEstiloCampo, obterValorVisivel, valorFoiInformado };
