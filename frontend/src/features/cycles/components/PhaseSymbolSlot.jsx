import { View } from 'react-native';

function PhaseSymbolSlot({ children, compact = false, style }) {
    return (
        <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            testID="phase-symbol-slot"
            style={[
                {
                    width: compact ? 128 : 260,
                    height: compact ? 144 : 284,
                    alignSelf: 'center'
                },
                style
            ]}
        >
            {children}
        </View>
    );
}

export { PhaseSymbolSlot };
