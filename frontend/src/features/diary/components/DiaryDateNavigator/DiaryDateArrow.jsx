import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { CaretLeft, CaretRight } from 'phosphor-react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './DiaryDateNavigator.styles';

function DiaryDateArrow({ direcao, aoPressionar, desabilitado }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const anterior = direcao === 'anterior';
    const Icone = anterior ? CaretLeft : CaretRight;
    const rotulo = anterior ? 'Dia anterior' : 'Próximo dia';

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={rotulo}
            accessibilityState={{ disabled: desabilitado }}
            disabled={desabilitado}
            onPress={aoPressionar}
            style={[estilos.botaoSeta, desabilitado && estilos.desabilitado]}
        >
            <Icone size={20} color={tema.cores.interface.textoSecundario} />
        </Pressable>
    );
}

export { DiaryDateArrow };
