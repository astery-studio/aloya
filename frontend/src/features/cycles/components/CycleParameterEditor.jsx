import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { EditFieldSheet } from '../../../shared/components/feedback/EditFieldSheet/EditFieldSheet';
import NumberInput from '../../../shared/components/forms/NumberInput';

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
            onFechar={onCancelar}
            erro={erro}
            salvando={desabilitado}
            botaoSalvar={
                <ButtonScreen
                    texto="Salvar"
                    variante="verde"
                    aoPressionar={onSalvar}
                    desativado={!valorValido || Boolean(erro) || valor === valorOriginal}
                />
            }
        >
            <NumberInput
                valor={valor}
                aoAlterar={onAlterar}
                unidade="dias"
                desativado={desabilitado}
                rotuloAcessibilidade={label}
            />
        </EditFieldSheet>
    );
}

export { CycleParameterEditor };
