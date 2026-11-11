import { useMemo } from 'react';

import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { useDiaryCatalog } from '../../hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../hooks/useDiaryEntryForm';
import { useDiaryPhase } from '../../hooks/useDiaryPhase';
import { NewDiaryEntryContent } from './NewDiaryEntryContent';
import { criarEstilos } from './NewDiaryEntryModal.styles';

function NewDiaryEntryModal({
    visivel,
    service,
    calendarService,
    onFechar,
    onCriado,
    onSessaoExpirada
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const catalogo = useDiaryCatalog({ ativo: visivel, service, onSessaoExpirada });
    const formulario = useDiaryEntryForm({
        ativo: visivel,
        catalogo: catalogo.catalogo,
        service,
        onSessaoExpirada,
        onCriado: (registro) => {
            onCriado?.(registro);
            onFechar?.();
        }
    });
    const fase = useDiaryPhase({
        ativo: visivel,
        data: formulario.data,
        service: calendarService,
        onSessaoExpirada
    });

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            bloquearFechamento={formulario.salvando}
            permitirDeslizarParaFechar
            estiloPainel={estilos.painel}
        >
            <NewDiaryEntryContent
                catalogo={catalogo.catalogo}
                carregando={catalogo.carregando}
                erroCatalogo={catalogo.erro}
                recarregar={catalogo.recarregar}
                formulario={formulario}
                fase={fase.fase}
                carregandoFase={fase.carregando}
            />
        </BottomSheet>
    );
}

export { NewDiaryEntryModal };
