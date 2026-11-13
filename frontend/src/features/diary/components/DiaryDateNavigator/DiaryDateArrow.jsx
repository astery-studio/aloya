import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { CaretLeft } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRight } from 'phosphor-react-native/src/icons/CaretRight';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterCoresDiario } from '../../config/diaryColors';
import { criarEstilos } from './DiaryDateNavigator.styles';

function DiaryDateArrow({ direcao, aoPressionar, desabilitado, compacto = false }) {
    const tema = useTheme();
    const cores = obterCoresDiario(tema).interface;
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
            style={[
                estilos.botaoSeta,
                compacto && estilos.botaoSetaCompacto,
                desabilitado && estilos.desabilitado
            ]}
        >
            <Icone size={compacto ? 16.47 : 20} color={cores.textoSecundario} />
        </Pressable>
    );
}

export { DiaryDateArrow };
