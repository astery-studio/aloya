import { useTheme } from '../../../shared/hooks/useTheme';
import { SelectionSheet } from '../../../shared/components/feedback/SelectionSheet/SelectionSheet';
import { PREFERENCIAS_TEMA } from '../../../shared/theme/themePreferences';

const OPCOES_TEMA = Object.freeze([
    Object.freeze({
        id: PREFERENCIAS_TEMA.automatico,
        label: 'Automático do Sistema'
    }),

    Object.freeze({
        id: PREFERENCIAS_TEMA.claro,
        label: 'Modo Claro'
    }),

    Object.freeze({
        id: PREFERENCIAS_TEMA.escuro,
        label: 'Modo Escuro'
    })
]);

function ThemePreferenceSheet({ visivel, preferencia, salvando = false, aoSelecionar, aoFechar }) {
    const tema = useTheme();

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
            titulo="Modo de Cor"
            opcoes={OPCOES_TEMA}
            valorSelecionado={preferencia}
            varianteOpcao="modoCor"
            corFundo={tema.escuro ? '#242424' : undefined}
            estiloPainel={
                tema.escuro
                    ? {
                          borderTopLeftRadius: 20,
                          borderTopRightRadius: 20,
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                          boxShadow: '0 -4px 32px 0 rgba(34, 34, 34, 0.10)'
                      }
                    : undefined
            }
            onSelecionar={selecionarPreferencia}
            onFechar={fechar}
        />
    );
}

export { OPCOES_TEMA, ThemePreferenceSheet };

export default ThemePreferenceSheet;
