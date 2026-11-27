import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CheckCircleIcon } from 'phosphor-react-native/src/icons/CheckCircle';
import { ClockIcon } from 'phosphor-react-native/src/icons/Clock';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';

import { ArrowsClockwiseIcon } from '../../../shared/components/icons/AppIcons';
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
        },
        containerCalendario: {
            width: '100%',
            maxWidth: 351,
            height: 64,
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 10,
            paddingBottom: 10,
            paddingHorizontal: 13,
            gap: 10,
            borderRadius: 12,
            backgroundColor: tema.escuro ? '#332D20' : '#FBF3E0',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.14,
            shadowRadius: 8,
            elevation: 5
        },
        conteudoCalendario: {
            width: '100%',
            height: 44,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 9
        },
        textoCalendario: {
            flex: 1,
            fontFamily: fontFamilies.medium,
            fontSize: 13,
            fontWeight: '500',
            lineHeight: 19,
            textAlign: 'center',
            color: '#B07D2A'
        },
        textoCalendarioDestaque: {
            fontFamily: fontFamilies.bold,
            fontWeight: '700'
        },
        botaoCalendario: {
            width: 44,
            height: 44,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 0.666667,
            borderColor: '#E8C97A',
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
        }
    });
}

function SyncStatusIndicator({
    status,
    mensagem,
    onTentarNovamente,
    mostrarSincronizado = false,
    variante = 'padrao'
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    if (!rotulos[status] || (status === 'sincronizado' && !mostrarSincronizado)) return null;

    const Icone =
        status === 'falha'
            ? WarningCircleIcon
            : status === 'sincronizado'
              ? CheckCircleIcon
              : ClockIcon;
    const textoApresentado = mensagem || rotulos[status];
    const marcadorFalha = 'Falha na sincronização.';
    const deveDestacarFalha = status === 'falha' && textoApresentado.includes(marcadorFalha);
    const textoAntesDaFalha = deveDestacarFalha
        ? textoApresentado.slice(0, textoApresentado.indexOf(marcadorFalha)).trim()
        : textoApresentado;

    if (variante === 'calendario') {
        return (
            <View
                testID="sync-status-calendar"
                style={estilos.containerCalendario}
                accessibilityLiveRegion="polite"
            >
                <View style={estilos.conteudoCalendario}>
                    <Text testID="sync-status-calendar-message" style={estilos.textoCalendario}>
                        {textoAntesDaFalha}
                        {deveDestacarFalha ? (
                            <>
                                {'\n'}
                                <Text style={estilos.textoCalendarioDestaque}>{marcadorFalha}</Text>
                            </>
                        ) : null}
                    </Text>
                    {status === 'falha' && typeof onTentarNovamente === 'function' ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Tentar sincronizar novamente"
                            onPress={onTentarNovamente}
                            hitSlop={8}
                            style={estilos.botaoCalendario}
                        >
                            <ArrowsClockwiseIcon size={22} color="#B07D2A" weight="regular" />
                        </Pressable>
                    ) : null}
                </View>
            </View>
        );
    }

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
