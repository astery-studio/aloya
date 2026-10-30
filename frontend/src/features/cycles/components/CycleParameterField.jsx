import { useState } from 'react';
import { Text, View } from 'react-native';

import { ProfileField } from '../../settings/profile/ProfileField';
import { CycleParameterEditor } from './CycleParameterEditor';
import { estilos } from './CycleParameterField.styles';

function CycleParameterField({ label, valor, erro, onAlterar, desabilitado = false }) {
    const [editando, setEditando] = useState(false);
    const [valorOriginal, setValorOriginal] = useState(valor);
    const valorValido = Number.isSafeInteger(valor) && valor > 0;

    function abrirEdicao() {
        setValorOriginal(valor);
        setEditando(true);
    }

    function cancelarEdicao() {
        onAlterar?.(valorOriginal);
        setEditando(false);
    }

    return (
        <>
            <View style={estilos.grupo}>
                <ProfileField
                    label={label}
                    valor={valorValido ? `${valor} dias` : 'Informe a duração'}
                    onPress={abrirEdicao}
                    desabilitado={desabilitado}
                />
                {erro ? (
                    <Text accessibilityRole="alert" style={estilos.erro}>
                        {erro}
                    </Text>
                ) : null}
            </View>

            <CycleParameterEditor
                visivel={editando}
                label={label}
                valor={valor}
                valorOriginal={valorOriginal}
                erro={erro}
                desabilitado={desabilitado}
                onAlterar={onAlterar}
                onCancelar={cancelarEdicao}
                onSalvar={() => setEditando(false)}
            />
        </>
    );
}

export { CycleParameterField };
