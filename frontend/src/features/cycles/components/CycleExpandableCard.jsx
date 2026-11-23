import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDownIcon, CaretUpIcon } from '../../../shared/components/icons/AppIcons';
import { estilos } from './CycleExpandableCard.styles';

function CycleExpandableCard({
    titulo,
    title,
    subtitulo,
    icone,
    expandido,
    aoAlternar,
    desabilitado = false,
    children,
    initiallyExpanded = false
}) {
    const [localExpanded, setLocalExpanded] = useState(initiallyExpanded);
    const expanded = typeof expandido === 'boolean' ? expandido : localExpanded;
    const alternar = () => {
        if (desabilitado) return;
        aoAlternar?.();
        if (typeof expandido !== 'boolean') setLocalExpanded((current) => !current);
    };
    const Icon = expanded ? CaretUpIcon : CaretDownIcon;

    return (
        <View style={[estilos.card, desabilitado && estilos.desabilitado]}>
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded, disabled: desabilitado }}
                disabled={desabilitado}
                onPress={alternar}
                style={estilos.trigger}
            >
                <View style={estilos.titleArea}>
                    {icone}
                    <View style={estilos.textos}>
                        <Text style={estilos.title}>{titulo ?? title}</Text>
                        {subtitulo ? <Text style={estilos.subtitle}>{subtitulo}</Text> : null}
                    </View>
                </View>
                <Icon size={20} color="#222222" />
            </Pressable>
            {expanded ? <View style={estilos.content}>{children}</View> : null}
        </View>
    );
}

export { CycleExpandableCard };
