import { memo } from 'react';

import {
    obterApresentacaoFase,
    obterApresentacaoFaseRegistro
} from '../../utils/diaryPhasePresentation';

function DiaryPhaseIcon({ fase, size, aceitarFaseIndefinida = false }) {
    const apresentacao = aceitarFaseIndefinida
        ? obterApresentacaoFaseRegistro(fase)
        : obterApresentacaoFase(fase);
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
