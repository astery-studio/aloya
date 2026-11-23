import { View } from 'react-native';

function PhaseSymbolSlot({ compact = false, style }) {
    return (
        <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            testID="phase-symbol-slot"
            style={[
                {
                    width: compact ? 128 : 260,
                    height: compact ? 144 : 304,
                    alignSelf: 'center'
                },
                style
            ]}
        />
    );
}

export { PhaseSymbolSlot };
