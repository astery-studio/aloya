import { Text, View } from 'react-native';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { BottomSheet } from '../../../shared/components/feedback/BottomSheet/BottomSheet';
import NumberInput from '../../../shared/components/forms/NumberInput';
import { BottomSheetLayout } from '../../../shared/layouts/BottomSheet/BottomSheetLayout';
import { estilos } from './CycleParameterField.styles';

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
        <BottomSheet visivel={visivel} onFechar={onCancelar} bloquearFechamento={desabilitado}>
            <BottomSheetLayout titulo={`Editar ${label}`} onFechar={onCancelar}>
                <NumberInput
                    valor={valor}
                    aoAlterar={onAlterar}
                    unidade="dias"
                    desativado={desabilitado}
                    rotuloAcessibilidade={label}
                />
                {erro ? (
                    <Text accessibilityRole="alert" style={estilos.erroEdicao}>
                        {erro}
                    </Text>
                ) : null}
                <View style={estilos.acao}>
                    <ButtonScreen
                        texto="Salvar"
                        variante="verde"
                        aoPressionar={onSalvar}
                        desativado={!valorValido || Boolean(erro) || valor === valorOriginal}
                    />
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    );
}

export { CycleParameterEditor };
