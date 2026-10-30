import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircleIcon } from 'phosphor-react-native/src/icons/CheckCircle';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';

import { useTheme } from '../../../shared/hooks/useTheme';
import { fontFamilies } from '../../../shared/theme';

const rotulos = {
    sincronizando: 'Sincronizando alterações…',
    pendente: 'Alterações salvas neste aparelho. Sincronização pendente.',
    falha: 'Alterações salvas neste aparelho. Falha na sincronização.',
    sincronizado: 'Alterações sincronizadas.'
};

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexWrap: 'wrap'
        },
        texto: {
            flex: 1,
            fontFamily: fontFamilies.regular,
            fontSize: 12,
            lineHeight: 18,
            color: tema.cores.interface.textoSecundario
        },
        acao: {
            fontFamily: fontFamilies.semibold,
            fontSize: 12,
            color: tema.cores.interface.destaque
        }
    });
}

function SyncStatusIndicator({ status, mensagem, onTentarNovamente, mostrarSincronizado = false }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    if (!rotulos[status] || (status === 'sincronizado' && !mostrarSincronizado)) return null;

    const Icone =
        status === 'falha'
            ? WarningCircleIcon
            : status === 'sincronizado'
              ? CheckCircleIcon
              : ClockIcon;

    return (
        <View style={estilos.container} accessibilityLiveRegion="polite">
            {status === 'sincronizando' ? (
                <ActivityIndicator
                    accessibilityLabel="Sincronizando"
                    color={tema.cores.interface.destaque}
                />
            ) : (
                <Icone size={18} color={tema.cores.interface.textoSecundario} />
            )}
            <Text style={estilos.texto}>{mensagem || rotulos[status]}</Text>
            {status === 'falha' && typeof onTentarNovamente === 'function' ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Tentar sincronizar novamente"
                    onPress={onTentarNovamente}
                    hitSlop={8}
                >
                    <Text style={estilos.acao}>Tentar novamente</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

export { SyncStatusIndicator };
