import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDownIcon, CaretUpIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';

function CycleExpandableCard({
    titulo,
    title,
    subtitulo,
    icone,
    expandido,
    aoAlternar,
    children,
    initiallyExpanded = false
}) {
    const [localExpanded, setLocalExpanded] = useState(initiallyExpanded);
    const expanded = typeof expandido === 'boolean' ? expandido : localExpanded;
    const alternar = () => {
        aoAlternar?.();
        if (typeof expandido !== 'boolean') setLocalExpanded((current) => !current);
    };
    const theme = useTheme();
    const styles = useMemo(
        () => ({
            card: { borderBottomWidth: 1, borderBottomColor: theme.cores.interface.borda },
            trigger: {
                minHeight: 58,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 12
            },
            titleArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
            title: {
                flex: 1,
                color: theme.cores.interface.textoPrincipal,
                fontFamily: 'DMSans_600SemiBold',
                fontSize: 16,
                lineHeight: 22
            },
            subtitle: { color: theme.cores.interface.textoSecundario },
            content: { paddingBottom: 16 }
        }),
        [theme]
    );
    const Icon = expanded ? CaretUpIcon : CaretDownIcon;

    return (
        <View style={styles.card}>
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={alternar}
                style={styles.trigger}
            >
                <View style={styles.titleArea}>
                    {icone}
                    <View>
                        <Text style={styles.title}>{titulo ?? title}</Text>
                        {subtitulo ? <Text style={styles.subtitle}>{subtitulo}</Text> : null}
                    </View>
                </View>
                <Icon size={18} color={theme.cores.interface.textoSecundario} />
            </Pressable>
            {expanded ? <View style={styles.content}>{children}</View> : null}
        </View>
    );
}

export { CycleExpandableCard };
