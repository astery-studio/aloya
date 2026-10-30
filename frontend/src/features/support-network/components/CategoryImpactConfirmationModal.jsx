//Confirma uma alteração que será propagada aos contatos vinculados à categoria.
import { useCallback, useMemo } from 'react';

import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';

function ignorarAcao() {}

function CategoryImpactConfirmationModal({
    visivel,
    quantidadeContatos,
    carregando = false,
    onConfirmar,
    onCancelar
}) {
    const tema = useTheme();

    const quantidadeSegura =
        Number.isSafeInteger(quantidadeContatos) && quantidadeContatos > 0 ? quantidadeContatos : 0;

    const mensagem = useMemo(() => {
        const descricaoContatos =
            quantidadeSegura === 1
                ? '1 contato vinculado'
                : `${quantidadeSegura} contatos vinculados`;

        return `Esta alteração afetará imediatamente ${descricaoContatos} a esta categoria. Deseja continuar?`;
    }, [quantidadeSegura]);

    const confirmar = useCallback(() => {
        if (carregando || quantidadeSegura === 0 || typeof onConfirmar !== 'function') {
            return;
        }

        onConfirmar();
    }, [carregando, onConfirmar, quantidadeSegura]);

    const cancelar = useCallback(() => {
        if (carregando || typeof onCancelar !== 'function') {
            return;
        }

        onCancelar();
    }, [carregando, onCancelar]);

    return (
        <SimpleModal
            visivel={Boolean(visivel)}
            aoFechar={carregando ? ignorarAcao : cancelar}
            icone={WarningCircleIcon}
            corIcone={tema.cores.marca.primaria}
            fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
            titulo="Atualizar categoria"
            mensagem={mensagem}
            acaoPrincipal={{
                texto: 'Confirmar',
                variante: 'verde',
                aoPressionar: confirmar,
                carregando,
                desativado:
                    carregando || quantidadeSegura === 0 || typeof onConfirmar !== 'function'
            }}
            acaoSecundaria={{
                texto: 'Cancelar',
                variante: 'branco',
                aoPressionar: cancelar,
                desativado: carregando || typeof onCancelar !== 'function'
            }}
        />
    );
}

export { CategoryImpactConfirmationModal };
