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
    valor, aoAlterar, aoVoltar, aoAvancar, carregando
}) {
    const [campoAberto, setCampoAberto] = useState(null);
    const hoje = new Date().toISOString().slice(0, 10);
    const inicio = valor?.inicio || null;
    const fim = valor?.fim || null;

    async function selecionarData(data) {
        if (campoAberto === 'inicio') {
            aoAlterar({
                inicio: data,
                fim: fim && fim >= data ? fim : null
            });
        } else {
            aoAlterar({ inicio, fim: data });
        }
        return true;
    }

    return (
        <>
            <OnboardingStep etapa={2} titulo="Quando foi sua última menstruação?"
                descricao="Selecione o primeiro dia ou todos os dias do período."
                aoVoltar={aoVoltar} aoAvancar={aoAvancar}
                podeAvancar={Boolean(inicio)} carregando={carregando}>
                <DateInput valor={paraExibicao(inicio)}
                    rotuloAcessibilidade="Início da última menstruação"
                    aoPressionarCalendario={() => setCampoAberto('inicio')} />
                <DateInput valor={paraExibicao(fim)}
                    rotuloAcessibilidade="Fim da última menstruação"
                    desativado={!inicio}
                    aoPressionarCalendario={() => setCampoAberto('fim')} />
            </OnboardingStep>
            <DatePickerSheet
                visivel={campoAberto !== null}
                titulo={campoAberto === 'fim' ? 'Fim da menstruação' : 'Início da menstruação'}
                valorSelecionado={campoAberto === 'fim' ? fim : inicio}
                dataMinima={campoAberto === 'fim' ? inicio : null}
                dataMaxima={hoje}
                onSelecionar={selecionarData}
                onFechar={() => setCampoAberto(null)}
            />
        </>
    );
}
