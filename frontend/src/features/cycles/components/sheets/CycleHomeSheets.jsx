import { useDiaryCatalog } from '../../../diary/hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../../diary/hooks/useDiaryEntryForm';
import { useDiaryRecordForDate } from '../../hooks/useDiaryRecordForDate';
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
    const existente = useDiaryRecordForDate({
        date: data,
        service: reflexaoAberta ? diaryService : null,
        onSessionExpired: onSessaoExpirada
    });
    const formulario = useDiaryEntryForm({
        ativo: reflexaoAberta && Boolean(catalogo.catalogo) && !existente.loading,
        catalogo: catalogo.catalogo,
        service: diaryService,
        modo: existente.record ? 'editar' : 'criar',
        dataInicial: data,
        registroInicial: existente.record,
        onSalvo: aoFechar,
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
                salvando={formulario.salvando || existente.loading}
                erro={formulario.erros.anotacao_livre ?? formulario.erroSalvamento}
            />
            <GuidedBreathingSheet visivel={aberto === 'respiracao'} aoFechar={aoFechar} />
        </>
    );
}

export { CycleHomeSheets };
