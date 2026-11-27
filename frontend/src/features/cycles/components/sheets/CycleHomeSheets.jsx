import { useEffect, useMemo, useState } from 'react';
import { useDiaryCatalog } from '../../../diary/hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../../diary/hooks/useDiaryEntryForm';
import { useDiaryRecordForDate } from '../../hooks/useDiaryRecordForDate';
import { calcularCapacidadeAnotacao, montarAnotacaoHome } from '../../utils/diaryReflectionEntry';
import { CycleConfidenceSheet } from './CycleConfidenceSheet';
import { CyclePhaseEducationSheet } from './CyclePhaseEducationSheet';
import { DiaryReflectionSheet } from './DiaryReflectionSheet';
import { GuidedBreathingSheet } from './GuidedBreathingSheet';

function CycleHomeSheets({ aberto, nivel, fase, data, diaryService, onSessaoExpirada, aoFechar }) {
    const reflexaoAberta = aberto === 'reflexao';
    const [reflexao, setReflexao] = useState('');
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
    const anotacaoExistente = useMemo(
        () => existente.record?.categorias?.find(({ id }) => id === 'anotacao_livre')?.texto ?? '',
        [existente.record]
    );
    const capacidadeAnotacao = useMemo(
        () => calcularCapacidadeAnotacao(anotacaoExistente),
        [anotacaoExistente]
    );

    useEffect(() => {
        setReflexao('');
    }, [data, reflexaoAberta]);

    function salvarReflexao() {
        const anotacaoCompleta = montarAnotacaoHome({
            anotacaoExistente,
            texto: reflexao
        });
        if (!anotacaoCompleta) return false;
        return formulario.salvarComValores({ anotacao_livre: anotacaoCompleta });
    }

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
                aoAlterar={setReflexao}
                aoSalvar={salvarReflexao}
                aoFechar={aoFechar}
                limiteCaracteres={capacidadeAnotacao.limiteTexto}
                limiteContador={capacidadeAnotacao.limiteContador}
                caracteresEstruturais={capacidadeAnotacao.caracteresEstruturais}
                totalCaracteresExistentes={capacidadeAnotacao.caracteresExistentes}
                semEspaco={capacidadeAnotacao.semEspaco}
                salvando={formulario.salvando || existente.loading}
                erro={formulario.erros.anotacao_livre ?? formulario.erroSalvamento}
            />
            <GuidedBreathingSheet visivel={aberto === 'respiracao'} aoFechar={aoFechar} />
        </>
    );
}

export { CycleHomeSheets };
