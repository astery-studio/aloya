import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDownIcon, CaretUpIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';

function CycleExpandableCard({ title, children, initiallyExpanded = false }) {
    const [expanded, setExpanded] = useState(initiallyExpanded);
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
            title: {
                flex: 1,
                color: theme.cores.interface.textoPrincipal,
                fontFamily: 'DMSans_600SemiBold',
                fontSize: 16,
                lineHeight: 22
            },
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
                onPress={() => setExpanded((current) => !current)}
                style={styles.trigger}
            >
                <Text style={styles.title}>{title}</Text>
                <Icon size={18} color={theme.cores.interface.textoSecundario} />
            </Pressable>
            {expanded ? <View style={styles.content}>{children}</View> : null}
        </View>
    );
}

export { CycleExpandableCard };
