/**
 * Mantém sincronizada a preferência de redução de movimento do sistema.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

function useReducedMotion() {
    const [habilitada, setHabilitada] = useState(false);

    useEffect(() => {
        let ativo = true;

        AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
            if (ativo) setHabilitada(valor);
        });

        const assinatura = AccessibilityInfo.addEventListener('reduceMotionChanged', setHabilitada);

        return () => {
            ativo = false;
            assinatura?.remove?.();
        };
    }, []);

    return habilitada;
}

export { useReducedMotion };
