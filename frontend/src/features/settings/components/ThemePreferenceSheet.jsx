import { SelectionSheet } from '../../../shared/components/feedback/SelectionSheet/SelectionSheet';
import { PREFERENCIAS_TEMA } from '../../../shared/theme/themePreferences';

const OPCOES_TEMA = Object.freeze([
    Object.freeze({
        id: PREFERENCIAS_TEMA.claro,
        label: 'Claro',
        descricao: 'Mantém a aparência clara do aplicativo.'
    }),

    Object.freeze({
        id: PREFERENCIAS_TEMA.escuro,
        label: 'Escuro',
        descricao: 'Mantém a aparência escura do aplicativo.'
    }),

    Object.freeze({
        id: PREFERENCIAS_TEMA.automatico,
        label: 'Automático',
        descricao: 'Segue a aparência configurada no dispositivo.'
    })
]);

function ThemePreferenceSheet({ visivel, preferencia, salvando = false, aoSelecionar, aoFechar }) {
    const podeSelecionar = typeof aoSelecionar === 'function' && !salvando;

    const podeFechar = typeof aoFechar === 'function' && !salvando;

    async function selecionarPreferencia(novaPreferencia) {
        if (!podeSelecionar) {
            return;
        }

        try {
            const sucesso = await aoSelecionar(novaPreferencia);

            if (sucesso !== false && typeof aoFechar === 'function') {
                aoFechar();
            }
        } catch {
            // O painel permanece aberto para que
            // a tela apresente a mensagem segura.
        }
    }

    function fechar() {
        if (podeFechar) {
            aoFechar();
        }
    }

    return (
        <SelectionSheet
            visivel={Boolean(visivel)}
            titulo="Aparência"
            opcoes={OPCOES_TEMA}
            valorSelecionado={preferencia}
            onSelecionar={selecionarPreferencia}
            onFechar={fechar}
        />
    );
}

export { OPCOES_TEMA, ThemePreferenceSheet };

export default ThemePreferenceSheet;
