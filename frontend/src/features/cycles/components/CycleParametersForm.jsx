import { Text, View } from 'react-native';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { CycleParameterField } from './CycleParameterField';
import { estilos } from './CycleParametersForm.styles';

const CAMPOS = Object.freeze([
    { nome: 'duracaoCicloInformada', label: 'Duração do Ciclo' },
    { nome: 'duracaoMenstruacaoInformada', label: 'Duração da Menstruação' },
    { nome: 'duracaoLuteaInformada', label: 'Duração da Fase Lútea' }
]);

function CycleParametersForm({
    valores,
    erros = {},
    onAlterar,
    onSalvar,
    podeSalvar = false,
    salvando = false
}) {
    return (
        <View style={estilos.container}>
            <Text style={estilos.titulo}>Dados do Ciclo</Text>
            <View style={estilos.campos}>
                {CAMPOS.map(({ nome, label }) => (
                    <CycleParameterField
                        key={nome}
                        label={label}
                        valor={valores[nome]}
                        erro={erros[nome]}
                        onAlterar={(valor) => onAlterar(nome, valor)}
                        desabilitado={salvando}
                    />
                ))}
            </View>
            <ButtonScreen
                texto="Salvar alterações"
                variante="verde"
                aoPressionar={onSalvar}
                desativado={!podeSalvar}
                carregando={salvando}
            />
        </View>
    );
}

export { CAMPOS, CycleParametersForm };
