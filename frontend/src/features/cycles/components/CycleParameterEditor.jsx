import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { EditFieldSheet } from '../../../shared/components/feedback/EditFieldSheet/EditFieldSheet';

function CycleParameterEditor({
    visivel,
    label,
    valor,
    valorOriginal,
    erro,
    desabilitado,
    onAlterar,
    onCancelar,
    onSalvar
}) {
    const valorValido = Number.isSafeInteger(valor) && valor > 0;

    return (
        <EditFieldSheet
            visivel={visivel}
            titulo={`Editar ${label}`}
            tipo="numero"
            valor={valor}
            sufixo="dias"
            onAlterar={onAlterar}
            onFechar={onCancelar}
            erro={erro}
            salvando={desabilitado}
            rotuloAcessibilidade={label}
            botaoSalvar={
                <ButtonScreen
                    texto="Salvar"
                    variante="verde"
                    aoPressionar={onSalvar}
                    desativado={!valorValido || Boolean(erro) || valor === valorOriginal}
                />
            }
        />
    );
}

export { CycleParameterEditor };
