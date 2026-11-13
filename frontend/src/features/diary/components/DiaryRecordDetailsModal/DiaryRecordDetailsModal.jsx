import { useWindowDimensions } from 'react-native';

import AppModal from '../../../../shared/components/feedback/Modal/AppModal';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterCoresDiario } from '../../config/diaryColors';
import { DiaryRecordDetails } from '../DiaryRecordDetails/DiaryRecordDetails';

function calcularAlturaMaximaDetalhes(alturaTela) {
    if (!Number.isFinite(alturaTela) || alturaTela <= 0) return 756.67;
    return Math.min(756.67, alturaTela * 0.92);
}

function DiaryRecordDetailsModal({
    visivel,
    registro,
    carregando,
    erro,
    aoTentarNovamente,
    aoAnterior,
    aoProximo,
    aoEditar,
    aoExcluir,
    aoFechar,
    excluindo = false
}) {
    const tema = useTheme();
    const cores = obterCoresDiario(tema).interface;
    const { height } = useWindowDimensions();

    return (
        <AppModal
            variante="detalhes"
            visivel={visivel}
            aoFechar={excluindo ? undefined : aoFechar}
            estilo={{
                width: 342,
                maxWidth: '100%',
                maxHeight: calcularAlturaMaximaDetalhes(height),
                paddingTop: 0,
                paddingBottom: 0,
                borderRadius: 20,
                backgroundColor: cores.superficie
            }}
        >
            {visivel ? (
                <DiaryRecordDetails
                    registro={registro}
                    carregando={carregando}
                    erro={erro}
                    aoTentarNovamente={aoTentarNovamente}
                    aoAnterior={aoAnterior}
                    aoProximo={aoProximo}
                    aoEditar={aoEditar}
                    aoExcluir={aoExcluir}
                    aoFechar={aoFechar}
                    acaoEmAndamento={excluindo ? 'excluir' : null}
                />
            ) : null}
        </AppModal>
    );
}

export { calcularAlturaMaximaDetalhes, DiaryRecordDetailsModal };
