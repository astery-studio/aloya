import { useDiaryCatalog } from '../../../diary/hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../../diary/hooks/useDiaryEntryForm';
import { CycleConfidenceSheet } from './CycleConfidenceSheet';
import { CyclePhaseEducationSheet } from './CyclePhaseEducationSheet';
import { DiaryReflectionSheet } from './DiaryReflectionSheet';
import { GuidedBreathingSheet } from './GuidedBreathingSheet';

function CycleHomeSheets({ aberto, nivel, fase, data, diaryService, onSessaoExpirada, aoFechar }) {
    const reflexaoAberta = aberto === 'reflexao';
    const catalogo = useDiaryCatalog({
        ativo: reflexaoAberta && Boolean(diaryService),
        service: diaryService,
        onSessaoExpirada
    });
    const formulario = useDiaryEntryForm({
        ativo: reflexaoAberta && Boolean(catalogo.catalogo),
        catalogo: catalogo.catalogo,
        service: diaryService,
        dataInicial: data,
        onCriado: aoFechar,
        onSessaoExpirada
    });
    const reflexao = formulario.valores.anotacao_livre ?? '';
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
                aoAlterar={(valor) => formulario.alterarValor('anotacao_livre', valor)}
                aoSalvar={formulario.salvar}
                aoFechar={aoFechar}
                salvando={formulario.salvando}
                erro={formulario.erros.anotacao_livre ?? formulario.erroSalvamento}
            />
            <GuidedBreathingSheet visivel={aberto === 'respiracao'} aoFechar={aoFechar} />
        </>
    );
}

export { CycleHomeSheets };
