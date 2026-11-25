import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CaretDownIcon, CaretUpIcon } from '../../../shared/components/icons/AppIcons';
import { estilos } from './CycleExpandableCard.styles';

function CycleExpandableCard({
    titulo,
    title,
    rotulo,
    corRotulo,
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
    const comResumo = Boolean(icone && subtitulo);

    return (
        <View
            style={[
                estilos.card,
                comResumo && estilos.cardComResumo,
                desabilitado && estilos.desabilitado
            ]}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded, ...(desabilitado ? { disabled: true } : {}) }}
                disabled={desabilitado || undefined}
                onPress={alternar}
                style={[estilos.trigger, comResumo && estilos.triggerComResumo]}
            >
                <View style={estilos.titleArea}>
                    {icone}
                    <View style={estilos.textos}>
                        {rotulo ? (
                            <Text style={[estilos.rotulo, corRotulo && { color: corRotulo }]}>
                                {rotulo}
                            </Text>
                        ) : null}
                        <Text
                            style={[
                                estilos.title,
                                rotulo && estilos.titleComRotulo,
                                comResumo && estilos.titleComResumo
                            ]}
                        >
                            {titulo ?? title}
                        </Text>
                        {subtitulo ? <Text style={estilos.subtitle}>{subtitulo}</Text> : null}
                    </View>
                </View>
                <Icon size={comResumo ? 20 : 22} color="#222222" />
            </Pressable>
            {expanded ? (
                <View style={[estilos.content, comResumo && estilos.contentComResumo]}>
                    {children}
                </View>
            ) : null}
        </View>
    );
}

export { CycleExpandableCard };
