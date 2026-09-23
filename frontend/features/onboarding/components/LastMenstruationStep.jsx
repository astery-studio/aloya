/**
 * Etapa que recebe o período da última menstruação por um calendário externo.
 */
import { useState } from 'react';
import { DatePickerSheet } from '../../../components/feedback/DatePickerSheet/DatePickerSheet';
import DateInput from '../../../components/forms/DateInput';
import OnboardingStep from './OnboardingStep';

function paraExibicao(data) {
    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

export default function LastMenstruationStep({
    valor, aoAlterar, aoVoltar, aoAvancar, renderizarCalendario,
    carregando
}) {
    return (
        <OnboardingStep etapa={2} titulo="Quando foi sua última menstruação?"
            descricao="Selecione o primeiro dia ou todos os dias do período."
            aoVoltar={aoVoltar} aoAvancar={aoAvancar}
            podeAvancar={Boolean(valor?.inicio)} carregando={carregando}>
            {renderizarCalendario?.({ valor, aoAlterar })}
        </OnboardingStep>
    );
}
