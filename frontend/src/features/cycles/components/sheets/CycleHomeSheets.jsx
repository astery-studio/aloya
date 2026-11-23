import { CycleConfidenceSheet } from './CycleConfidenceSheet';
import { CyclePhaseEducationSheet } from './CyclePhaseEducationSheet';
import { DiaryReflectionSheet } from './DiaryReflectionSheet';
import { GuidedBreathingSheet } from './GuidedBreathingSheet';

function CycleHomeSheets({
    aberto,
    nivel,
    fase,
    reflexao,
    aoAlterarReflexao,
    aoSalvarReflexao,
    aoFechar
}) {
    return (
        <>
            <CycleConfidenceSheet
                visivel={aberto === 'confiabilidade'}
                nivel={nivel}
                aoFechar={aoFechar}
            />
            <CyclePhaseEducationSheet
                visivel={aberto === 'educacao'}
                fase={fase}
                aoFechar={aoFechar}
            />
            <DiaryReflectionSheet
                visivel={aberto === 'reflexao'}
                valor={reflexao}
                aoAlterar={aoAlterarReflexao}
                aoSalvar={aoSalvarReflexao}
                aoFechar={aoFechar}
            />
            <GuidedBreathingSheet visivel={aberto === 'respiracao'} aoFechar={aoFechar} />
        </>
    );
}

export { CycleHomeSheets };
