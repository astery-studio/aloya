import { memo } from 'react';

import { useTheme } from '../../../../shared/hooks/useTheme';

import {
    obterApresentacaoFase,
    obterApresentacaoFaseRegistro
} from '../../utils/diaryPhasePresentation';

function DiaryPhaseIcon({ fase, size, aceitarFaseIndefinida = false }) {
    const tema = useTheme();
    const apresentacao = aceitarFaseIndefinida
        ? obterApresentacaoFaseRegistro(fase, tema)
        : obterApresentacaoFase(fase, tema);
    if (!apresentacao) return null;

    const Icone = apresentacao.Icone;
    return (
        <Icone
            testID={`diary-phase-icon-${fase ?? 'indefinida'}`}
            size={size}
            color={apresentacao.cor}
            weight={apresentacao.pesoIcone}
        />
    );
}

const MemoizedDiaryPhaseIcon = memo(DiaryPhaseIcon);

export { MemoizedDiaryPhaseIcon as DiaryPhaseIcon };
